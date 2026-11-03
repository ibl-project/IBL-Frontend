import {
  type MatchSnapshot,
  type PlayerLine,
  type PlayerQuarterLine,
  type QuarterScore,
  type StatCounts,
  type StatKey,
  STAT_KEYS,
} from "@/lib/matchesApi";
import type { OutboxItem } from "@/lib/scoringOutbox";

/** Angka dari server setelah satu ketukan (respons POST /actions, event score_update). */
export interface ServerLine {
  player: PlayerLine;
  playerQuarter?: PlayerQuarterLine & { quarter: number };
  team1Score?: number;
  team2Score?: number;
  quarterScore?: QuarterScore;
}

/**
 * Ganti baris satu pemain (Total + periodenya) dengan angka dari server.
 * Skor tim (Total + periode) ikut diganti kalau `withScores` true.
 */
export function withServerLine(snapshot: MatchSnapshot, data: ServerLine, withScores = true): MatchSnapshot {
  const { player: line, playerQuarter, quarterScore } = data;
  const patch = (side: MatchSnapshot["team1"], score: number | undefined, periodScore: number | undefined) => {
    const quarterScores = [...side.quarterScores];
    if (withScores && quarterScore && periodScore !== undefined) {
      while (quarterScores.length < quarterScore.quarter) quarterScores.push(0);
      quarterScores[quarterScore.quarter - 1] = periodScore;
    }
    return {
      ...side,
      score: withScores ? (score ?? side.score) : side.score,
      quarterScores,
      players: side.players.map((player) => {
        if (player.id !== line.id) return player;
        const quarters = playerQuarter
          ? { ...player.quarters, [playerQuarter.quarter]: playerQuarter }
          : player.quarters;
        return { ...player, ...line, quarters };
      }),
    };
  };
  return {
    ...snapshot,
    team1: patch(snapshot.team1, data.team1Score, quarterScore?.team1),
    team2: patch(snapshot.team2, data.team2Score, quarterScore?.team2),
  };
}

const pointsOf = (counts: StatCounts) => counts.twoPointMade * 2 + counts.threePointMade * 3 + counts.freethrowMade;

const emptyQuarterLine = (): PlayerQuarterLine => ({
  ...(Object.fromEntries(STAT_KEYS.map((key) => [key, 0])) as StatCounts),
  points: 0,
});

/** Tambah/kurangi satu statistik di periode `quarter` secara lokal (sebelum server menjawab). */
export function applyStep(
  snapshot: MatchSnapshot,
  side: 1 | 2,
  playerId: string,
  stat: StatKey,
  delta: 1 | -1,
  quarter: number,
): MatchSnapshot {
  const key = side === 1 ? "team1" : "team2";
  const team = snapshot[key];
  const players = team.players.map((player): PlayerLine => {
    if (player.id !== playerId) return player;
    const total = { ...player, [stat]: Math.max(0, player[stat] + delta) };
    const before = player.quarters?.[quarter] ?? emptyQuarterLine();
    const after = { ...before, [stat]: Math.max(0, before[stat] + delta) };
    return {
      ...total,
      points: pointsOf(total),
      quarters: { ...player.quarters, [quarter]: { ...after, points: pointsOf(after) } },
    };
  });
  const quarterScores = [...team.quarterScores];
  while (quarterScores.length < quarter) quarterScores.push(0);
  quarterScores[quarter - 1] = players.reduce((sum, player) => sum + (player.quarters?.[quarter]?.points ?? 0), 0);
  return {
    ...snapshot,
    [key]: { ...team, players, quarterScores, score: players.reduce((sum, player) => sum + player.points, 0) },
  };
}

/**
 * Kunci satu periode secara lokal; periode aktif pindah ke periode terbuka
 * terkecil berikutnya (sama dengan `lockOutcome` "continue" di backend). Hanya
 * untuk periode yang bukan periode terbuka terakhir.
 */
export function applyLock(snapshot: MatchSnapshot, quarter: number): MatchSnapshot {
  const quarters = snapshot.quarters.map((period) =>
    period.quarter === quarter && !period.locked
      ? { ...period, locked: true, lockedAt: new Date().toISOString() }
      : period,
  );
  const open = quarters.filter((period) => !period.locked).map((period) => period.quarter);
  return { ...snapshot, quarters, currentQuarter: open.length > 0 ? Math.min(...open) : null };
}

/**
 * Terapkan ulang antrean yang belum terkirim di atas angka dari server, supaya
 * snapshot baru (SSE tersambung lagi, muat ulang) tidak menghapus ketukan yang
 * masih antre. `withTaps` false = hanya kunci periode (untuk event periode,
 * yang angka skornya sudah memuat ketukan antre).
 */
export function replayOutbox(snapshot: MatchSnapshot, items: readonly OutboxItem[], withTaps: boolean): MatchSnapshot {
  return items.reduce((current, item) => {
    if (item.kind === "lock") return applyLock(current, item.quarter);
    if (!withTaps) return current;
    const side = item.teamId === current.team1.id ? 1 : item.teamId === current.team2.id ? 2 : null;
    return side ? applyStep(current, side, item.playerId, item.actionType, item.delta, item.quarter) : current;
  }, snapshot);
}

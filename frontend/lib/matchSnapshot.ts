import type { MatchSnapshot, PlayerLine, PlayerQuarterLine, QuarterScore } from "@/lib/matchesApi";

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

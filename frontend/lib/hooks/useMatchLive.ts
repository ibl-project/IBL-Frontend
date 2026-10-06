import { useCallback, useEffect, useRef, useState } from "react";

import { API_URL } from "@/lib/apiClient";
import {
  type MatchSnapshot,
  type PlayerLine,
  type PlayerQuarterLine,
  type QuarterScore,
  type QuarterState,
  getMatch,
} from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";

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

/**
 * Keadaan satu match dari GET /matches/:id, lalu diperbarui lewat SSE
 * /matches/:id/live: nama pemain baru (roster_updated), warna, kunci/buka
 * periode, reset periode, reset match.
 *
 * Event skor diabaikan kalau `ignoreScoreEvents` true: pemegang sesi sudah
 * punya angka terbaru dari jawaban tiap ketukannya sendiri (dan event yang
 * datang terlambat bisa menimpa ketukan yang masih antre).
 */
export function useMatchLive(matchId: string, ignoreScoreEvents: boolean) {
  const [snapshot, setSnapshot] = useState<MatchSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const ignoreRef = useRef(ignoreScoreEvents);

  useEffect(() => {
    ignoreRef.current = ignoreScoreEvents;
  }, [ignoreScoreEvents]);

  useEffect(() => {
    let active = true;
    getMatch(matchId).then(
      (data) => {
        if (active) {
          setSnapshot(data);
          setError(null);
        }
      },
      (failure: unknown) => {
        if (active) setError(errorMessage(failure));
      },
    );

    const source = new EventSource(`${API_URL}/matches/${matchId}/live`);
    const on = <T,>(event: string, handle: (data: T) => void) =>
      source.addEventListener(event, (message) => {
        if (active) handle(JSON.parse((message as MessageEvent<string>).data) as T);
      });

    on<MatchSnapshot>("snapshot", setSnapshot);
    on<MatchSnapshot>("roster_updated", setSnapshot);
    // Banyak baris berubah sekaligus: server mengirim snapshot lengkap.
    on<MatchSnapshot>("quarter_reset", setSnapshot);
    on<MatchSnapshot>("match_reset", setSnapshot);
    const onScore = (data: ServerLine) => {
      if (ignoreRef.current) return;
      setSnapshot((current) => (current ? withServerLine(current, data) : current));
    };
    on("score_update", onScore);
    on("action_voided", onScore);
    on<{ team1Color: string; team2Color: string }>("match_colors_updated", (data) =>
      setSnapshot((current) =>
        current
          ? {
              ...current,
              team1: { ...current.team1, color: data.team1Color },
              team2: { ...current.team2, color: data.team2Color },
            }
          : current,
      ),
    );
    on<{ team1Score: number; team2Score: number; finishedAt: string }>("match_finalized", (data) =>
      setSnapshot((current) =>
        current
          ? {
              ...current,
              status: "FINISHED",
              locked: true,
              currentQuarter: null,
              quarters: current.quarters.map((quarter) => ({ ...quarter, locked: true })),
              finishedAt: data.finishedAt,
              team1: { ...current.team1, score: data.team1Score },
              team2: { ...current.team2, score: data.team2Score },
            }
          : current,
      ),
    );
    on("match_unlocked", () => setSnapshot((current) => (current ? { ...current, locked: false } : current)));
    const onQuarters = (data: { quarters: QuarterState[]; currentQuarter: number | null }) =>
      setSnapshot((current) =>
        current ? { ...current, quarters: data.quarters, currentQuarter: data.currentQuarter } : current,
      );
    on("quarter_locked", onQuarters);
    on("quarter_unlocked", onQuarters);

    return () => {
      active = false;
      source.close();
    };
  }, [matchId, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { snapshot, setSnapshot, error, reload };
}

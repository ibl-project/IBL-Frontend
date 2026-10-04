import { useCallback, useEffect, useRef, useState } from "react";

import { API_URL } from "@/lib/apiClient";
import { type MatchSnapshot, type PlayerLine, getMatch } from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";

/** Ganti baris satu pemain dan skor tim dengan angka dari server. */
export function withServerLine(
  snapshot: MatchSnapshot,
  line: PlayerLine,
  scores?: { team1Score: number; team2Score: number },
): MatchSnapshot {
  const patch = (side: MatchSnapshot["team1"], score: number | undefined) => ({
    ...side,
    score: score ?? side.score,
    players: side.players.map((player) => (player.id === line.id ? { ...player, ...line } : player)),
  });
  return {
    ...snapshot,
    team1: patch(snapshot.team1, scores?.team1Score),
    team2: patch(snapshot.team2, scores?.team2Score),
  };
}

/**
 * Keadaan satu match dari GET /matches/:id, lalu diperbarui lewat SSE
 * /matches/:id/live: nama pemain baru (roster_updated), warna, lock/unlock.
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
    const onScore = (data: { player: PlayerLine; team1Score: number; team2Score: number }) => {
      if (ignoreRef.current) return;
      setSnapshot((current) => (current ? withServerLine(current, data.player, data) : current));
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
              finishedAt: data.finishedAt,
              team1: { ...current.team1, score: data.team1Score },
              team2: { ...current.team2, score: data.team2Score },
            }
          : current,
      ),
    );
    on("match_unlocked", () => setSnapshot((current) => (current ? { ...current, locked: false } : current)));

    return () => {
      active = false;
      source.close();
    };
  }, [matchId, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { snapshot, setSnapshot, error, reload };
}

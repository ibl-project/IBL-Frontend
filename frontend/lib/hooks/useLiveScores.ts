import { useEffect } from "react";

import type { MatchListItem, MatchSnapshot } from "@/lib/matchesApi";
import { openMatchStream } from "./useMatchLive";

type Scores = { team1Score: number; team2Score: number };
type ListUpdate = (update: (items: MatchListItem[]) => MatchListItem[]) => void;

/** Skor (dan status saat selesai/di-reset) satu kartu match, dari event SSE. */
function patchItem(
  items: MatchListItem[],
  id: string,
  { team1Score, team2Score }: Scores,
  fields: Partial<Pick<MatchListItem, "status" | "locked" | "finishedAt">> = {},
): MatchListItem[] {
  return items.map((match) => {
    if (match.id !== id) return match;
    const status = fields.status ?? match.status;
    // Pemenang dihitung di sini supaya tim yang kalah langsung diredupkan tanpa menunggu refresh.
    const winnerTeamId =
      status === "FINISHED" && team1Score !== team2Score
        ? (team1Score > team2Score ? match.team1.id : match.team2.id)
        : match.winnerTeamId;
    return {
      ...match,
      ...fields,
      winnerTeamId,
      team1: { ...match.team1, score: team1Score },
      team2: { ...match.team2, score: team2Score },
    };
  });
}

/**
 * Skor kartu match LIVE di daftar jadwal, langsung dari SSE /matches/:id/live: satu koneksi
 * per match LIVE yang tampil (biasanya 1–2). `update` harus stabil (useCallback).
 */
export function useLiveScores(matchIds: string[], update: ListUpdate) {
  const key = matchIds.join(",");

  useEffect(() => {
    if (!key) return;
    const closers = key.split(",").map((id) => {
      const scores = (data: Scores) => update((items) => patchItem(items, id, data));
      const fromSnapshot = (data: MatchSnapshot) =>
        update((items) =>
          patchItem(items, id, { team1Score: data.team1.score, team2Score: data.team2.score }, {
            status: data.status,
            locked: data.locked,
          }),
        );
      return openMatchStream(id, {
        snapshot: fromSnapshot,
        quarter_reset: fromSnapshot,
        match_reset: fromSnapshot,
        score_update: scores,
        action_voided: scores,
        match_finalized: (data: Scores & { finishedAt: string }) =>
          update((items) =>
            patchItem(items, id, data, { status: "FINISHED", locked: true, finishedAt: data.finishedAt }),
          ),
      });
    });
    return () => closers.forEach((close) => close());
  }, [key, update]);
}

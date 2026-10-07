import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { claimSession, releaseSession } from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";

export type SessionState =
  | { status: "idle" }
  | { status: "claiming" }
  /** Akun ini pemegang sesi: boleh mengubah skor. */
  | { status: "mine" }
  /** Dipegang akun lain; dicek ulang berkala. */
  | { status: "busy"; holderName: string }
  | { status: "locked" }
  | { status: "error"; message: string };

const BUSY_RETRY_MS = 15_000;
const ERROR_RETRY_MS = 10_000;

/**
 * Pegang sesi scoring satu match selama komponen terpasang.
 *
 * - Klaim saat mulai, lalu perpanjang tiap `heartbeatSeconds` dari backend.
 * - Kalau dipegang akun lain: status "busy", dicek lagi tiap 15 detik.
 * - Dilepas saat match lain dipilih, halaman ditinggal, atau tab ditutup
 *   (request `keepalive`). Kalau laptop mati, sesi habis sendiri di backend.
 *
 * `matchId` null = tidak memegang sesi apa pun.
 */
export function useScoringSession(matchId: string | null) {
  const [state, setState] = useState<{ matchId: string | null; value: SessionState }>({
    matchId: null,
    value: { status: "idle" },
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    let held = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const set = (value: SessionState) => setState({ matchId, value });

    const tick = async () => {
      try {
        const session = await claimSession(matchId);
        // Klaim yang selesai setelah komponen dilepas dibiarkan habis sendiri.
        if (cancelled) return;
        held = true;
        set({ status: "mine" });
        timer = setTimeout(tick, session.heartbeatSeconds * 1000);
      } catch (error) {
        if (cancelled) return;
        held = false;
        if (error instanceof ApiError && error.code === "SCORING_IN_USE") {
          set({ status: "busy", holderName: error.details?.holderName ?? "akun lain" });
          timer = setTimeout(tick, BUSY_RETRY_MS);
        } else if (error instanceof ApiError && error.code === "MATCH_LOCKED") {
          set({ status: "locked" });
        } else {
          set({ status: "error", message: errorMessage(error) });
          timer = setTimeout(tick, ERROR_RETRY_MS);
        }
      }
    };
    void tick();

    const releaseOnExit = () => {
      if (held) void releaseSession(matchId, true).catch(() => undefined);
    };
    window.addEventListener("pagehide", releaseOnExit);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pagehide", releaseOnExit);
      if (held) void releaseSession(matchId).catch(() => undefined);
    };
  }, [matchId, attempt]);

  /** Cek ulang sekarang, mis. setelah aksi ditolak karena sesi hilang. */
  const recheck = useCallback(() => setAttempt((value) => value + 1), []);

  const value: SessionState =
    !matchId ? { status: "idle" } : state.matchId === matchId ? state.value : { status: "claiming" };

  return { session: value, recheck };
}

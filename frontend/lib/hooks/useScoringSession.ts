import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { claimSession, releaseSession } from "@/lib/matchesApi";
import { errorMessage, isConnectionError } from "@/lib/errors";
import { hasOutbox } from "@/lib/scoringOutbox";

export type SessionState =
  | { status: "idle" }
  | { status: "claiming" }
  /**
   * Akun ini pemegang sesi: boleh mengubah skor. `offline`: belum dikonfirmasi
   * server (koneksi putus, atau antrean lama sedang dicek lebih dulu); tetap
   * dianggap milik sendiri karena backend menerima pemegang lama selama belum
   * diambil akun lain.
   */
  | { status: "mine"; offline?: boolean }
  /** Dipegang akun lain; dicek ulang berkala. */
  | { status: "busy"; holderName: string }
  | { status: "locked" }
  | { status: "error"; message: string };

const BUSY_RETRY_MS = 15_000;
const ERROR_RETRY_MS = 10_000;
// Cek ulang selama antrean di laptop ini sedang dikirim.
const OUTBOX_WAIT_MS = 3_000;

/**
 * Pegang sesi scoring satu match selama komponen terpasang.
 *
 * - Klaim saat mulai, lalu perpanjang tiap `heartbeatSeconds` dari backend.
 * - Kalau dipegang akun lain: status "busy", dicek lagi tiap 15 detik.
 * - Koneksi putus setelah sesi didapat: tetap "mine" (dengan `offline`), dicek
 *   lagi tiap 10 detik, supaya scorer tetap bisa mengisi skor.
 * - Setelah koneksi putus, atau saat desk dibuka dengan antrean lama di laptop
 *   ini, sesi TIDAK diklaim ulang selama antrean belum kosong. Antrean yang
 *   bertanya ke server lebih dulu: kalau sesi sempat diambil atau dilepas dari
 *   laptop lain, backend menolaknya dan antrean berhenti (useAutoSaveActions).
 *   Klaim ulang lebih dulu akan membuat backend menerima antrean itu diam-diam,
 *   padahal skornya mungkin sudah diinput ulang akun lain.
 * - Dilepas saat match lain dipilih, halaman ditinggal, atau tab ditutup
 *   (request `keepalive`), KECUALI masih ada antrean scoring match itu di
 *   laptop ini (lib/scoringOutbox.ts): antrean itu butuh sesi ini untuk
 *   terkirim. Kalau laptop mati, sesi habis sendiri di backend.
 *
 * `matchId` null = tidak memegang sesi apa pun.
 */
export function useScoringSession(matchId: string | null, userId: string) {
  const [state, setState] = useState<{ matchId: string | null; value: SessionState }>({
    matchId: null,
    value: { status: "idle" },
  });
  const [attempt, setAttempt] = useState(0);
  // true = cek ulang yang diminta (mis. antrean ditolak): klaim langsung walau ada antrean.
  const forcedRef = useRef(false);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    let held = false;
    // Belum dikonfirmasi server sejak koneksi putus / antrean lama ditemukan.
    let unconfirmed = !forcedRef.current && hasOutbox(userId, matchId);
    forcedRef.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const set = (value: SessionState) => setState({ matchId, value });

    const tick = async () => {
      if (unconfirmed && hasOutbox(userId, matchId)) {
        held = true;
        set({ status: "mine", offline: true });
        timer = setTimeout(tick, OUTBOX_WAIT_MS);
        return;
      }
      try {
        const session = await claimSession(matchId);
        // Klaim yang selesai setelah komponen dilepas dibiarkan habis sendiri.
        if (cancelled) return;
        unconfirmed = false;
        held = true;
        set({ status: "mine" });
        timer = setTimeout(tick, session.heartbeatSeconds * 1000);
      } catch (error) {
        if (cancelled) return;
        if (held && isConnectionError(error)) {
          unconfirmed = true;
          set({ status: "mine", offline: true });
          timer = setTimeout(tick, ERROR_RETRY_MS);
          return;
        }
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
    timer = setTimeout(tick, 0);

    const shouldRelease = () => held && !hasOutbox(userId, matchId);
    const releaseOnExit = () => {
      if (shouldRelease()) void releaseSession(matchId, true).catch(() => undefined);
    };
    window.addEventListener("pagehide", releaseOnExit);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pagehide", releaseOnExit);
      if (shouldRelease()) void releaseSession(matchId).catch(() => undefined);
    };
  }, [matchId, userId, attempt]);

  /** Cek ulang sekarang, mis. setelah aksi ditolak karena sesi hilang. */
  const recheck = useCallback(() => {
    forcedRef.current = true;
    setAttempt((value) => value + 1);
  }, []);

  const value: SessionState =
    !matchId ? { status: "idle" } : state.matchId === matchId ? state.value : { status: "claiming" };

  return { session: value, recheck };
}

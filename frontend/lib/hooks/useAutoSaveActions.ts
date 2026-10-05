import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { type MatchSnapshot, type StatKey, recordAction } from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";
import { withServerLine } from "./useMatchLive";

export interface PendingAction {
  actionId: string;
  playerId: string;
  teamId: string;
  actionType: StatKey;
  delta: 1 | -1;
}

export type SaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved" }
  | { state: "retrying" }
  | { state: "failed"; message: string };

const MAX_RETRIES = 8;

/** UUID v4 untuk actionId; crypto.randomUUID hanya ada di HTTPS/localhost. */
export function newActionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Auto-save setiap ketukan ◀ ▶ di scoring desk.
 *
 * Ketukan langsung tampil di layar (optimis), lalu dikirim satu per satu
 * sesuai urutan. Gagal karena jaringan/server → dikirim ulang dengan actionId
 * yang SAMA, jadi backend tidak pernah menghitungnya dua kali. Ditolak
 * (sesi diambil akun lain, match dikunci, statistik sudah 0) → antrean
 * dibuang dan `onRejected` dipanggil supaya layar memuat ulang angka server.
 */
export function useAutoSaveActions(
  matchId: string,
  setSnapshot: Dispatch<SetStateAction<MatchSnapshot | null>>,
  onRejected: (error: unknown) => void,
) {
  const queueRef = useRef<PendingAction[]>([]);
  const runningRef = useRef(false);
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });
  const [pending, setPending] = useState(0);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setStatus({ state: "saving" });
    let attempts = 0;

    while (queueRef.current.length > 0) {
      const item = queueRef.current[0];
      try {
        const result = await recordAction(matchId, item);
        queueRef.current.shift();
        setPending(queueRef.current.length);
        attempts = 0;
        // Pakai angka server hanya kalau tidak ada ketukan lain untuk pemain
        // ini yang masih antre (kalau ada, angka server masih tertinggal).
        if (!queueRef.current.some((next) => next.playerId === item.playerId)) {
          setSnapshot((current) => (current ? withServerLine(current, result.player, result) : current));
        }
      } catch (error) {
        const retryable = !(error instanceof ApiError) || error.status === 0 || error.status >= 500;
        if (retryable && attempts < MAX_RETRIES) {
          attempts += 1;
          setStatus({ state: "retrying" });
          await new Promise((resolve) => setTimeout(resolve, Math.min(500 * 2 ** attempts, 8000)));
          continue;
        }
        queueRef.current = [];
        setPending(0);
        runningRef.current = false;
        setStatus({ state: "failed", message: errorMessage(error) });
        onRejected(error);
        return;
      }
    }

    runningRef.current = false;
    setStatus({ state: "saved" });
  }, [matchId, setSnapshot, onRejected]);

  const enqueue = useCallback(
    (action: Omit<PendingAction, "actionId">) => {
      queueRef.current.push({ ...action, actionId: newActionId() });
      setPending(queueRef.current.length);
      void run();
    },
    [run],
  );

  // Peringatkan kalau tab ditutup saat masih ada ketukan yang belum terkirim.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (queueRef.current.length > 0) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  return { enqueue, status, pending };
}

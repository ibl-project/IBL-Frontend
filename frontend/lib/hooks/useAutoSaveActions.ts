import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { type MatchSnapshot, type StatKey, lockQuarter, recordAction } from "@/lib/matchesApi";
import { errorMessage, isConnectionError } from "@/lib/errors";
import { replayOutbox, withServerLine } from "@/lib/matchSnapshot";
import {
  type OutboxItem,
  type OutboxTap,
  deleteOutboxItem,
  loadOutbox,
  nextSeq,
  saveOutboxItem,
} from "@/lib/scoringOutbox";

export interface PendingAction {
  playerId: string;
  teamId: string;
  /** Periode tempat ketukan dicatat (periode aktif saat diketuk). */
  quarter: number;
  actionType: StatKey;
  delta: 1 | -1;
}

export type SaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved" }
  /** Server tidak terjangkau; antrean dikirim ulang terus sampai berhasil. */
  | { state: "offline" }
  /** Pengiriman dihentikan (sesi diambil akun lain, match/periode berubah). Antrean tetap disimpan. */
  | { state: "conflict"; message: string };

// Jeda kirim ulang; setelah itu tetap 15 detik, tanpa batas percobaan.
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000];

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
 * retry    : jaringan/server bermasalah, kirim ulang nanti
 * session  : login perlu diperbarui (halaman pindah ke login), kirim ulang nanti
 * drop     : ketukan ini sendiri ditolak (pemain bukan anggota tim, statistik sudah 0)
 * conflict : keadaan match berubah dari luar, termasuk sesi yang sempat diambil
 *            atau dilepas dari laptop lain (SCORING_SESSION_REQUIRED); berhenti
 *            sampai panitia memutuskan, karena skornya mungkin sudah diinput ulang
 */
function classify(error: unknown): "retry" | "session" | "drop" | "conflict" {
  if (isConnectionError(error)) return "retry";
  const apiError = error as ApiError;
  if (apiError.status === 401) return "session";
  if (apiError.status === 400 || apiError.status === 422) return "drop";
  return "conflict";
}

function conflictMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "SCORING_SESSION_REQUIRED") {
    return "Sesi scoring match ini sempat lepas dari akun ini (diambil atau dilepas dari laptop lain) selama koneksi terputus.";
  }
  return errorMessage(error);
}

interface AutoSaveOptions {
  matchId: string;
  /** Pemilik antrean di laptop ini (akun yang login). */
  userId: string;
  /** Kirim hanya saat akun ini pemegang sesi scoring. */
  canSend: boolean;
  setSnapshot: Dispatch<SetStateAction<MatchSnapshot | null>>;
  /** Sesi perlu dicek ulang (ditolak karena sesi, atau berhenti karena konflik). */
  onSessionLost: (error: unknown) => void;
  /** Satu ketukan ditolak server dan dibuang; antrean lain tetap dikirim. */
  onDropped: (item: OutboxTap, error: unknown) => void;
  /** Save and Lock dari antrean sudah diterima server. */
  onLocked: () => void;
}

/**
 * Auto-save scoring desk lewat antrean di laptop (lib/scoringOutbox.ts).
 *
 * Ketukan langsung tampil di layar (optimis), disimpan ke localStorage, lalu
 * dikirim satu per satu sesuai urutan. Gagal karena jaringan/server → dikirim
 * ulang tanpa batas dengan actionId yang SAMA, jadi backend tidak pernah
 * menghitungnya dua kali. Antrean hanya dihapus per item setelah server
 * menjawab, atau kalau panitia menekan "Buang".
 *
 * Save and Lock periode yang bukan periode terbuka terakhir juga lewat
 * antrean (setelah ketukan periode itu), jadi bisa ditekan saat offline.
 */
export function useAutoSaveActions({
  matchId,
  userId,
  canSend,
  setSnapshot,
  onSessionLost,
  onDropped,
  onLocked,
}: AutoSaveOptions) {
  // Antrean dari sesi sebelumnya (tab ditutup / reload / laptop mati) ikut dikirim.
  const [initial] = useState(() => loadOutbox(userId, matchId));
  const queueRef = useRef<OutboxItem[]>(initial);
  const [items, setItems] = useState<OutboxItem[]>(initial);
  const [status, setStatus] = useState<SaveStatus>({ state: initial.length > 0 ? "saving" : "idle" });
  const [persisted, setPersisted] = useState(true);
  const [browserOffline, setBrowserOffline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine === false,
  );

  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const activeRef = useRef(true);
  const canSendRef = useRef(canSend);
  const wakeRef = useRef<(() => void) | null>(null);
  const callbacksRef = useRef({ setSnapshot, onSessionLost, onDropped, onLocked });

  useEffect(() => {
    callbacksRef.current = { setSnapshot, onSessionLost, onDropped, onLocked };
  });

  const sync = useCallback(() => setItems([...queueRef.current]), []);

  const finish = useCallback(
    (item: OutboxItem) => {
      queueRef.current = queueRef.current.filter((next) => next.seq !== item.seq);
      deleteOutboxItem(userId, matchId, item.seq);
      sync();
    },
    [userId, matchId, sync],
  );

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    let attempts = 0;

    // Jeda kirim ulang yang bisa dipotong (wifi kembali, tab dibuka lagi, komponen dilepas).
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const done = () => {
          clearTimeout(timer);
          if (wakeRef.current === done) wakeRef.current = null;
          resolve();
        };
        const timer = setTimeout(done, ms);
        wakeRef.current = done;
      });

    while (queueRef.current.length > 0 && activeRef.current && canSendRef.current && !pausedRef.current) {
      const item = queueRef.current[0];
      if (attempts === 0) setStatus({ state: "saving" });
      try {
        if (item.kind === "tap") {
          const result = await recordAction(matchId, {
            actionId: item.actionId,
            playerId: item.playerId,
            teamId: item.teamId,
            quarter: item.quarter,
            actionType: item.actionType,
            delta: item.delta,
          });
          finish(item);
          // Jawaban "sudah pernah diproses" tidak membawa baris pemain; layar
          // sudah berisi ketukan ini, jadi tidak ada yang perlu diganti.
          // Angka server untuk pemain ini dipakai hanya kalau tidak ada ketukan
          // lain untuknya yang masih antre; skor tim kalau ketukan habis.
          const taps = queueRef.current.filter((next) => next.kind === "tap");
          if (!result.duplicate && !taps.some((next) => next.playerId === item.playerId)) {
            const withScores = taps.length === 0;
            callbacksRef.current.setSnapshot((current) =>
              current ? withServerLine(current, result, withScores) : current,
            );
          }
        } else {
          // Periode yang sudah terkunci dijawab `alreadyLocked`, jadi kirim ulang aman.
          await lockQuarter(matchId, item.quarter);
          finish(item);
          callbacksRef.current.onLocked();
        }
        attempts = 0;
      } catch (error) {
        const kind = classify(error);
        if (kind === "drop" && item.kind === "tap") {
          finish(item);
          callbacksRef.current.onDropped(item, error);
          continue;
        }
        if (kind === "drop" || kind === "conflict") {
          pausedRef.current = true;
          setStatus({ state: "conflict", message: conflictMessage(error) });
          callbacksRef.current.onSessionLost(error);
          break;
        }
        if (kind === "session" && attempts === 0) callbacksRef.current.onSessionLost(error);
        if (kind === "retry") setStatus({ state: "offline" });
        attempts += 1;
        await sleep(RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length) - 1]);
      }
    }

    runningRef.current = false;
    if (queueRef.current.length === 0 && !pausedRef.current) setStatus({ state: "saved" });
  }, [matchId, finish]);

  const add = useCallback(
    (item: OutboxItem) => {
      queueRef.current = [...queueRef.current, item];
      if (!saveOutboxItem(userId, matchId, item)) setPersisted(false);
      sync();
      void run();
    },
    [userId, matchId, sync, run],
  );

  const enqueue = useCallback(
    (action: PendingAction) =>
      add({ kind: "tap", seq: nextSeq(), actionId: newActionId(), ...action, createdAt: new Date().toISOString() }),
    [add],
  );

  /** Save and Lock lewat antrean. Pemanggil yang memastikan ini bukan periode terbuka terakhir. */
  const enqueueLock = useCallback(
    (quarter: number) => add({ kind: "lock", seq: nextSeq(), quarter, createdAt: new Date().toISOString() }),
    [add],
  );

  /** Lanjutkan pengiriman setelah konflik (mis. sesi sudah kembali ke akun ini). */
  const retry = useCallback(() => {
    pausedRef.current = false;
    setStatus({ state: "saving" });
    void run();
  }, [run]);

  /** Buang seluruh antrean match ini dari laptop (setelah konfirmasi panitia). */
  const discard = useCallback(() => {
    for (const item of queueRef.current) deleteOutboxItem(userId, matchId, item.seq);
    queueRef.current = [];
    pausedRef.current = false;
    sync();
    setStatus({ state: "idle" });
  }, [userId, matchId, sync]);

  /** Snapshot server + antrean di atasnya (untuk `useMatchLive`). Saat konflik: angka server apa adanya. */
  const replay = useCallback(
    (snapshot: MatchSnapshot, withTaps: boolean) =>
      pausedRef.current ? snapshot : replayOutbox(snapshot, queueRef.current, withTaps),
    [],
  );

  // Mulai kirim saat desk dibuka (antrean lama) dan saat sesi kembali milik akun ini.
  useEffect(() => {
    canSendRef.current = canSend;
    if (!canSend) return;
    const timer = setTimeout(() => void run(), 0);
    return () => clearTimeout(timer);
  }, [canSend, run]);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      wakeRef.current?.();
    };
  }, []);

  // Wifi kembali atau tab dibuka lagi: kirim sekarang, tidak menunggu jeda.
  // `navigator.onLine` hanya petunjuk untuk tampilan (bisa true walau internet mati).
  useEffect(() => {
    const wake = () => {
      if (document.visibilityState === "hidden") return;
      wakeRef.current?.();
      void run();
    };
    const goOnline = () => {
      setBrowserOffline(false);
      wake();
    };
    const goOffline = () => setBrowserOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    document.addEventListener("visibilitychange", wake);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [run]);

  // Antrean sudah tersimpan di laptop, tapi halaman tidak bisa dibuka lagi
  // selama offline: tetap peringatkan kalau tab ditutup.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (queueRef.current.length > 0) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  return {
    enqueue,
    enqueueLock,
    retry,
    discard,
    replay,
    status,
    /** Item yang belum dijawab server, urut kirim. */
    items,
    pending: items.length,
    /** Server tidak terjangkau (atau browser melapor offline). */
    offline: status.state === "offline" || browserOffline,
    /** false kalau localStorage tidak bisa dipakai: antrean hanya di memori tab ini. */
    persisted,
  };
}

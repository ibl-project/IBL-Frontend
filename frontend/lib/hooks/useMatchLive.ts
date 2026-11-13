import { useCallback, useEffect, useRef, useState } from "react";

import { API_URL } from "@/lib/apiClient";
import { type MatchSnapshot, type QuarterState, getMatch } from "@/lib/matchesApi";
import { errorMessage } from "@/lib/errors";
import { type ServerLine, withServerLine } from "@/lib/matchSnapshot";

const RETRY_MIN_MS = 3_000;
const RETRY_MAX_MS = 30_000;

/** Isi event SSE beragam per nama event; tiap handler menyebut bentuk datanya sendiri. */
type StreamHandlers = Record<string, (data: never) => void>;

/**
 * Buka SSE /matches/:id/live dan teruskan setiap event ke `handlers[nama event]`.
 *
 * EventSource menyambung ulang sendiri saat jaringan putus, tapi berhenti total kalau
 * server membalas selain 200 (503 saat penuh, 502 saat deploy lebih dari 30 detik).
 * Saat itu disambung ulang manual dengan jeda 3, 6, 12, ... maksimal 30 detik. Server
 * mengirim `snapshot` setiap kali tersambung, jadi data otomatis sinkron lagi.
 * Mengembalikan fungsi untuk memutus.
 */
export function openMatchStream(matchId: string, handlers: StreamHandlers): () => void {
  let source: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let delay = RETRY_MIN_MS;
  let closed = false;

  const connect = () => {
    const current = new EventSource(`${API_URL}/matches/${matchId}/live`);
    source = current;
    current.addEventListener("connected", () => {
      delay = RETRY_MIN_MS;
    });
    for (const [event, handle] of Object.entries(handlers)) {
      current.addEventListener(event, (message) => {
        if (!closed) handle(JSON.parse((message as MessageEvent<string>).data) as never);
      });
    }
    current.onerror = () => {
      if (closed || current.readyState !== EventSource.CLOSED) return;
      retryTimer = setTimeout(connect, delay);
      delay = Math.min(delay * 2, RETRY_MAX_MS);
    };
  };

  connect();
  return () => {
    closed = true;
    clearTimeout(retryTimer);
    source?.close();
  };
}

type SnapshotUpdate = (update: (current: MatchSnapshot | null) => MatchSnapshot | null) => void;

/**
 * Ubah snapshot dari server sebelum dipakai. Scoring desk memakainya untuk
 * menerapkan ulang antrean yang belum terkirim (`replayOutbox`). `withTaps`
 * false untuk event periode: angka skornya sudah berisi ketukan antre.
 */
export type Rebase = (snapshot: MatchSnapshot, withTaps: boolean) => MatchSnapshot;

const keepAsIs: Rebase = (snapshot) => snapshot;

/**
 * Handler SSE yang menerapkan setiap event ke satu snapshot match lewat `apply`:
 * skor, nama pemain baru (roster_updated), warna, kunci/buka periode, reset.
 * Event skor dilewati selama `ignoreScore()` true.
 */
export function snapshotHandlers(
  apply: SnapshotUpdate,
  ignoreScore: () => boolean = () => false,
  rebase: Rebase = keepAsIs,
): StreamHandlers {
  const replace = (data: MatchSnapshot) => apply(() => rebase(data, true));
  const onScore = (data: ServerLine) => {
    if (ignoreScore()) return;
    apply((current) => (current ? withServerLine(current, data) : current));
  };
  const onQuarters = (data: { quarters: QuarterState[]; currentQuarter: number | null }) =>
    apply((current) =>
      current ? rebase({ ...current, quarters: data.quarters, currentQuarter: data.currentQuarter }, false) : current,
    );

  return {
    snapshot: replace,
    roster_updated: replace,
    // Banyak baris berubah sekaligus: server mengirim snapshot lengkap.
    quarter_reset: replace,
    match_reset: replace,
    score_update: onScore,
    action_voided: onScore,
    match_colors_updated: (data: { team1Color: string; team2Color: string }) =>
      apply((current) =>
        current
          ? {
              ...current,
              team1: { ...current.team1, color: data.team1Color },
              team2: { ...current.team2, color: data.team2Color },
            }
          : current,
      ),
    match_finalized: (data: { team1Score: number; team2Score: number; finishedAt: string }) =>
      apply((current) =>
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
    match_unlocked: () => apply((current) => (current ? { ...current, locked: false } : current)),
    quarter_locked: onQuarters,
    quarter_unlocked: onQuarters,
  };
}

/**
 * Keadaan satu match dari GET /matches/:id, lalu diperbarui lewat SSE
 * /matches/:id/live (lihat `snapshotHandlers`).
 *
 * Event skor diabaikan kalau `ignoreScoreEvents` true: pemegang sesi sudah
 * punya angka terbaru dari jawaban tiap ketukannya sendiri (dan event yang
 * datang terlambat bisa menimpa ketukan yang masih antre). Snapshot penuh dari
 * server selalu dilewatkan `rebase` dulu (lihat `Rebase`).
 */
export function useMatchLive(matchId: string, ignoreScoreEvents: boolean, rebase: Rebase = keepAsIs) {
  const [snapshot, setSnapshot] = useState<MatchSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const ignoreRef = useRef(ignoreScoreEvents);
  const rebaseRef = useRef(rebase);

  useEffect(() => {
    ignoreRef.current = ignoreScoreEvents;
    rebaseRef.current = rebase;
  }, [ignoreScoreEvents, rebase]);

  useEffect(() => {
    // Tanpa ID (belum ada match terpilih) jangan ambil snapshot maupun buka SSE.
    if (!matchId) return;
    let active = true;
    getMatch(matchId).then(
      (data) => {
        if (active) {
          setSnapshot(rebaseRef.current(data, true));
          setError(null);
        }
      },
      (failure: unknown) => {
        if (active) setError(errorMessage(failure));
      },
    );

    const close = openMatchStream(
      matchId,
      snapshotHandlers(
        setSnapshot,
        () => ignoreRef.current,
        (data, withTaps) => rebaseRef.current(data, withTaps),
      ),
    );
    return () => {
      active = false;
      close();
    };
  }, [matchId, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { snapshot, setSnapshot, error, reload };
}

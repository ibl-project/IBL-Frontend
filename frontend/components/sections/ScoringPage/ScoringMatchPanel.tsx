"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";

import { useAutoSaveActions } from "@/lib/hooks/useAutoSaveActions";
import { type Rebase, useMatchLive } from "@/lib/hooks/useMatchLive";
import type { SessionState } from "@/lib/hooks/useScoringSession";
import {
  type PlayerLine,
  type ScoringBoardItem,
  type StatKey,
  isSessionError,
  lockQuarter,
  periodLabel,
  resetQuarter,
  unlockQuarter,
  updateColors,
} from "@/lib/matchesApi";
import { applyLock, applyStep } from "@/lib/matchSnapshot";
import type { OutboxTap } from "@/lib/scoringOutbox";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { errorMessage } from "@/lib/errors";
import { useCollapseSidebar } from "@/components/layout/dashboard/DashboardLayout";
import { Modal } from "@/components/ui/Modal";
import { ScoringBoxScoreSection } from "./ScoringBoxScoreSection";
import { ScoringOutboxConflict } from "./ScoringOutboxConflict";
import { type ScoringView, ScoringQuarterTabs } from "./ScoringQuarterTabs";

interface ScoringMatchPanelProps {
  item: ScoringBoardItem;
  session: SessionState;
  recheckSession: () => void;
  /** Muat ulang daftar match (status lock, pemegang sesi, pengunci periode). */
  onBoardChange: () => void;
  /** "Save and Exit": lepas sesi dan kembali ke daftar (dipanggil setelah semua ketukan tersimpan). */
  onLeave: () => void;
}

type Confirm = { kind: "lock" | "unlock" | "reset"; quarter: number };

/**
 * Scoring desk satu match: tab Quarter 1–4 / OT / Total, box score, auto-save,
 * dan Save and Lock / Unlock per periode. Hanya periode aktif (terkecil yang
 * belum terkunci) yang bisa diisi, dan hanya oleh pemegang sesi; akun lain
 * melihat pesan "sedang dipakai" sampai match dikunci.
 *
 * Wifi/backend mati: ketukan dan Save and Lock periode yang bukan periode
 * terbuka terakhir tetap bisa, disimpan di laptop, lalu terkirim otomatis
 * (lihat useAutoSaveActions). Lock periode terakhir, Reset, Unlock, dan warna
 * jersey butuh koneksi.
 */
export const ScoringMatchPanel = ({
  item,
  session,
  recheckSession,
  onBoardChange,
  onLeave,
}: ScoringMatchPanelProps) => {
  useCollapseSidebar();
  const userId = useAuthStore((state) => state.user?.id ?? "");
  const mine = session.status === "mine";
  // Snapshot dari server (SSE tersambung lagi, muat ulang) diteruskan ke
  // antrean dulu, supaya ketukan yang belum terkirim tidak hilang dari layar.
  const replayRef = useRef<Rebase>((data) => data);
  const rebase = useCallback<Rebase>((data, withTaps) => replayRef.current(data, withTaps), []);
  const { snapshot, setSnapshot, error, reload } = useMatchLive(item.id, mine, rebase);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSessionLost = useCallback(
    (failure: unknown) => {
      if (isSessionError(failure)) {
        recheckSession();
        onBoardChange();
      }
      reload();
    },
    [reload, recheckSession, onBoardChange],
  );
  const handleDropped = useCallback(
    (tap: OutboxTap, failure: unknown) => {
      setNotice({
        tone: "error",
        text: `Satu ketukan ${periodLabel(tap.quarter)} ditolak server dan tidak dihitung: ${errorMessage(failure)}`,
      });
      reload();
    },
    [reload],
  );
  const outbox = useAutoSaveActions({
    matchId: item.id,
    userId,
    canSend: mine,
    setSnapshot,
    onSessionLost: handleSessionLost,
    onDropped: handleDropped,
    onLocked: onBoardChange,
  });
  const { enqueue, enqueueLock, status, pending } = outbox;
  useEffect(() => {
    replayRef.current = outbox.replay;
  }, [outbox.replay]);
  // Sesi belum terkonfirmasi tapi antrean sedang terkirim lancar = online.
  const offline = outbox.offline || (session.status === "mine" && session.offline === true && pending === 0);
  const conflict = status.state === "conflict";

  // Tab yang dipilih; null = ikut periode aktif.
  const [picked, setPicked] = useState<ScoringView | null>(null);
  const active = snapshot?.currentQuarter ?? null;
  const [lastActive, setLastActive] = useState(active);
  if (active !== lastActive) {
    setLastActive(active);
    // Sedang melihat periode aktif lama (mis. baru saja dikunci): ikut pindah ke periode aktif baru.
    if (picked === lastActive) setPicked(null);
  }

  const locked = snapshot?.locked ?? item.locked;
  const readOnly = locked || !mine;
  const quarters = snapshot?.quarters ?? [];
  const allLocked = quarters.length > 0 && quarters.every((quarter) => quarter.locked);
  const viewable = (candidate: ScoringView) =>
    candidate === "total"
      ? allLocked
      : quarters.some((quarter) => quarter.quarter === candidate && (quarter.locked || quarter.quarter === active));
  const defaultView: ScoringView = active ?? (allLocked ? "total" : (quarters[0]?.quarter ?? 1));
  const view: ScoringView = picked !== null && viewable(picked) ? picked : defaultView;
  const canTap = !readOnly && !conflict && typeof view === "number" && view === active;
  // Save and Lock lewat antrean (bisa saat offline) kalau masih ada periode
  // terbuka lain: hasilnya pasti periode berikutnya dibuka. Periode terbuka
  // terakhir menentukan selesai/OT di server, jadi langsung dan butuh koneksi.
  const lockQueues = (quarter: number) => quarters.some((period) => !period.locked && period.quarter !== quarter);

  // "Save and Exit": ketukan sudah auto-save, jadi cukup tunggu antrean kosong lalu keluar.
  const [exiting, setExiting] = useState(false);
  const settled = pending === 0;
  const waitingToExit = exiting && !settled;
  useEffect(() => {
    if (exiting && settled) onLeave();
  }, [exiting, settled, onLeave]);
  const handleExit = () => {
    // Saat konflik antrean tidak terkirim sendiri; tetap tersimpan di laptop (tanda di card daftar).
    if (settled || conflict) onLeave();
    else setExiting(true);
  };

  const handleStep = (side: 1 | 2, player: PlayerLine, stat: StatKey, delta: 1 | -1) => {
    if (!canTap || !snapshot || typeof view !== "number") return;
    // `player` = baris periode ini, jadi batas 0 berlaku per periode.
    if (delta < 0 && player[stat] <= 0) return;
    const teamId = side === 1 ? snapshot.team1.id : snapshot.team2.id;
    if (!teamId) return;
    setExiting(false);
    setSnapshot((current) => (current ? applyStep(current, side, player.id, stat, delta, view) : current));
    enqueue({ playerId: player.id, teamId, quarter: view, actionType: stat, delta });
  };

  const handleColors = (colors: { team1Color?: string; team2Color?: string }) => {
    if (offline) return;
    updateColors(item.id, colors).catch((failure: unknown) =>
      setNotice({ tone: "error", text: `Warna gagal disimpan: ${errorMessage(failure)}` }),
    );
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    const label = periodLabel(confirm.quarter);
    if (confirm.kind === "lock" && lockQueues(confirm.quarter)) {
      const next = Math.min(
        ...quarters.filter((period) => !period.locked && period.quarter !== confirm.quarter).map((period) => period.quarter),
      );
      setSnapshot((current) => (current ? applyLock(current, confirm.quarter) : current));
      enqueueLock(confirm.quarter);
      setNotice({
        tone: "ok",
        text: offline
          ? `${label} dikunci di laptop ini dan dikirim ke server saat koneksi kembali. ${periodLabel(next)} bisa langsung diisi.`
          : `${label} dikunci. ${periodLabel(next)} dibuka.`,
      });
      setConfirm(null);
      setPicked(null);
      return;
    }
    setBusy(true);
    try {
      if (confirm.kind === "reset") {
        const result = await resetQuarter(item.id, confirm.quarter);
        setNotice({
          tone: "ok",
          text:
            result.voidedActions > 0
              ? `Semua statistik ${label} sudah dikembalikan ke 0.`
              : `${label} sudah kosong, tidak ada yang perlu di-reset.`,
        });
      } else if (confirm.kind === "lock") {
        const result = await lockQuarter(item.id, confirm.quarter);
        setNotice({
          tone: "ok",
          text: result.finished
            ? "Pertandingan selesai dan dikunci. Hasil sudah masuk klasemen."
            : result.overtimeOpened
              ? `Skor imbang. ${periodLabel(result.overtimeOpened)} dibuka.`
              : result.currentQuarter
                ? `${label} dikunci. ${periodLabel(result.currentQuarter)} dibuka.`
                : `${label} dikunci.`,
        });
      } else {
        await unlockQuarter(item.id, confirm.quarter);
        setNotice({ tone: "ok", text: `${label} dibuka untuk koreksi. Tekan Save and Lock ${label} lagi setelah selesai.` });
        // Backend sudah menjadikan akun ini pemegang sesi; minta sesi ulang
        // supaya halaman ikut tahu (sebelumnya klaim ditolak karena terkunci).
        recheckSession();
        setPicked(null);
      }
      setConfirm(null);
      reload();
      onBoardChange();
    } catch (failure) {
      setConfirm(null);
      setNotice({ tone: "error", text: errorMessage(failure) });
      reload();
    } finally {
      setBusy(false);
    }
  };

  const title = `Match ${item.matchNumber ?? ""}`.trim();

  if (!locked && session.status === "busy") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-[12px] bg-white px-6 py-20 text-center font-poppins">
        <Lock aria-hidden="true" className="h-8 w-8 text-gray-600" />
        <p className="text-lg font-semibold text-[#202224]">
          {title} sedang di-scoring oleh {session.holderName}.
        </p>
        <p className="max-w-md text-sm text-gray-600">
          Match ini bisa dilihat setelah dikunci (Save and Lock semua periode). Kalau akun tersebut keluar, halaman ini
          otomatis bisa dipakai.
        </p>
        {pending > 0 && (
          <div className="max-w-2xl">
            <ScoringOutboxConflict
              items={outbox.items}
              snapshot={snapshot}
              reason={status.state === "conflict" ? status.message : `Sesi scoring dipegang ${session.holderName}.`}
              canRetry={false}
              onRetry={outbox.retry}
              onDiscard={outbox.discard}
            />
          </div>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="mt-2 h-10 rounded-full bg-[#7a9ba8] px-6 text-sm font-bold text-white hover:bg-[#688591] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a9ba8]"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!snapshot || (!locked && session.status === "claiming")) {
    return (
      <div role={error ? "alert" : "status"} className="rounded-[12px] bg-white px-6 py-20 text-center font-poppins text-sm">
        {error ? (
          <span className="font-medium text-red-700">Data match gagal dimuat: {error}</span>
        ) : (
          <span className="text-gray-600">Membuka {title}...</span>
        )}
      </div>
    );
  }

  const saveText = conflict
    ? `Pengiriman dihentikan: ${pending} belum terkirim`
    : offline
      ? `Offline${pending > 0 ? `: ${pending} belum terkirim` : ""}. Tetap isi skor, data terkirim otomatis saat koneksi kembali.`
      : pending > 0
        ? `Menyimpan...${pending > 1 ? ` (${pending} antre)` : ""}`
        : status.state === "saved"
          ? "Tersimpan"
          : "Perubahan tersimpan otomatis";
  const statusLine = (
    <span
      aria-live="polite"
      className={`text-xs font-medium ${conflict ? "text-red-700" : offline ? "text-amber-800" : "text-gray-600"}`}
    >
      {saveText}
      {!outbox.persisted && " Penyimpanan browser tidak bisa dipakai: jangan tutup atau reload tab ini sampai semua terkirim."}
    </span>
  );
  // Butuh server langsung: Lock periode terakhir, Reset, Unlock.
  const needsServer = offline || pending > 0;
  const needsServerTitle = offline ? "Butuh koneksi ke server" : pending > 0 ? "Tunggu semua data terkirim" : undefined;
  const pill = "h-10 rounded-full px-6 text-sm font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const leaveButton = (
    <button
      type="button"
      onClick={handleExit}
      disabled={waitingToExit}
      className={`${pill} bg-[#f26722] hover:bg-[#d8581a] focus-visible:outline-[#f26722]`}
    >
      {waitingToExit ? (offline ? `Menunggu koneksi (${pending} belum terkirim)` : "Menyimpan...") : "Save and Exit"}
    </button>
  );

  const viewedQuarter = typeof view === "number" ? quarters.find((quarter) => quarter.quarter === view) : undefined;
  const lockedBy =
    typeof view === "number" ? item.scoring.quarters.find((quarter) => quarter.quarter === view)?.lockedBy?.name : undefined;
  // Unlock hanya kalau semua periode sebelum periode ini sudah terkunci.
  const unlockBlockedBy =
    typeof view === "number" ? quarters.find((quarter) => quarter.quarter < view && !quarter.locked) : undefined;

  let footer: React.ReactNode;
  if (view === "total") {
    footer = (
      <>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
          <Lock aria-hidden="true" className="h-4 w-4" />
          Total semua periode (baca saja)
        </span>
        {leaveButton}
        {statusLine}
      </>
    );
  } else if (viewedQuarter?.locked) {
    footer = (
      <>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
          <Lock aria-hidden="true" className="h-4 w-4" />
          {periodLabel(view)} terkunci{lockedBy ? ` oleh ${lockedBy}` : ""}
        </span>
        <button
          type="button"
          onClick={() => setConfirm({ kind: "unlock", quarter: view })}
          disabled={unlockBlockedBy !== undefined || needsServer || conflict}
          title={unlockBlockedBy ? `Kunci dulu ${periodLabel(unlockBlockedBy.quarter)}` : needsServerTitle}
          className={`${pill} bg-[#2f9b9a] hover:bg-[#257f7e] focus-visible:outline-[#2f9b9a]`}
        >
          Unlock {periodLabel(view)}
        </button>
        {leaveButton}
        {statusLine}
      </>
    );
  } else {
    const queuedLock = lockQueues(view);
    footer = (
      <>
        <button
          type="button"
          onClick={() => setConfirm({ kind: "lock", quarter: view })}
          disabled={!mine || conflict || (!queuedLock && needsServer)}
          title={queuedLock ? undefined : needsServerTitle}
          className={`${pill} bg-[#f99f1b] hover:bg-[#d98b16] focus-visible:outline-[#f99f1b]`}
        >
          Save and Lock {periodLabel(view)}
        </button>
        <button
          type="button"
          onClick={() => setConfirm({ kind: "reset", quarter: view })}
          disabled={!mine || conflict || needsServer}
          title={needsServerTitle}
          className="h-10 rounded-full border border-[#7a0000] bg-white px-6 text-sm font-bold text-[#7a0000] transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a0000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset all {periodLabel(view)}
        </button>
        {leaveButton}
        {statusLine}
      </>
    );
  }

  const confirmText = (() => {
    if (!confirm) return "";
    const label = periodLabel(confirm.quarter);
    if (confirm.kind === "reset") {
      return `Semua statistik kedua tim di ${label} menjadi 0. Periode lain tidak berubah. Riwayat ketukan tetap tersimpan di log.`;
    }
    if (confirm.kind === "unlock") {
      return `${label} bisa dikoreksi lagi oleh akun ini. Periode lain tidak berubah; periode yang masih terbuka menunggu sampai ${label} dikunci lagi.${
        locked ? " Klasemen ikut berubah saat dikoreksi." : ""
      }`;
    }
    const others = quarters.filter((quarter) => !quarter.locked && quarter.quarter !== confirm.quarter);
    if (others.length > 0) {
      const next = Math.min(...others.map((quarter) => quarter.quarter));
      return `${label} dikunci dan tidak bisa diubah sampai di-Unlock. ${periodLabel(next)} bisa diisi setelahnya.${
        offline ? " Koneksi sedang terputus: kunci ini disimpan di laptop dan dikirim ke server otomatis saat koneksi kembali." : ""
      }`;
    }
    const [score1, score2] = [snapshot.team1.score, snapshot.team2.score];
    if (score1 !== score2) {
      return `Ini periode terakhir. Skor akhir ${snapshot.team1.name} ${score1} – ${score2} ${snapshot.team2.name} disimpan dan masuk klasemen. Setelah dikunci, tidak ada yang bisa mengubah skor sampai di-Unlock.`;
    }
    if (snapshot.status === "LIVE") {
      const highest = Math.max(...quarters.map((quarter) => quarter.quarter));
      return `Skor imbang ${score1} – ${score2}. Setelah ${label} dikunci, ${periodLabel(highest + 1)} (overtime) dibuka.`;
    }
    return `Skor jadi imbang ${score1} – ${score2}. Pertandingan yang sudah selesai tidak boleh berakhir seri; periksa koreksinya.`;
  })();

  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 font-poppins text-sm ${
            notice.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" aria-label="Tutup pesan" onClick={() => setNotice(null)} className="shrink-0 rounded-full px-2 hover:bg-black/5">
            ✕
          </button>
        </div>
      )}

      {conflict && (
        <ScoringOutboxConflict
          items={outbox.items}
          snapshot={snapshot}
          reason={status.message}
          canRetry={mine}
          onRetry={outbox.retry}
          onDiscard={() => {
            outbox.discard();
            reload();
          }}
        />
      )}

      <ScoringBoxScoreSection
        quarterTabs={
          <ScoringQuarterTabs quarters={quarters} currentQuarter={active} view={view} onSelect={setPicked} />
        }
        snapshot={snapshot}
        view={view}
        readOnly={readOnly || offline}
        canTap={canTap}
        onStep={handleStep}
        onColorsChange={handleColors}
        footer={footer}
      />

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} labelledBy="scoring-confirm-title" className="max-w-sm">
        <div className="rounded-3xl bg-white p-6 text-center">
          <h3 id="scoring-confirm-title" className="text-lg font-bold text-gray-900">
            {confirm?.kind === "lock"
              ? `Kunci ${periodLabel(confirm.quarter)}?`
              : confirm?.kind === "reset"
                ? `Reset ${periodLabel(confirm.quarter)}?`
                : `Buka kunci ${periodLabel(confirm?.quarter ?? 1)}?`}
          </h3>
          <p className="mt-2 text-sm text-gray-600">{confirmText}</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirm(null)}
              disabled={busy}
              className="flex-1 rounded-full bg-gray-100 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={runConfirmed}
              disabled={busy}
              className="flex-1 rounded-full bg-[#2f9b9a] py-2.5 text-xs font-bold text-white hover:bg-[#257f7e] disabled:opacity-70"
            >
              {busy
                ? "Memproses..."
                : confirm?.kind === "lock"
                  ? "Save and Lock"
                  : confirm?.kind === "reset"
                    ? "Reset all"
                    : "Unlock"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

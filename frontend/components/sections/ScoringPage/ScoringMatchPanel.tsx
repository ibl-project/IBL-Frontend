"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { useAutoSaveActions } from "@/lib/hooks/useAutoSaveActions";
import { useMatchLive } from "@/lib/hooks/useMatchLive";
import type { SessionState } from "@/lib/hooks/useScoringSession";
import {
  type MatchSnapshot,
  type PlayerLine,
  type PlayerQuarterLine,
  type ScoringBoardItem,
  type StatCounts,
  type StatKey,
  STAT_KEYS,
  isSessionError,
  lockQuarter,
  periodLabel,
  resetQuarter,
  unlockQuarter,
  updateColors,
} from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";
import { useCollapseSidebar } from "@/components/layout/dashboard/DashboardLayout";
import { Modal } from "@/components/ui/Modal";
import { ScoringBoxScoreSection } from "./ScoringBoxScoreSection";
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

const pointsOf = (counts: StatCounts) => counts.twoPointMade * 2 + counts.threePointMade * 3 + counts.freethrowMade;

const emptyQuarterLine = (): PlayerQuarterLine => ({
  ...(Object.fromEntries(STAT_KEYS.map((key) => [key, 0])) as StatCounts),
  points: 0,
});

/** Tambah/kurangi satu statistik di periode `quarter` secara lokal (sebelum server menjawab). */
function applyStep(
  snapshot: MatchSnapshot,
  side: 1 | 2,
  playerId: string,
  stat: StatKey,
  delta: 1 | -1,
  quarter: number,
): MatchSnapshot {
  const key = side === 1 ? "team1" : "team2";
  const team = snapshot[key];
  const players = team.players.map((player): PlayerLine => {
    if (player.id !== playerId) return player;
    const total = { ...player, [stat]: Math.max(0, player[stat] + delta) };
    const before = player.quarters?.[quarter] ?? emptyQuarterLine();
    const after = { ...before, [stat]: Math.max(0, before[stat] + delta) };
    return {
      ...total,
      points: pointsOf(total),
      quarters: { ...player.quarters, [quarter]: { ...after, points: pointsOf(after) } },
    };
  });
  const quarterScores = [...team.quarterScores];
  while (quarterScores.length < quarter) quarterScores.push(0);
  quarterScores[quarter - 1] = players.reduce((sum, player) => sum + (player.quarters?.[quarter]?.points ?? 0), 0);
  return {
    ...snapshot,
    [key]: { ...team, players, quarterScores, score: players.reduce((sum, player) => sum + player.points, 0) },
  };
}

const SAVE_LABEL = {
  idle: "Perubahan tersimpan otomatis",
  saving: "Menyimpan...",
  saved: "Tersimpan",
  retrying: "Koneksi bermasalah, mencoba lagi...",
} as const;

type Confirm = { kind: "lock" | "unlock" | "reset"; quarter: number };

/**
 * Scoring desk satu match: tab Quarter 1–4 / OT / Total, box score, auto-save,
 * dan Save and Lock / Unlock per periode. Hanya periode aktif (terkecil yang
 * belum terkunci) yang bisa diisi, dan hanya oleh pemegang sesi; akun lain
 * melihat pesan "sedang dipakai" sampai match dikunci.
 */
export const ScoringMatchPanel = ({
  item,
  session,
  recheckSession,
  onBoardChange,
  onLeave,
}: ScoringMatchPanelProps) => {
  useCollapseSidebar();
  const mine = session.status === "mine";
  const { snapshot, setSnapshot, error, reload } = useMatchLive(item.id, mine);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [busy, setBusy] = useState(false);

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
  const canTap = !readOnly && typeof view === "number" && view === active;

  const handleRejected = useCallback(
    (failure: unknown) => {
      setNotice({ tone: "error", text: `Ketukan terakhir tidak tersimpan: ${errorMessage(failure)}` });
      reload();
      if (isSessionError(failure)) {
        recheckSession();
        onBoardChange();
      }
    },
    [reload, recheckSession, onBoardChange],
  );
  const { enqueue, status, pending } = useAutoSaveActions(item.id, setSnapshot, handleRejected);

  // "Save and Exit": ketukan sudah auto-save, jadi cukup tunggu antrean kosong lalu keluar.
  const [exiting, setExiting] = useState(false);
  const settled = pending === 0 && status.state !== "saving" && status.state !== "retrying";
  const waitingToExit = exiting && !settled;
  useEffect(() => {
    // Ketukan terakhir ditolak (status failed): tetap di desk supaya pesannya terbaca.
    if (exiting && settled && status.state !== "failed") onLeave();
  }, [exiting, settled, status.state, onLeave]);
  const handleExit = () => {
    if (settled) onLeave();
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
    updateColors(item.id, colors).catch((failure: unknown) =>
      setNotice({ tone: "error", text: `Warna gagal disimpan: ${errorMessage(failure)}` }),
    );
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    const label = periodLabel(confirm.quarter);
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

  const saveText = status.state === "failed" ? "Gagal menyimpan" : SAVE_LABEL[status.state];
  const pill = "h-10 rounded-full px-6 text-sm font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const leaveButton = (
    <button
      type="button"
      onClick={handleExit}
      disabled={waitingToExit}
      className={`${pill} bg-[#f26722] hover:bg-[#d8581a] focus-visible:outline-[#f26722]`}
    >
      {waitingToExit ? "Menyimpan..." : "Save and Exit"}
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
          disabled={unlockBlockedBy !== undefined}
          title={unlockBlockedBy ? `Kunci dulu ${periodLabel(unlockBlockedBy.quarter)}` : undefined}
          className={`${pill} bg-[#2f9b9a] hover:bg-[#257f7e] focus-visible:outline-[#2f9b9a]`}
        >
          Unlock {periodLabel(view)}
        </button>
        {leaveButton}
      </>
    );
  } else {
    footer = (
      <>
        <button
          type="button"
          onClick={() => setConfirm({ kind: "lock", quarter: view })}
          disabled={!mine || pending > 0 || status.state === "saving" || status.state === "retrying"}
          className={`${pill} bg-[#f99f1b] hover:bg-[#d98b16] focus-visible:outline-[#f99f1b]`}
        >
          Save and Lock {periodLabel(view)}
        </button>
        <button
          type="button"
          onClick={() => setConfirm({ kind: "reset", quarter: view })}
          disabled={!mine || pending > 0 || status.state === "saving" || status.state === "retrying"}
          className="h-10 rounded-full border border-[#7a0000] bg-white px-6 text-sm font-bold text-[#7a0000] transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a0000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset all {periodLabel(view)}
        </button>
        {leaveButton}
        <span aria-live="polite" className={`text-xs font-medium ${status.state === "failed" ? "text-red-700" : "text-gray-600"}`}>
          {saveText}
          {pending > 1 ? ` (${pending} antre)` : ""}
        </span>
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
      return `${label} dikunci dan tidak bisa diubah sampai di-Unlock. ${periodLabel(next)} bisa diisi setelahnya.`;
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

      <ScoringBoxScoreSection
        quarterTabs={
          <ScoringQuarterTabs quarters={quarters} currentQuarter={active} view={view} onSelect={setPicked} />
        }
        snapshot={snapshot}
        view={view}
        readOnly={readOnly}
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

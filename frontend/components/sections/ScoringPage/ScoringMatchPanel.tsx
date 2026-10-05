"use client";

import React, { useCallback, useState } from "react";
import { Lock } from "lucide-react";

import { useAutoSaveActions } from "@/lib/hooks/useAutoSaveActions";
import { useMatchLive } from "@/lib/hooks/useMatchLive";
import type { SessionState } from "@/lib/hooks/useScoringSession";
import {
  type MatchSnapshot,
  type PlayerLine,
  type ScoringBoardItem,
  type StatKey,
  isSessionError,
  lockMatch,
  unlockMatch,
  updateColors,
} from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";
import { Modal } from "@/components/ui/Modal";
import { ScoringBoxScoreSection } from "./ScoringBoxScoreSection";

interface ScoringMatchPanelProps {
  item: ScoringBoardItem;
  session: SessionState;
  recheckSession: () => void;
  /** Muat ulang daftar match (tab, status lock, pemegang sesi). */
  onBoardChange: () => void;
  /** "Keluar": lepas sesi dan tutup match ini. */
  onLeave: () => void;
}

/** Tambah/kurangi satu statistik secara lokal (sebelum server menjawab). */
function applyStep(snapshot: MatchSnapshot, side: 1 | 2, playerId: string, stat: StatKey, delta: 1 | -1): MatchSnapshot {
  const key = side === 1 ? "team1" : "team2";
  const team = snapshot[key];
  const players = team.players.map((player) => {
    if (player.id !== playerId) return player;
    const next = { ...player, [stat]: Math.max(0, player[stat] + delta) };
    return { ...next, points: next.twoPointMade * 2 + next.threePointMade * 3 + next.freethrowMade };
  });
  return { ...snapshot, [key]: { ...team, players, score: players.reduce((sum, p) => sum + p.points, 0) } };
}

const SAVE_LABEL = {
  idle: "Perubahan tersimpan otomatis",
  saving: "Menyimpan...",
  saved: "Tersimpan",
  retrying: "Koneksi bermasalah, mencoba lagi...",
} as const;

/**
 * Satu tab "Match N" di halaman Scoring: box score + auto-save + Save and
 * Lock / Unlock. Hanya pemegang sesi yang bisa mengubah; akun lain melihat
 * pesan "sedang dipakai" sampai match dikunci.
 */
export const ScoringMatchPanel = ({ item, session, recheckSession, onBoardChange, onLeave }: ScoringMatchPanelProps) => {
  const mine = session.status === "mine";
  const { snapshot, setSnapshot, error, reload } = useMatchLive(item.id, mine);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirm, setConfirm] = useState<"lock" | "unlock" | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = snapshot?.locked ?? item.locked;
  const readOnly = locked || !mine;

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

  const handleStep = (side: 1 | 2, player: PlayerLine, stat: StatKey, delta: 1 | -1) => {
    if (readOnly || !snapshot) return;
    if (delta < 0 && player[stat] <= 0) return;
    const teamId = side === 1 ? snapshot.team1.id : snapshot.team2.id;
    if (!teamId) return;
    setSnapshot((current) => (current ? applyStep(current, side, player.id, stat, delta) : current));
    enqueue({ playerId: player.id, teamId, actionType: stat, delta });
  };

  const handleColors = (colors: { team1Color?: string; team2Color?: string }) => {
    updateColors(item.id, colors).catch((failure: unknown) =>
      setNotice({ tone: "error", text: `Warna gagal disimpan: ${errorMessage(failure)}` }),
    );
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm === "lock") {
        await lockMatch(item.id);
        setNotice({ tone: "ok", text: "Match dikunci. Hasil sudah masuk klasemen." });
      } else {
        await unlockMatch(item.id);
        setNotice({ tone: "ok", text: "Match dibuka untuk koreksi. Tekan Save and Lock lagi setelah selesai." });
        // Backend sudah menjadikan akun ini pemegang sesi; minta sesi ulang
        // supaya halaman ikut tahu (sebelumnya klaim ditolak karena terkunci).
        recheckSession();
      }
      setConfirm(null);
      reload();
      onBoardChange();
    } catch (failure) {
      setConfirm(null);
      setNotice({ tone: "error", text: errorMessage(failure) });
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
          Match ini bisa dilihat setelah dikunci (Save and Lock). Kalau akun tersebut keluar, halaman ini otomatis bisa
          dipakai.
        </p>
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

  const footer = locked ? (
    <>
      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
        <Lock aria-hidden="true" className="h-4 w-4" />
        Terkunci{item.scoring.lockedBy ? ` oleh ${item.scoring.lockedBy.name}` : ""}
      </span>
      <button type="button" onClick={() => setConfirm("unlock")} className={`${pill} bg-[#2f9b9a] hover:bg-[#257f7e] focus-visible:outline-[#2f9b9a]`}>
        Unlock
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => setConfirm("lock")}
        disabled={!mine || pending > 0 || status.state === "saving" || status.state === "retrying"}
        className={`${pill} bg-[#f99f1b] hover:bg-[#d98b16] focus-visible:outline-[#f99f1b]`}
      >
        Save and Lock
      </button>
      <button type="button" onClick={onLeave} className={`${pill} bg-[#f26722] hover:bg-[#d8581a] focus-visible:outline-[#f26722]`}>
        Keluar
      </button>
      <span aria-live="polite" className={`text-xs font-medium ${status.state === "failed" ? "text-red-700" : "text-gray-600"}`}>
        {saveText}
        {pending > 1 ? ` (${pending} antre)` : ""}
      </span>
    </>
  );

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
        snapshot={snapshot}
        readOnly={readOnly}
        onStep={handleStep}
        onColorsChange={handleColors}
        footer={footer}
      />

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} labelledBy="scoring-confirm-title" className="max-w-sm">
        <div className="rounded-3xl bg-white p-6 text-center">
          <h3 id="scoring-confirm-title" className="text-lg font-bold text-gray-900">
            {confirm === "lock" ? `Kunci ${title}?` : `Buka kunci ${title}?`}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {confirm === "lock"
              ? `Skor akhir ${snapshot.team1.name} ${snapshot.team1.score} – ${snapshot.team2.score} ${snapshot.team2.name} disimpan dan masuk klasemen. Setelah dikunci, tidak ada yang bisa mengubah skor sampai di-Unlock.`
              : "Skor bisa dikoreksi lagi oleh akun ini. Klasemen ikut berubah saat dikoreksi."}
          </p>
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
              {busy ? "Memproses..." : confirm === "lock" ? "Save and Lock" : "Unlock"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

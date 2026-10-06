"use client";

import React, { useState } from "react";

import { type ScoringBoardItem, resetMatch } from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";
import { Modal } from "@/components/ui/Modal";

interface ScoringResetMatchDialogProps {
  /** Match yang skornya akan dihapus; null = modal tertutup. */
  match: ScoringBoardItem | null;
  onClose: () => void;
  onDone: (message: string) => void;
}

/**
 * Hapus score satu match (tombol sampah di card Scoring), dua kali konfirmasi:
 *   1. jelaskan dampaknya, lalu "Lanjutkan";
 *   2. ketik "Match N" persis, lalu "Hapus score".
 * Backend ikut memeriksa teks konfirmasi yang sama.
 */
export const ScoringResetMatchDialog = ({ match, onClose, onDone }: ScoringResetMatchDialogProps) => (
  <Modal open={match !== null} onClose={onClose} labelledBy="reset-match-title" className="max-w-sm">
    {match && <DialogBody key={match.id} match={match} onClose={onClose} onDone={onDone} />}
  </Modal>
);

const DialogBody = ({
  match,
  onClose,
  onDone,
}: Omit<ScoringResetMatchDialogProps, "match"> & { match: ScoringBoardItem }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = `Match ${match.matchNumber ?? ""}`.trim();
  const teams = `${match.team1.name ?? "Team 1"} vs ${match.team2.name ?? "Team 2"}`;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await resetMatch(match.id, typed.trim());
      onDone(`Score Match ${result.matchNumber} (${teams}) sudah dihapus. Jadwalnya kembali belum dimulai.`);
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(false);
    }
  };

  const secondary =
    "flex-1 rounded-full bg-gray-100 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500";
  const danger =
    "flex-1 rounded-full bg-red-700 py-2.5 text-xs font-bold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="rounded-3xl bg-white p-6 text-center font-poppins">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Konfirmasi {step} dari 2</p>
      {step === 1 ? (
        <>
          <h3 id="reset-match-title" className="mt-1 text-lg font-bold text-gray-900">
            Hapus score {title}?
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#202224]">{teams}</p>
          <p className="mt-3 text-left text-sm text-gray-600">
            Semua data score Quarter 1–4 (dan OT) match ini dihapus permanen. Hasilnya hilang dari Schedule Result, dan
            statistik pemain serta tim di halaman Teams, klasemen, dan leaderboard kembali seperti sebelum match ini
            dimainkan. Jadwal, susunan pemain, dan PDF hasil tetap ada.
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className={secondary}>
              Batal
            </button>
            <button type="button" onClick={() => setStep(2)} className={danger}>
              Lanjutkan
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 id="reset-match-title" className="mt-1 text-lg font-bold text-gray-900">
            Yakin hapus score {title}?
          </h3>
          <p className="mt-2 text-sm text-gray-600">Tindakan ini tidak bisa dibatalkan.</p>
          <label htmlFor="reset-match-confirm" className="mt-4 block text-left text-xs font-semibold text-gray-700">
            Ketik &quot;{title}&quot; untuk konfirmasi
          </label>
          <input
            id="reset-match-confirm"
            type="text"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-visible:outline-2 focus-visible:outline-red-700"
          />
          {error && (
            <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-xs font-medium text-red-700">
              {error}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} disabled={busy} className={secondary}>
              Batal
            </button>
            <button type="button" onClick={submit} disabled={busy || typed.trim() !== title} className={danger}>
              {busy ? "Menghapus..." : "Hapus score"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

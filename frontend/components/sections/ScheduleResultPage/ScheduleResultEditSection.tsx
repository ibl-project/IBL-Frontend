"use client";

import React, { useRef, useState } from "react";

import {
  type MatchListItem,
  type ResultFile,
  deleteResultFile,
  updateSchedule,
  uploadResultFile,
  validateResultFile,
} from "@/lib/matchesApi";
import { errorMessage, type Team } from "@/lib/teamsApi";
import { Modal } from "@/components/ui/Modal";
import { ResultFileCard } from "./ResultFileCard";
import { ScheduleForm } from "./ScheduleForm";

interface ScheduleResultEditSectionProps {
  match: MatchListItem | null;
  teams: Team[];
  onClose: () => void;
  onSaved: (message: string) => void;
  /** PDF berubah (upload/hapus): daftar jadwal perlu dimuat ulang. */
  onFileChanged: () => void;
}

/** Upload PDF "Detailed Result". Langsung tersimpan, terpisah dari tombol Save. */
const ResultFileField = ({ match, onChanged }: { match: MatchListItem; onChanged: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<ResultFile | null>(match.resultFile);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const handleFile = async (selected: File) => {
    const problem = validateResultFile(selected);
    if (problem) {
      setMessage({ tone: "error", text: problem });
      return;
    }
    setBusy(true);
    setMessage({ tone: "ok", text: "Mengunggah PDF..." });
    try {
      setFile(await uploadResultFile(match.id, selected));
      setMessage({ tone: "ok", text: "PDF tersimpan." });
      onChanged();
    } catch (error) {
      setMessage({ tone: "error", text: `PDF gagal diunggah: ${errorMessage(error)}` });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await deleteResultFile(match.id);
      setFile(null);
      setMessage({ tone: "ok", text: "PDF dihapus." });
      onChanged();
    } catch (error) {
      setMessage({ tone: "error", text: `PDF gagal dihapus: ${errorMessage(error)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="schedule-edit-pdf" className="flex flex-col gap-3">
      <h3 id="schedule-edit-pdf" className="text-center text-[15px] font-medium text-[#f99f1b]">
        Detailed Result
      </h3>
      <ResultFileCard file={file} />
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="h-9 rounded-full border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9b9a] disabled:opacity-60"
        >
          {file ? "Ganti PDF" : "Pilih PDF"}
        </button>
        {file && (
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="h-9 rounded-full px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
          >
            Hapus PDF
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          tabIndex={-1}
          aria-hidden="true"
          // Bukan `hidden`: WebKit iOS menolak .click() pada input yang tidak dirender (AGENTS.md).
          className="absolute pointer-events-none opacity-0 w-px h-px"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            event.target.value = "";
            if (selected) void handleFile(selected);
          }}
        />
      </div>
      <p className="text-center text-[11px] text-gray-600">PDF maks 10 MB, langsung tersimpan setelah dipilih.</p>
      <p
        aria-live="polite"
        className={`min-h-4 text-center text-xs font-medium ${message?.tone === "error" ? "text-red-700" : "text-teal-800"}`}
      >
        {message?.text}
      </p>
    </section>
  );
};

/** Modal "Edit Result": form Create yang sudah terisi + upload PDF. */
export const ScheduleResultEditSection = ({
  match,
  teams,
  onClose,
  onSaved,
  onFileChanged,
}: ScheduleResultEditSectionProps) => {
  return (
    <Modal open={match !== null} onClose={onClose} labelledBy="schedule-edit-title" className="max-w-[964px]">
      {match && (
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[24px] bg-white px-6 py-10 sm:px-14">
          <h2 id="schedule-edit-title" className="sr-only">
            Edit jadwal {match.team1.name} vs {match.team2.name}
          </h2>
          <ScheduleForm
            idPrefix="schedule-edit"
            teams={teams}
            initial={match}
            teamsLocked={match.status !== "SCHEDULED"}
            submitLabel="Save"
            onCancel={onClose}
            onSubmit={async (input) => {
              const { team1Id, team2Id, ...rest } = input;
              const updated = await updateSchedule(
                match.id,
                match.status === "SCHEDULED" ? { team1Id, team2Id, ...rest } : rest,
              );
              onSaved(`Jadwal ${updated.team1.name} vs ${updated.team2.name} diperbarui.`);
            }}
            extra={<ResultFileField match={match} onChanged={onFileChanged} />}
          />
        </div>
      )}
    </Modal>
  );
};

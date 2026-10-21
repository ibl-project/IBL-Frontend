"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import type { SessionState } from "@/lib/hooks/useScoringSession";
import {
  type MatchSnapshot,
  type ScoringBoardItem,
  getMatch,
  saveLineup,
  startMatch,
} from "@/lib/matchesApi";
import { JERSEY_PATTERN, errorMessage } from "@/lib/teamsApi";

interface ScoringLineupSectionProps {
  match: ScoringBoardItem;
  session: SessionState;
  onBack: () => void;
  onStarted: () => void;
}

interface Row {
  playerId: string;
  name: string;
  jersey: string;
  isCaptain: boolean;
}

const toRows = (side: MatchSnapshot["team1"]): Row[] =>
  side.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    jersey: player.nopung,
    isCaptain: player.isCaptain,
  }));

function problemsOf(rows: Row[]): Set<string> {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.jersey, (counts.get(row.jersey) ?? 0) + 1);
  return new Set(
    rows
      .filter((row) => !JERSEY_PATTERN.test(row.jersey) || (counts.get(row.jersey) ?? 0) > 1)
      .map((row) => row.playerId),
  );
}

const LineupTable = ({
  side,
  teamName,
  rows,
  invalid,
  disabled,
  onChange,
}: {
  side: 1 | 2;
  teamName: string;
  rows: Row[];
  invalid: Set<string>;
  disabled: boolean;
  onChange: (rows: Row[]) => void;
}) => (
  <div className="z-10 flex w-full max-w-[380px] flex-col">
    <div className="rounded-t-lg border-b border-teal-200 bg-teal-50 py-1.5 text-center text-sm font-bold uppercase tracking-wide text-teal-800">
      {teamName}
    </div>
    <table className="w-full border-collapse text-[12px] text-[#313131]">
      <thead>
        <tr className="h-[31px] border-b border-[#b9b9b9] bg-gray-50">
          <th scope="col" className="w-[60px] text-[10px] font-bold">
            KAPTEN
          </th>
          <th scope="col" className="font-bold">
            NAMA
          </th>
          <th scope="col" className="w-[64px] font-bold">
            NOPUNG
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const bad = invalid.has(row.playerId);
          return (
            <tr key={row.playerId} className="h-[33px] border-b border-[#b9b9b9] transition-colors hover:bg-gray-50/80">
              <td className="text-center">
                <input
                  type="radio"
                  name={`captain-team-${side}`}
                  checked={row.isCaptain}
                  disabled={disabled}
                  aria-label={`Kapten ${teamName}: ${row.name}`}
                  onChange={() => onChange(rows.map((r) => ({ ...r, isCaptain: r.playerId === row.playerId })))}
                  className="h-4 w-4 cursor-pointer accent-teal-600"
                />
              </td>
              {/* Nama hanya bisa diubah di halaman Teams, supaya tetap satu data. */}
              <td className="px-2 text-center">{row.name}</td>
              <td className="px-1 text-center">
                <input
                  id={`nopung-${side}-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={row.jersey}
                  disabled={disabled}
                  aria-label={`Nomor punggung ${row.name}`}
                  aria-invalid={bad || undefined}
                  onChange={(event) => {
                    const jersey = event.target.value.replace(/[^0-9]/g, "").slice(0, 2);
                    onChange(rows.map((r) => (r.playerId === row.playerId ? { ...r, jersey } : r)));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "ArrowDown" || event.key === "ArrowUp") {
                      event.preventDefault();
                      const next = index + (event.key === "ArrowUp" ? -1 : 1);
                      document.getElementById(`nopung-${side}-${next}`)?.focus();
                    }
                  }}
                  className={`h-[26px] w-full rounded text-center outline-none transition-colors focus:ring-2 focus:ring-teal-600 ${
                    bad ? "border border-red-600 bg-red-50 font-bold text-red-700" : "bg-transparent text-[#313131] hover:bg-black/5"
                  }`}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    {invalid.size > 0 && (
      <p role="alert" className="mt-2 text-center text-[11px] font-medium text-red-700">
        Nomor punggung harus 0, 00, atau 1–99 dan tidak boleh sama dalam satu tim.
      </p>
    )}
  </div>
);

const LineupForm = ({
  match,
  snapshot,
  editable,
  onBack,
  onStarted,
}: {
  match: ScoringBoardItem;
  snapshot: MatchSnapshot;
  editable: boolean;
  onBack: () => void;
  onStarted: () => void;
}) => {
  const [rows1, setRows1] = useState(() => toRows(snapshot.team1));
  const [rows2, setRows2] = useState(() => toRows(snapshot.team2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touched = useRef(false);

  const invalid1 = problemsOf(rows1);
  const invalid2 = problemsOf(rows2);
  const team1 = snapshot.team1.name ?? "Team 1";
  const team2 = snapshot.team2.name ?? "Team 2";
  const empty = rows1.length === 0 || rows2.length === 0;
  const valid = invalid1.size === 0 && invalid2.size === 0 && !empty;

  const toEntries = (rows: Row[]) =>
    rows.map((row) => ({ playerId: row.playerId, jerseyNumber: row.jersey, isCaptain: row.isCaptain }));

  // Auto-save draf kapten & NOPUNG ke database, supaya tidak hilang saat refresh.
  // Disimpan hanya kalau isinya sah (nomor tidak kembar); Create Match tetap menyimpan ulang.
  useEffect(() => {
    if (!touched.current || !editable || !valid) return;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      setDraft("saving");
      saveLineup(match.id, { team1: toEntries(rows1), team2: toEntries(rows2) }).then(
        () => setDraft("saved"),
        () => setDraft("failed"),
      );
    }, 600);
    return () => clearTimeout(draftTimer.current);
  }, [rows1, rows2, editable, valid, match.id]);

  const change = (setRows: (rows: Row[]) => void) => (rows: Row[]) => {
    touched.current = true;
    setRows(rows);
  };

  const handleCreate = async () => {
    if (!valid) return;
    clearTimeout(draftTimer.current);
    setSaving(true);
    setError(null);
    try {
      await saveLineup(match.id, { team1: toEntries(rows1), team2: toEntries(rows2) });
      await startMatch(match.id);
      onStarted();
    } catch (failure) {
      setError(errorMessage(failure));
      setSaving(false);
    }
  };

  return (
    <div className="mt-12 w-full">
      <div className="flex w-full flex-col items-start justify-center gap-10 lg:flex-row lg:gap-20">
        <LineupTable side={1} teamName={team1} rows={rows1} invalid={invalid1} disabled={!editable || saving} onChange={change(setRows1)} />
        <LineupTable side={2} teamName={team2} rows={rows2} invalid={invalid2} disabled={!editable || saving} onChange={change(setRows2)} />
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">
        Nomor punggung di sini hanya berlaku untuk pertandingan ini. Nama pemain diubah di halaman Teams.
      </p>
      <p aria-live="polite" className={`mt-1 text-center text-xs font-medium ${draft === "failed" ? "text-red-700" : "text-teal-800"}`}>
        {draft === "saving"
          ? "Menyimpan draf..."
          : draft === "saved"
            ? "Draf kapten & NOPUNG tersimpan"
            : draft === "failed"
              ? "Draf gagal disimpan, akan dicoba lagi saat diubah"
              : ""}
      </p>
      {empty && (
        <p role="alert" className="mt-2 text-center text-sm font-medium text-red-700">
          Salah satu tim belum punya pemain. Tambahkan pemain di halaman Teams dulu.
        </p>
      )}
      {error && (
        <p role="alert" className="mx-auto mt-4 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-[60px] flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="flex h-[36px] min-w-[100px] items-center justify-center rounded-[50px] bg-[#f26722] px-[24px] py-[10px] text-[14px] font-bold text-white transition-colors hover:bg-[#d8581a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26722] disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!editable || saving || empty || invalid1.size > 0 || invalid2.size > 0}
          className="flex h-[36px] min-w-[100px] items-center justify-center rounded-[50px] bg-[#f99f1b] px-[24px] py-[10px] text-[14px] font-bold text-white shadow-md transition-colors hover:bg-[#d98b16] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f99f1b] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
        >
          {saving ? "Membuat..." : "Create Match"}
        </button>
      </div>
    </div>
  );
};

/**
 * Setelah Choose: pilih kapten dan sesuaikan nomor punggung per pemain,
 * lalu "Create Match" menyimpan susunan pemain dan memulai pertandingan.
 */
export const ScoringLineupSection = ({ match, session, onBack, onStarted }: ScoringLineupSectionProps) => {
  const load = useCallback(() => getMatch(match.id), [match.id]);
  const { state, reload } = useAsyncData(load);

  return (
    <div className="relative flex w-full flex-col items-center rounded-[12px] bg-white px-6 py-8 font-poppins shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] lg:px-[70px]">
      <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row lg:gap-8">
        {[match.team1, match.team2].map((team, index) => (
          <React.Fragment key={index}>
            {index === 1 && <span className="my-2 select-none text-[22px] font-extrabold text-[#202224] lg:my-0">VS</span>}
            <div className="relative flex h-[56px] w-full max-w-[380px] items-center rounded-[4px] border border-[#79747e] bg-white px-4">
              <span className="absolute -top-3 left-3 bg-white px-1 text-[14px] text-[#313131]">Team {index + 1}</span>
              <span className="truncate text-[16px] font-medium text-[#1c1b1f]">{team.name}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {session.status === "busy" ? (
        <div role="alert" className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-base font-semibold text-[#202224]">Jadwal ini sedang disiapkan oleh {session.holderName}.</p>
          <p className="text-sm text-gray-600">Pilih jadwal lain, atau tunggu sampai akun tersebut keluar.</p>
          <button type="button" onClick={onBack} className="rounded-full bg-[#f26722] px-6 py-2 text-sm font-bold text-white hover:bg-[#d8581a]">
            Back
          </button>
        </div>
      ) : state.status === "loading" || session.status === "claiming" ? (
        <p role="status" className="mt-12 text-sm text-gray-600">
          Menyiapkan daftar pemain...
        </p>
      ) : state.status === "error" ? (
        <div role="alert" className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-red-700">Daftar pemain gagal dimuat: {state.message}</p>
          <button type="button" onClick={reload} className="rounded-full bg-[#7a9ba8] px-5 py-2 text-xs font-semibold text-white">
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {session.status === "error" && (
            <p role="alert" className="mt-6 text-sm font-medium text-red-700">
              Sesi scoring belum didapat: {session.message}
            </p>
          )}
          <LineupForm
            key={state.data.id}
            match={match}
            snapshot={state.data}
            editable={session.status === "mine"}
            onBack={onBack}
            onStarted={onStarted}
          />
        </>
      )}
    </div>
  );
};

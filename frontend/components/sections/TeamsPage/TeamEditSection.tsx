"use client";

import React, { useCallback, useRef, useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { errorMessage } from "@/lib/errors";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import {
  DEFAULT_TEAM_LOGO,
  deleteTeamLogo,
  getTeam,
  JERSEY_PATTERN,
  MAX_ROSTER,
  saveRoster,
  uploadTeamLogo,
  type PlayerStats,
  type Team,
} from "@/lib/teamsApi";

import { TeamEditInfoModal } from "./TeamEditInfoModal";
import { TeamLogo } from "./TeamLogo";
import { TeamLogoField } from "./TeamLogoField";

interface TeamEditSectionProps {
  teamId?: string;
  teamName?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSave?: (updatedTeamName?: string) => void;
}

interface RosterRow {
  /** Key React yang stabil; pemain baru belum punya `id`. */
  key: string;
  id?: string;
  name: string;
  jersey: string;
  isCaptain: boolean;
  /** null untuk pemain yang baru ditambahkan di form ini. */
  stats: PlayerStats | null;
}

const EMPTY_TEAM_STATS = { G: "-", W: "-", L: "-", PM: "-", PA: "-", PD: "-", PTS: "-" };

/**
 * Pemain yang sudah tercatat di pertandingan tidak bisa dihapus (backend menolak 409).
 * Backend mengirim "0" untuk pemain tanpa catatan (staging lama masih "-"), jadi
 * bandingkan angkanya, bukan string placeholder-nya.
 */
const hasMatchRecord = (row: RosterRow) => Number(row.stats?.game ?? 0) > 0;

function rosterProblems(rows: RosterRow[]): string[] {
  const problems: string[] = [];
  const firstRowOfJersey = new Map<string, number>();

  rows.forEach((row, i) => {
    const label = `Baris ${i + 1}`;
    if (!row.name.trim()) problems.push(`${label}: nama pemain masih kosong`);

    const jersey = row.jersey.trim();
    if (!JERSEY_PATTERN.test(jersey)) {
      problems.push(`${label}: nomor punggung harus 0, 00, atau 1–99`);
    } else if (firstRowOfJersey.has(jersey)) {
      problems.push(`${label}: nomor ${jersey} sudah dipakai di baris ${firstRowOfJersey.get(jersey)! + 1}`);
    } else {
      firstRowOfJersey.set(jersey, i);
    }
  });

  return problems;
}

function nextFreeJersey(rows: RosterRow[]): string {
  const taken = new Set(rows.map((row) => row.jersey.trim()));
  for (let n = 1; n <= 99; n++) {
    if (!taken.has(String(n))) return String(n);
  }
  return taken.has("0") ? "00" : "0";
}

const NameInput = ({ value, onChange, label }: { value: string; onChange: (val: string) => void; label: string }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Nama Pemain"
      aria-label={label}
      aria-invalid={value.trim() === "" || undefined}
      maxLength={100}
      className={`h-full w-full rounded border bg-transparent px-2 py-1 text-center font-medium text-gray-700 transition-colors outline-none hover:border-gray-300 focus:border-[#1E88E5] focus:bg-blue-50/60 ${
        value.trim() === "" ? "border-red-500" : "border-transparent"
      }`}
    />
  );
};

const JerseyInput = ({
  value,
  onChange,
  label,
  invalid,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  invalid: boolean;
}) => {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
      aria-label={label}
      aria-invalid={invalid || undefined}
      maxLength={2}
      className={`w-full min-w-[44px] rounded border bg-transparent px-1 py-1 text-center font-medium text-gray-700 transition-colors outline-none hover:border-gray-300 focus:border-[#1E88E5] focus:bg-blue-50/60 ${
        invalid ? "border-red-500" : "border-transparent"
      }`}
    />
  );
};

export const TeamEditSection = ({ teamId, teamName = "NAMA HMD", onBack, onCancel, onSave }: TeamEditSectionProps) => {
  const canEdit = canEditData(useAuthStore((state) => state.user?.role));
  const lookup = teamId ?? teamName;
  const loadTeam = useCallback(() => getTeam(lookup), [lookup]);
  const { state, reload } = useAsyncData(loadTeam);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 pt-6 pb-12">
      <h1 className="mb-2 text-4xl font-bold text-[#2d3748]">Teams</h1>

      {/* Main White Card Container (With Blue Border as in design) */}
      <div className="w-full rounded-xl border-2 border-[#1E88E5] bg-white p-8 shadow-sm">
        {state.status === "ready" && canEdit ? (
          <TeamEditForm key={state.data.id} team={state.data} onBack={onBack} onCancel={onCancel} onSave={onSave} />
        ) : (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            {state.status === "loading" && (
              <div className="flex items-center gap-3 text-gray-600" role="status">
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
                <span>Memuat data tim...</span>
              </div>
            )}
            {state.status === "error" && (
              <>
                <p role="alert" className="font-medium text-red-700">
                  Data tim gagal dimuat: {state.message}
                </p>
                <button
                  type="button"
                  onClick={reload}
                  className="cursor-pointer rounded-full bg-[#389F9D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2C7D7B]"
                >
                  Coba Lagi
                </button>
              </>
            )}
            {state.status === "ready" && !canEdit && (
              <p role="alert" className="font-medium text-red-700">
                Akun ini hanya bisa melihat data tim, tidak bisa mengubahnya.
              </p>
            )}
            <button
              type="button"
              onClick={() => onBack?.()}
              className="cursor-pointer rounded-full bg-[#389F9D] px-8 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#2C7D7B]"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface TeamEditFormProps {
  team: Team;
  onBack?: () => void;
  onCancel?: () => void;
  onSave?: (updatedTeamName?: string) => void;
}

const TeamEditForm = ({ team, onBack, onCancel, onSave }: TeamEditFormProps) => {
  const [teamName, setTeamName] = useState(team.name);
  const [teamGroup, setTeamGroup] = useState(team.group);
  const [teamGroupId, setTeamGroupId] = useState(team.groupId);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);

  const [rows, setRows] = useState<RosterRow[]>(() =>
    team.players.map((player) => ({
      key: player.id,
      id: player.id,
      name: player.name,
      jersey: player.nopung,
      isCaptain: player.isCaptain,
      stats: player.stats,
    })),
  );
  const newRowCounter = useRef(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Logo langsung tersimpan ke database saat dipilih, terpisah dari tombol Save.
  const [logo, setLogo] = useState(team.logo);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoStatus, setLogoStatus] = useState<string | null>(null);

  const teamStats = team.teamStats ?? EMPTY_TEAM_STATS;
  const jerseyCounts = new Map<string, number>();
  for (const row of rows) {
    const jersey = row.jersey.trim();
    jerseyCounts.set(jersey, (jerseyCounts.get(jersey) ?? 0) + 1);
  }
  const isJerseyInvalid = (row: RosterRow) =>
    !JERSEY_PATTERN.test(row.jersey.trim()) || (jerseyCounts.get(row.jersey.trim()) ?? 0) > 1;

  const updateRow = (key: string, changes: Partial<RosterRow>) => {
    setSaveError(null);
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...changes } : row)));
  };

  const handleAddPlayer = () => {
    if (rows.length >= MAX_ROSTER) return;
    newRowCounter.current += 1;
    setSaveError(null);
    setRows((prev) => [
      ...prev,
      {
        key: `new-${newRowCounter.current}`,
        name: `Pemain ${prev.length + 1}`,
        jersey: nextFreeJersey(prev),
        isCaptain: prev.length === 0,
        stats: null,
      },
    ]);
  };

  const handleDeletePlayer = (key: string) => {
    setSaveError(null);
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const handleLogoSelect = async (file: File) => {
    setLogoBusy(true);
    setLogoError(null);
    setLogoStatus("Mengunggah logo...");
    try {
      const result = await uploadTeamLogo(team.id, file);
      setLogo(result.logo);
      setLogoStatus("Logo baru tersimpan.");
    } catch (err) {
      setLogoStatus(null);
      setLogoError(`Logo gagal diunggah: ${errorMessage(err)}`);
    } finally {
      setLogoBusy(false);
    }
  };

  const handleLogoRemove = async () => {
    setLogoBusy(true);
    setLogoError(null);
    setLogoStatus("Menghapus logo...");
    try {
      const result = await deleteTeamLogo(team.id);
      setLogo(result.logo);
      setLogoStatus("Logo dihapus. Tim kembali memakai logo IBL.");
    } catch (err) {
      setLogoStatus(null);
      setLogoError(`Logo gagal dihapus: ${errorMessage(err)}`);
    } finally {
      setLogoBusy(false);
    }
  };

  const handleSave = async () => {
    const problems = rosterProblems(rows);
    if (problems.length > 0) {
      const more = problems.length > 3 ? ` (+${problems.length - 3} lainnya)` : "";
      setSaveError(`Belum bisa disimpan. ${problems.slice(0, 3).join("; ")}${more}.`);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await saveRoster(
        team.id,
        rows.map((row) => ({
          ...(row.id ? { id: row.id } : {}),
          name: row.name.trim(),
          jerseyNumber: row.jersey.trim(),
          isCaptain: row.isCaptain,
        })),
      );
      onSave?.(teamName);
    } catch (err) {
      setSaveError(`Gagal menyimpan: ${errorMessage(err)}`);
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Card Header: Logo, Team Name, Group, and Edit Button */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <TeamLogo src={logo} alt={`Logo ${teamName}`} sizes="64px" className="object-contain drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold tracking-wide text-[#2d3748] uppercase">{teamName}</h2>
            <p className="font-medium text-gray-500">{teamGroup ?? "Belum masuk grup"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditInfoOpen(true)}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800"
        >
          <Pencil className="h-3.5 w-3.5 text-teal-600" />
          <span>Edit Nama & Grup</span>
        </button>
      </div>

      <TeamEditInfoModal
        open={isEditInfoOpen}
        team={{ id: team.id, name: teamName, group: teamGroup, groupId: teamGroupId }}
        onClose={() => setIsEditInfoOpen(false)}
        onSuccess={(updated) => {
          setTeamName(updated.name);
          setTeamGroup(updated.group);
          setTeamGroupId(updated.groupId);
          onSave?.(updated.name);
        }}
      />

      <hr className="mb-8 border-t border-[#94B8BC] opacity-50" />

      {/* 0. Logo Tim (langsung tersimpan) */}
      <div className="mb-10 max-w-md">
        <TeamLogoField
          inputId={`team-logo-${team.id}`}
          previewSrc={logo}
          canRemove={logo !== DEFAULT_TEAM_LOGO}
          busy={logoBusy}
          error={logoError}
          statusText={logoStatus}
          onSelect={handleLogoSelect}
          onRemove={handleLogoRemove}
        />
      </div>

      {/* 1. Team Statistic Table */}
      <div className="mb-10">
        <h3 className="mb-1 text-base font-extrabold text-[#2d3748]">Team Statistic</h3>
        <p className="mb-3 text-xs text-gray-600">
          Statistik dihitung otomatis dari hasil pertandingan, jadi tidak diubah di halaman ini.
        </p>
        <div className="max-w-2xl overflow-hidden overflow-x-auto rounded-lg border border-gray-200/80">
          <table className="w-full text-center text-sm">
            <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
              <tr>
                <th className="w-1/4 border-r border-white/50 bg-white p-3"></th>
                <th className="border-b border-white/50 p-3">G</th>
                <th className="border-b border-white/50 p-3">W</th>
                <th className="border-b border-white/50 p-3">L</th>
                <th className="border-b border-white/50 p-3">PM</th>
                <th className="border-b border-white/50 p-3">PA</th>
                <th className="border-b border-white/50 p-3">PD</th>
                <th className="border-b border-white/50 p-3">PTS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-white/50 bg-[#D9CDBF] p-3 font-bold text-[#2d3748]">Value</td>
                {(["G", "W", "L", "PM", "PA", "PD"] as const).map((field) => (
                  <td key={field} className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                    {teamStats[field] || "-"}
                  </td>
                ))}
                <td className="bg-white p-3 font-medium text-gray-700">{teamStats.PTS || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Roster + Player Total Statistic Table */}
      <div className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-[#2d3748]">Player Total Statistic ({rows.length} Pemain)</h3>
          <button
            type="button"
            onClick={handleAddPlayer}
            disabled={rows.length >= MAX_ROSTER}
            title={rows.length >= MAX_ROSTER ? `Maksimal ${MAX_ROSTER} pemain per tim` : undefined}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1E88E5] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#1565C0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Pemain</span>
          </button>
        </div>
        <div className="overflow-hidden overflow-x-auto rounded-lg border border-gray-200/80">
          <table className="w-full border-collapse text-center text-sm">
            <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
              <tr>
                <th className="w-[70px] border-r border-b border-white/50 p-3">NO</th>
                <th className="border-r border-b border-white/50 p-3">NAME</th>
                <th className="border-r border-b border-white/50 p-3">GAME</th>
                <th className="border-r border-b border-white/50 p-3">POINT</th>
                <th className="border-r border-b border-white/50 p-3">ASSIST</th>
                <th className="border-r border-b border-white/50 p-3">REBOUND</th>
                <th className="w-[50px] border-b p-3">HAPUS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const locked = hasMatchRecord(row);
                const onlyOne = rows.length <= 1;
                return (
                  <tr key={row.key} className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}>
                    <td className="border-r border-gray-200 p-1">
                      <JerseyInput
                        value={row.jersey}
                        invalid={isJerseyInvalid(row)}
                        label={`Nomor punggung baris ${idx + 1}`}
                        onChange={(jersey) => updateRow(row.key, { jersey })}
                      />
                    </td>
                    <td className="border-r border-gray-200 p-1 font-medium text-gray-700">
                      <NameInput
                        value={row.name}
                        label={`Nama pemain baris ${idx + 1}`}
                        onChange={(name) => updateRow(row.key, { name })}
                      />
                    </td>
                    <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.game || "-"}</td>
                    <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.point || "-"}</td>
                    <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.assist || "-"}</td>
                    <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.rebound || "-"}</td>
                    <td className="p-1 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleDeletePlayer(row.key)}
                        disabled={locked || onlyOne}
                        aria-label={`Hapus ${row.name || `pemain baris ${idx + 1}`}`}
                        title={
                          locked
                            ? "Pemain ini sudah tercatat di pertandingan, tidak bisa dihapus"
                            : onlyOne
                              ? "Tim harus memiliki minimal 1 pemain"
                              : "Hapus pemain"
                        }
                        className="cursor-pointer rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Player Average Statistic Table */}
      <div className="mb-12">
        <h3 className="mb-3 text-base font-extrabold text-[#2d3748]">Player Average Statistic</h3>
        <div className="overflow-hidden overflow-x-auto rounded-lg border border-gray-200/80">
          <table className="w-full border-collapse text-center text-sm">
            <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
              <tr>
                <th className="border-r border-b border-white/50 p-3">NAME</th>
                <th className="border-r border-b border-white/50 p-3">PPG</th>
                <th className="border-r border-b border-white/50 p-3">APG</th>
                <th className="border-r border-b border-white/50 p-3">RPG</th>
                <th className="border-r border-b border-white/50 p-3">FG%</th>
                <th className="border-r border-b border-white/50 p-3">3P%</th>
                <th className="border-r border-b border-white/50 p-3">2P%</th>
                <th className="border-b p-3">FT%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.key} className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}>
                  <td className="border-r border-gray-200 p-3 font-medium text-gray-700">{row.name}</td>
                  <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.ppg || "-"}</td>
                  <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.apg || "-"}</td>
                  <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.rpg || "-"}</td>
                  <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.fgPercent || "-"}</td>
                  <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.threePPercent || "-"}</td>
                  <td className="border-r border-gray-200 p-3 text-gray-600">{row.stats?.twoPPercent || "-"}</td>
                  <td className="p-3 text-gray-600">{row.stats?.ftPercent || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {saveError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {saveError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onBack?.()}
          disabled={isSaving}
          className="cursor-pointer rounded-full bg-[#389F9D] px-8 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#2C7D7B] disabled:opacity-60"
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onCancel?.()}
            disabled={isSaving}
            className="cursor-pointer rounded-full bg-[#EF4444] px-8 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#DC2626] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer rounded-full bg-[#F59E0B] px-8 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Menyimpan..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
};

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Check, Download, FileSpreadsheet, Plus, Search, Trash2, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";

import { ApiError } from "@/lib/apiClient";
import { errorMessage } from "@/lib/errors";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import {
  createTeam,
  deleteTeam,
  importTeams,
  JERSEY_PATTERN,
  listGroups,
  listTeams,
  MAX_ROSTER,
  uploadTeamLogo,
  type ImportTeamInput,
} from "@/lib/teamsApi";

import { TeamLogo } from "./TeamLogo";
import { TeamLogoField } from "./TeamLogoField";

interface TeamsLandingSectionProps {
  onTeamClick?: (teamId: string, teamName: string) => void;
}

interface Notice {
  tone: "success" | "error";
  text: string;
}

// Urutan natural: "HMD 2" sebelum "HMD 10" (backend mengurutkan per huruf).
const teamNameOrder = new Intl.Collator("id", { numeric: true, sensitivity: "base" });

/**
 * Ubah baris XLSX/CSV (NAMA_TIM, GROUP, NAMA_PEMAIN, NOPUNG, KAPTEN) menjadi
 * payload POST /api/teams/import. Baris pemain dengan nomor punggung tidak
 * valid dilaporkan, bukan diam-diam dilewati.
 */
function buildImportPayload(
  rows: Array<{
    line: number;
    teamName: string;
    group: string;
    playerName: string;
    nopung: string;
    isCaptain: boolean;
  }>,
): { teams: ImportTeamInput[]; problems: string[] } {
  const byName = new Map<string, ImportTeamInput>();
  const problems: string[] = [];

  for (const row of rows) {
    const key = row.teamName.toLowerCase();
    let team = byName.get(key);
    if (!team) {
      team = { name: row.teamName, ...(row.group ? { group: row.group } : {}), players: [] };
      byName.set(key, team);
    }
    if (!row.playerName) continue;

    if (!JERSEY_PATTERN.test(row.nopung)) {
      problems.push(
        `Baris ${row.line}: nomor punggung "${row.nopung || "(kosong)"}" untuk ${row.playerName} tidak valid`,
      );
      continue;
    }
    if (team.players.some((player) => player.jerseyNumber === row.nopung)) {
      problems.push(`Baris ${row.line}: nomor punggung ${row.nopung} dipakai dua kali di ${row.teamName}`);
      continue;
    }
    const isCaptain = row.isCaptain && !team.players.some((player) => player.isCaptain);
    team.players.push({ name: row.playerName, jerseyNumber: row.nopung, isCaptain });
  }

  for (const team of byName.values()) {
    if (team.players.length > MAX_ROSTER) {
      problems.push(`${team.name}: ${team.players.length} pemain, maksimal ${MAX_ROSTER}`);
    }
  }

  return { teams: [...byName.values()], problems };
}

export const TeamsLandingSection = ({ onTeamClick }: TeamsLandingSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const role = useAuthStore((state) => state.user?.role);
  const canEdit = canEditData(role);

  const loadTeams = useCallback(() => listTeams(), []);
  const { state: teamsState, reload: reloadTeams } = useAsyncData(loadTeams);
  const loadGroups = useCallback(() => listGroups(), []);
  const { state: groupsState } = useAsyncData(loadGroups);
  const teams = useMemo(
    () =>
      teamsState.status === "ready" ? [...teamsState.data].sort((a, b) => teamNameOrder.compare(a.name, b.name)) : [],
    [teamsState],
  );
  const groups = groupsState.status === "ready" ? groupsState.data : [];

  const [notice, setNotice] = useState<Notice | null>(null);

  // Modals state
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Delete state
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [isConfirmBulkModalOpen, setIsConfirmBulkModalOpen] = useState(false);

  // Import Conflict state (Opsi Timpa atau Tidak)
  const [pendingConflictImport, setPendingConflictImport] = useState<{
    teams: ImportTeamInput[];
    fileName: string;
    conflictingTeams: string[];
  } | null>(null);

  // Add Team Form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGroupId, setNewTeamGroupId] = useState<string | null>(null);
  const [newTeamPlayerCount, setNewTeamPlayerCount] = useState(15);
  const [newTeamLogo, setNewTeamLogo] = useState<File | null>(null);
  const [addTeamError, setAddTeamError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // Default: grup pertama dari database (Group A).
  const selectedGroupId = newTeamGroupId ?? groups[0]?.id ?? "";

  const logoPreview = useMemo(() => (newTeamLogo ? URL.createObjectURL(newTeamLogo) : null), [newTeamLogo]);
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  // Import state
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.group && team.group.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const closeAddTeamModal = () => {
    setIsAddTeamModalOpen(false);
    setNewTeamName("");
    setNewTeamGroupId(null);
    setNewTeamPlayerCount(15);
    setNewTeamLogo(null);
    setAddTeamError("");
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTeamName.trim();
    if (name.length < 2) {
      setAddTeamError("Nama tim minimal 2 karakter.");
      return;
    }
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setAddTeamError(`Tim dengan nama "${name}" sudah ada.`);
      return;
    }

    setIsCreating(true);
    setAddTeamError("");
    try {
      const count = Math.min(Math.max(newTeamPlayerCount, 1), MAX_ROSTER);
      const players = Array.from({ length: count }, (_, i) => ({
        name: `Pemain ${i + 1}`,
        jerseyNumber: String(i + 1),
        isCaptain: i === 0,
      }));
      const { team } = await createTeam({
        name,
        ...(selectedGroupId ? { group: selectedGroupId } : {}),
        players,
      });

      // Logo diunggah setelah tim ada di database (butuh ID tim).
      let logoProblem: string | null = null;
      if (newTeamLogo) {
        try {
          await uploadTeamLogo(team.id, newTeamLogo);
        } catch (err) {
          logoProblem = errorMessage(err);
        }
      }

      closeAddTeamModal();
      reloadTeams();
      setNotice(
        logoProblem
          ? {
              tone: "error",
              text: `Tim ${name} ditambahkan, tetapi logo gagal diunggah: ${logoProblem}. Unggah ulang dari halaman Edit tim.`,
            }
          : { tone: "success", text: `Tim ${name} berhasil ditambahkan.` },
      );
    } catch (err) {
      setAddTeamError(
        err instanceof ApiError && err.status === 409 ? `Tim dengan nama "${name}" sudah ada.` : errorMessage(err),
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmDeleteTeam = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeam(teamToDelete.id);
      setNotice({ tone: "success", text: `Tim ${teamToDelete.name} dihapus.` });
      reloadTeams();
    } catch (err) {
      setNotice({ tone: "error", text: `Tim ${teamToDelete.name} gagal dihapus: ${errorMessage(err)}` });
    } finally {
      setIsDeleting(false);
      setTeamToDelete(null);
    }
  };

  const toggleSelectTeam = (teamId: string) => {
    setSelectedTeamIds((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  const handleToggleSelectAll = () => {
    if (selectedTeamIds.length === filteredTeams.length && filteredTeams.length > 0) {
      setSelectedTeamIds([]);
    } else {
      setSelectedTeamIds(filteredTeams.map((t) => t.id));
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedTeamIds.length === 0) return;
    setIsDeleting(true);
    const ids = [...selectedTeamIds];
    const results = await Promise.allSettled(ids.map((id) => deleteTeam(id)));
    const nameOf = (id: string) => teams.find((t) => t.id === id)?.name ?? id;
    const failed = results.flatMap((result, i) =>
      result.status === "rejected" ? [`${nameOf(ids[i])} (${errorMessage(result.reason)})`] : [],
    );
    const removed = ids.length - failed.length;

    setNotice(
      failed.length > 0
        ? { tone: "error", text: `${removed} tim dihapus. Gagal: ${failed.join("; ")}` }
        : { tone: "success", text: `${removed} tim dihapus.` },
    );
    setIsDeleting(false);
    setSelectedTeamIds([]);
    setIsBulkDeleteMode(false);
    setIsConfirmBulkModalOpen(false);
    reloadTeams();
  };

  const runImport = async (payload: ImportTeamInput[], overwrite: boolean) => {
    setIsImporting(true);
    try {
      const result = await importTeams(payload, overwrite);
      const parts = [`${result.createdTeams} tim baru`];
      if (overwrite) parts.push(`${result.updatedTeams} tim ditimpa`);
      parts.push(`${result.createdPlayers} pemain baru`);
      setImportStatus(`Berhasil mengimpor: ${parts.join(", ")}.`);
      reloadTeams();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatus(null);
      }, 1500);
    } catch (err) {
      setImportStatus(`Import gagal: ${errorMessage(err)}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleResolveConflictImport = (overwrite: boolean) => {
    if (!pendingConflictImport) return;
    const { teams: payload } = pendingConflictImport;
    setPendingConflictImport(null);
    void runImport(payload, overwrite);
  };

  // Reusable file processing for both Click-to-upload & Drag-and-Drop
  const processFile = async (file: File) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls") && !lowerName.endsWith(".csv")) {
      setImportStatus("Format berkas tidak didukung. Harap unggah berkas .xlsx, .xls, atau .csv.");
      return;
    }

    try {
      setImportStatus("Membaca berkas...");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });

      if (!rawJson || rawJson.length <= 1) {
        setImportStatus("File kosong atau hanya berisi baris judul.");
        return;
      }

      // Expected header format: NAMA_TIM, GROUP, NAMA_PEMAIN, NOPUNG, KAPTEN
      const headers = (rawJson[0] as unknown[]).map((h) =>
        String(h || "")
          .trim()
          .toUpperCase(),
      );
      const teamNameIdx = headers.findIndex((h) => h.includes("TIM") || h.includes("TEAM"));
      const groupIdx = headers.findIndex((h) => h.includes("GROUP") || h.includes("GRUP"));
      // Important: Player Name must NOT match NAMA_TIM
      const playerIdx = headers.findIndex(
        (h) =>
          h.includes("PEMAIN") ||
          h.includes("PLAYER") ||
          h === "NAME" ||
          (h.includes("NAMA") && !h.includes("TIM") && !h.includes("TEAM")),
      );
      const nopungIdx = headers.findIndex(
        (h) => h.includes("NOPUNG") || h.includes("PUNG") || h.includes("JERSEY") || h === "NO" || h.includes("NUMBER"),
      );
      const captainIdx = headers.findIndex((h) => h.includes("KAPTEN") || h.includes("CAPTAIN") || h.includes("CAP"));

      const parsedRows: Parameters<typeof buildImportPayload>[0] = [];

      for (let i = 1; i < rawJson.length; i++) {
        const cols = (rawJson[i] as unknown[]) || [];
        if (cols.length === 0) continue;

        const teamName = String(teamNameIdx !== -1 ? cols[teamNameIdx] : cols[0] || "").trim();
        const group = String(groupIdx !== -1 ? (cols[groupIdx] ?? "") : cols[1] || "").trim();
        const playerName = String(playerIdx !== -1 ? (cols[playerIdx] ?? "") : cols[2] || "").trim();
        const nopung = String(nopungIdx !== -1 ? (cols[nopungIdx] ?? "") : (cols[3] ?? "")).trim();
        const capVal = String(captainIdx !== -1 ? cols[captainIdx] : cols[4] || "")
          .toLowerCase()
          .trim();
        const isCaptain = capVal === "true" || capVal === "1" || capVal === "ya" || capVal === "yes";

        if (teamName) {
          parsedRows.push({ line: i + 1, teamName, group, playerName, nopung, isCaptain });
        }
      }

      if (parsedRows.length === 0) {
        setImportStatus("Tidak ditemukan data valid dalam file.");
        return;
      }

      const { teams: payload, problems } = buildImportPayload(parsedRows);
      if (problems.length > 0) {
        const shown = problems.slice(0, 3).join("; ");
        const more = problems.length > 3 ? ` (+${problems.length - 3} lainnya)` : "";
        setImportStatus(`Perbaiki file dulu: ${shown}${more}`);
        return;
      }

      // Cek apakah ada tim dalam file yang sudah terdaftar di database
      const existingTeamNames = payload
        .map((team) => team.name)
        .filter((name) => teams.some((t) => t.name.toLowerCase() === name.toLowerCase()));

      if (existingTeamNames.length > 0) {
        setImportStatus(null);
        setPendingConflictImport({ teams: payload, fileName: file.name, conflictingTeams: existingTeamNames });
      } else {
        await runImport(payload, false);
      }
    } catch (err) {
      console.error("Error parsing file:", err);
      setImportStatus("Gagal membaca file. Pastikan format file Excel/CSV sesuai.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const downloadSampleTemplate = () => {
    const link = document.createElement("a");
    link.href = "/data_10_tim_basket.xlsx";
    link.setAttribute("download", "data_10_tim_basket.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const conferences = [...new Map(groups.map((g) => [g.conference.id, g.conference.name])).entries()];

  return (
    <div className="flex w-full flex-col gap-6 pt-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2d3748]">Teams</h1>
          <p className="mt-1 font-poppins text-sm text-gray-500">
            {teamsState.status === "ready"
              ? `Total ${teams.length} Tim Terdaftar dalam IBL 2K26`
              : teamsState.status === "loading"
                ? "Memuat daftar tim..."
                : "Daftar tim belum bisa dimuat"}
          </p>
        </div>

        {/* Buttons Tambah Tim & Import & Hapus Banyak (viewer hanya melihat) */}
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2.5">
            {teams.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsBulkDeleteMode(!isBulkDeleteMode);
                  setSelectedTeamIds([]);
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 font-poppins text-sm font-semibold shadow-xs transition-colors ${
                  isBulkDeleteMode
                    ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Pilih beberapa atau semua tim untuk dihapus sekaligus"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>{isBulkDeleteMode ? "Batal Hapus Banyak" : "Hapus Banyak"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 font-poppins text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Import XLSX / CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAddTeamError("");
                setIsAddTeamModalOpen(true);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#389F9D] px-5 py-2.5 font-poppins text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2C7D7B]"
            >
              <Plus className="h-4 w-4 text-white" />
              <span>Tambah Tim</span>
            </button>
          </div>
        )}
      </div>

      {/* Hasil aksi terakhir (tambah/hapus/upload) */}
      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 font-poppins text-sm ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Tutup pesan"
            className="shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bulk Delete Bar */}
      {isBulkDeleteMode && (
        <div className="animate-in fade-in flex flex-col items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm duration-200 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs leading-tight font-bold text-red-900">Mode Hapus Banyak Aktif</p>
              <p className="text-[11px] text-red-600">Klik kartu tim di bawah untuk memilih tim yang ingin dihapus</p>
            </div>
            <span className="ml-2 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-bold text-red-700 shadow-2xs">
              {selectedTeamIds.length} terpilih
            </span>
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs transition-colors hover:bg-gray-100"
            >
              {selectedTeamIds.length === filteredTeams.length && filteredTeams.length > 0
                ? "Batal Pilih Semua"
                : "Pilih Semua Tim"}
            </button>

            <button
              type="button"
              disabled={selectedTeamIds.length === 0}
              onClick={() => setIsConfirmBulkModalOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Terpilih ({selectedTeamIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Search Bar */}
      <div className="relative w-full max-w-4xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-full border-none bg-white py-3 pr-4 pl-11 font-poppins shadow-sm transition-shadow placeholder:text-gray-400 focus:ring-2 focus:ring-[#389F9D] focus:outline-none sm:text-sm"
          placeholder="Cari nama tim (e.g. HMD 1, Group A)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Status daftar tim */}
      {teamsState.status === "loading" && (
        <div className="flex items-center justify-center gap-3 py-12 font-poppins text-gray-600" role="status">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
          <span>Memuat daftar tim dari server...</span>
        </div>
      )}

      {teamsState.status === "error" && (
        <div className="flex flex-col items-center gap-3 py-12 text-center font-poppins" role="alert">
          <p className="font-medium text-red-700">Daftar tim gagal dimuat: {teamsState.message}</p>
          <button
            type="button"
            onClick={reloadTeams}
            className="cursor-pointer rounded-full bg-[#389F9D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2C7D7B]"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 3. Teams Grid (Original clean layout: Logo + Name with Bulk Select / Hover Delete Option) */}
      <div className="mt-8 grid grid-cols-3 gap-x-6 gap-y-12 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6">
        {filteredTeams.map((team) => {
          const isSelected = selectedTeamIds.includes(team.id);
          return (
            <div
              key={team.id}
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl p-3 transition-all duration-200 ${
                isBulkDeleteMode
                  ? isSelected
                    ? "scale-[1.03] bg-red-50/80 shadow-md ring-2 ring-red-500"
                    : "ring-1 ring-gray-200/80 hover:bg-gray-100/60"
                  : ""
              }`}
              onClick={() => {
                if (isBulkDeleteMode) {
                  toggleSelectTeam(team.id);
                } else {
                  onTeamClick?.(team.id, team.name);
                }
              }}
            >
              {/* Checkbox indicator when in bulk delete mode */}
              {isBulkDeleteMode ? (
                <div
                  className={`absolute -top-1.5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? "border-red-600 bg-red-600 text-white shadow-sm"
                      : "border-gray-300 bg-white text-transparent hover:border-red-400"
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              ) : canEdit ? (
                /* Tombol Hapus Tim Individual (Tanda Silang X) */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeamToDelete({ id: team.id, name: team.name });
                  }}
                  className="absolute -top-1.5 right-1 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:right-3"
                  title={`Hapus tim ${team.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}

              <div className="relative mb-3 h-24 w-24 transition-transform duration-300 group-hover:scale-105">
                <TeamLogo src={team.logo} sizes="96px" className="object-contain drop-shadow-md" />
              </div>
              <span className="max-w-full truncate px-1 text-center font-poppins text-lg font-bold text-[#2d3748]">
                {team.name}
              </span>
            </div>
          );
        })}
      </div>

      {teamsState.status === "ready" && teams.length === 0 && (
        <div className="py-12 text-center font-poppins text-gray-600">
          <p className="font-semibold text-gray-700">Belum ada tim terdaftar.</p>
          {canEdit && (
            <p className="mt-1 text-sm">Tambahkan tim lewat tombol Tambah Tim, atau import dari file XLSX/CSV.</p>
          )}
        </div>
      )}

      {teamsState.status === "ready" && teams.length > 0 && filteredTeams.length === 0 && (
        <div className="py-12 text-center font-poppins text-gray-600">
          Tidak ada tim yang cocok dengan &quot;{searchQuery}&quot;.
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Tambah Tim Baru */}
      {/* ========================================================================= */}
      {isAddTeamModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins backdrop-blur-xs duration-200">
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeAddTeamModal}
              aria-label="Tutup"
              className="absolute top-5 right-5 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tambah Tim Baru</h3>
                <p className="text-xs text-gray-500">Daftarkan tim baru ke turnamen IBL 2K26</p>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              {addTeamError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                >
                  {addTeamError}
                </div>
              )}

              <div>
                <label htmlFor="new-team-name" className="mb-1 block text-xs font-bold text-gray-700 uppercase">
                  Nama Tim <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-team-name"
                  type="text"
                  placeholder="Contoh: HMD 19 / Teknik Mesin"
                  value={newTeamName}
                  onChange={(e) => {
                    setNewTeamName(e.target.value);
                    setAddTeamError("");
                  }}
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="new-team-group" className="mb-1 block text-xs font-bold text-gray-700 uppercase">
                  Grup Pertandingan
                </label>
                <select
                  id="new-team-group"
                  value={selectedGroupId}
                  onChange={(e) => setNewTeamGroupId(e.target.value)}
                  disabled={groupsState.status !== "ready"}
                  className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:cursor-wait"
                >
                  {groupsState.status === "loading" && <option value="">Memuat grup...</option>}
                  {conferences.map(([conferenceId, conferenceName]) => (
                    <optgroup key={conferenceId} label={conferenceName}>
                      {groups
                        .filter((group) => group.conference.id === conferenceId)
                        .map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                  <option value="">Tanpa grup (belum diundi)</option>
                </select>
                {groupsState.status === "error" && (
                  <span className="mt-1 block text-[11px] text-red-700">
                    Daftar grup gagal dimuat; tim bisa disimpan tanpa grup dan diatur nanti.
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="new-team-players" className="mb-1 block text-xs font-bold text-gray-700 uppercase">
                  Jumlah Pemain Awal
                </label>
                <input
                  id="new-team-players"
                  type="number"
                  min={1}
                  max={MAX_ROSTER}
                  value={newTeamPlayerCount}
                  onChange={(e) => setNewTeamPlayerCount(parseInt(e.target.value, 10) || 15)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-gray-400">
                  Nama dan nomor punggung pemain bisa diubah di halaman Edit Tim.
                </span>
              </div>

              <TeamLogoField
                inputId="new-team-logo"
                previewSrc={logoPreview}
                canRemove={newTeamLogo !== null}
                busy={isCreating}
                statusText={newTeamLogo ? `${newTeamLogo.name} siap diunggah` : null}
                onSelect={setNewTeamLogo}
                onRemove={() => setNewTeamLogo(null)}
              />

              <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeAddTeamModal}
                  disabled={isCreating}
                  className="cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="cursor-pointer rounded-full bg-[#389F9D] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2C7D7B] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreating ? "Menyimpan..." : "Simpan Tim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Import Spreadsheet (XLSX / CSV) */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins backdrop-blur-xs duration-200"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportStatus(null);
              }}
              className="absolute top-5 right-5 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Import Data Tim & Pemain</h3>
                <p className="text-xs text-gray-500">Kompatibel dengan Spreadsheet / Excel / CSV</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <p className="text-xs leading-relaxed text-gray-600">
                Anda dapat mengunggah berkas CSV/XLSX yang berisi data tim dan pemain. Format kolom yang didukung:
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] text-gray-700">
                <code>NAMA_TIM, GROUP, NAMA_PEMAIN, NOPUNG, KAPTEN</code>
              </div>

              <div className="flex flex-col justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3 sm:flex-row sm:items-center">
                <span className="text-xs font-medium text-blue-800">Belum punya formatnya? Unduh template resmi:</span>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Upload Dropzone with Drag and Drop Support */}
              <div
                onClick={() => !isImporting && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${
                  isDragging
                    ? "scale-[1.01] border-[#389F9D] bg-emerald-50/70"
                    : "border-gray-300 bg-gray-50/50 hover:border-emerald-500 hover:bg-emerald-50/20"
                }`}
              >
                <div
                  className={`rounded-full p-3 ${isDragging ? "scale-110 bg-emerald-100" : "bg-emerald-50"} transition-all`}
                >
                  <Upload className={`h-8 w-8 ${isDragging ? "text-[#389F9D]" : "text-emerald-600"}`} />
                </div>
                <span className="text-center text-sm font-semibold text-gray-700">
                  {isImporting
                    ? "Mengimpor ke database..."
                    : isDragging
                      ? "Lepaskan file di sini untuk mengunggah"
                      : "Klik untuk Memilih File atau Tarik (Drag & Drop) ke Sini"}
                </span>
                <span className="text-center text-xs text-gray-400">(Mendukung berkas .xlsx, .xls, atau .csv)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                    e.target.value = "";
                  }}
                  tabIndex={-1}
                  aria-hidden="true"
                  // Bukan `hidden`: WebKit iOS menolak .click() pada input yang tidak dirender (AGENTS.md).
                  className="pointer-events-none absolute h-px w-px opacity-0"
                />
              </div>

              {importStatus && (
                <div
                  role={importStatus.startsWith("Berhasil") ? "status" : "alert"}
                  className={`rounded-xl p-3 text-center text-xs font-medium ${
                    importStatus.startsWith("Berhasil")
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {importStatus}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Konfirmasi Hapus Tim */}
      {/* ========================================================================= */}
      {teamToDelete && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins backdrop-blur-xs duration-200">
          <div className="animate-in zoom-in-95 relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-2xl duration-150">
            <button
              type="button"
              onClick={() => setTeamToDelete(null)}
              className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-xs">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>

            <h3 className="mb-1 text-lg font-bold text-gray-900">Hapus Tim {teamToDelete.name}?</h3>
            <p className="mb-6 text-xs leading-relaxed text-gray-500">
              Apakah Anda yakin ingin menghapus tim <strong>{teamToDelete.name}</strong>? Seluruh data pemain dan logo
              tim ini ikut terhapus. Tim yang sudah punya pertandingan tidak bisa dihapus.
            </p>

            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                disabled={isDeleting}
                className="flex-1 cursor-pointer rounded-full bg-gray-100 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeam}
                disabled={isDeleting}
                className="flex-1 cursor-pointer rounded-full bg-red-600 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? "Menghapus..." : "Hapus Tim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Konfirmasi Hapus Banyak (Bulk Delete) */}
      {/* ========================================================================= */}
      {isConfirmBulkModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins backdrop-blur-xs duration-200">
          <div className="animate-in zoom-in-95 relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-2xl duration-150">
            <button
              type="button"
              onClick={() => setIsConfirmBulkModalOpen(false)}
              className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-xs">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>

            <h3 className="mb-1 text-lg font-bold text-gray-900">Hapus {selectedTeamIds.length} Tim Terpilih?</h3>
            <p className="mb-6 text-xs leading-relaxed text-gray-500">
              Apakah Anda yakin ingin menghapus <strong>{selectedTeamIds.length} tim</strong> yang dipilih? Seluruh data
              pemain dan logo tim-tim ini akan dihapus secara permanen.
            </p>

            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmBulkModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 cursor-pointer rounded-full bg-gray-100 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 cursor-pointer rounded-full bg-red-600 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? "Menghapus..." : `Hapus (${selectedTeamIds.length}) Tim`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Konfirmasi Timpa / Gabung Data Tim yang Sudah Terdaftar */}
      {/* ========================================================================= */}
      {pendingConflictImport && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins backdrop-blur-xs duration-200">
          <div className="animate-in zoom-in-95 relative flex w-full max-w-md flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-2xl duration-150">
            <button
              type="button"
              onClick={() => setPendingConflictImport(null)}
              className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-xs">
              <FileSpreadsheet className="h-7 w-7 text-amber-600" />
            </div>

            <h3 className="mb-1 text-lg font-bold text-gray-900">Tim Sudah Terdaftar</h3>
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              Berkas <span className="font-semibold text-gray-800">&quot;{pendingConflictImport.fileName}&quot;</span>{" "}
              memuat <strong>{pendingConflictImport.conflictingTeams.length} tim</strong> yang sudah ada di sistem:
            </p>

            {/* List nama tim yang bentrok */}
            <div className="mb-4 flex max-h-36 w-full flex-wrap justify-center gap-1.5 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-3">
              {pendingConflictImport.conflictingTeams.map((name, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-2xs"
                >
                  {name}
                </span>
              ))}
            </div>

            <p className="mb-5 text-xs leading-relaxed font-medium text-gray-600">
              Apakah Anda ingin <strong>menimpa data</strong> pemain tim tersebut dengan data dari file, atau{" "}
              <strong>jangan timpa</strong> data yang sudah ada?
            </p>

            <div className="flex w-full flex-col items-center gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => setPendingConflictImport(null)}
                className="order-3 w-full cursor-pointer rounded-full px-4 py-2.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:order-1 sm:w-auto"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleResolveConflictImport(false)}
                className="order-2 w-full cursor-pointer rounded-full border border-gray-300 bg-gray-100 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 sm:flex-1"
              >
                Jangan Timpa
              </button>

              <button
                type="button"
                onClick={() => handleResolveConflictImport(true)}
                className="order-1 w-full cursor-pointer rounded-full bg-amber-600 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-700 sm:order-3 sm:flex-1"
              >
                Ya, Timpa Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

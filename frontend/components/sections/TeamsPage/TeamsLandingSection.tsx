"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Search, Plus, Upload, FileSpreadsheet, X, Download, Trash2, Check } from "lucide-react";
import * as XLSX from "xlsx";

import { ApiError } from "@/lib/apiClient";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import {
  type ImportTeamInput,
  JERSEY_PATTERN,
  MAX_ROSTER,
  createTeam,
  deleteTeam,
  errorMessage,
  importTeams,
  listGroups,
  listTeams,
  uploadTeamLogo,
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
  rows: Array<{ line: number; teamName: string; group: string; playerName: string; nopung: string; isCaptain: boolean }>,
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
      problems.push(`Baris ${row.line}: nomor punggung "${row.nopung || "(kosong)"}" untuk ${row.playerName} tidak valid`);
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
      teamsState.status === "ready"
        ? [...teamsState.data].sort((a, b) => teamNameOrder.compare(a.name, b.name))
        : [],
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

  const logoPreview = useMemo(
    () => (newTeamLogo ? URL.createObjectURL(newTeamLogo) : null),
    [newTeamLogo],
  );
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
      (team.group && team.group.toLowerCase().includes(searchQuery.toLowerCase()))
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
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
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
    if (
      !lowerName.endsWith(".xlsx") &&
      !lowerName.endsWith(".xls") &&
      !lowerName.endsWith(".csv")
    ) {
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
        String(h || "").trim().toUpperCase()
      );
      const teamNameIdx = headers.findIndex((h) => h.includes("TIM") || h.includes("TEAM"));
      const groupIdx = headers.findIndex((h) => h.includes("GROUP") || h.includes("GRUP"));
      // Important: Player Name must NOT match NAMA_TIM
      const playerIdx = headers.findIndex(
        (h) =>
          h.includes("PEMAIN") ||
          h.includes("PLAYER") ||
          h === "NAME" ||
          (h.includes("NAMA") && !h.includes("TIM") && !h.includes("TEAM"))
      );
      const nopungIdx = headers.findIndex(
        (h) => h.includes("NOPUNG") || h.includes("PUNG") || h.includes("JERSEY") || h === "NO" || h.includes("NUMBER")
      );
      const captainIdx = headers.findIndex(
        (h) => h.includes("KAPTEN") || h.includes("CAPTAIN") || h.includes("CAP")
      );

      const parsedRows: Parameters<typeof buildImportPayload>[0] = [];

      for (let i = 1; i < rawJson.length; i++) {
        const cols = (rawJson[i] as unknown[]) || [];
        if (cols.length === 0) continue;

        const teamName = String(teamNameIdx !== -1 ? cols[teamNameIdx] : cols[0] || "").trim();
        const group = String(groupIdx !== -1 ? cols[groupIdx] ?? "" : cols[1] || "").trim();
        const playerName = String(playerIdx !== -1 ? cols[playerIdx] ?? "" : cols[2] || "").trim();
        const nopung = String(nopungIdx !== -1 ? cols[nopungIdx] ?? "" : cols[3] ?? "").trim();
        const capVal = String(captainIdx !== -1 ? cols[captainIdx] : cols[4] || "").toLowerCase().trim();
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
    <div className="w-full flex flex-col gap-6 pt-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#2d3748]">Teams</h1>
          <p className="text-sm text-gray-500 font-poppins mt-1">
            {teamsState.status === "ready"
              ? `Total ${teams.length} Tim Terdaftar dalam IBL 2K26`
              : teamsState.status === "loading"
                ? "Memuat daftar tim..."
                : "Daftar tim belum bisa dimuat"}
          </p>
        </div>

        {/* Buttons Tambah Tim & Import & Hapus Banyak (viewer hanya melihat) */}
        {canEdit && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {teams.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsBulkDeleteMode(!isBulkDeleteMode);
                setSelectedTeamIds([]);
              }}
              className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-full border shadow-xs transition-colors cursor-pointer text-sm font-poppins ${
                isBulkDeleteMode
                  ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              }`}
              title="Pilih beberapa atau semua tim untuk dihapus sekaligus"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>{isBulkDeleteMode ? "Batal Hapus Banyak" : "Hapus Banyak"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-full border border-gray-300 shadow-xs transition-colors cursor-pointer text-sm font-poppins"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import XLSX / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddTeamError("");
              setIsAddTeamModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#389F9D] hover:bg-[#2C7D7B] text-white font-semibold px-5 py-2.5 rounded-full shadow-sm transition-colors cursor-pointer text-sm font-poppins"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Tambah Tim</span>
          </button>
        </div>
        )}
      </div>

      {/* Hasil aksi terakhir (tambah/hapus/upload) */}
      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-poppins ${
            notice.tone === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Tutup pesan"
            className="shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Delete Bar */}
      {isBulkDeleteMode && (
        <div className="bg-red-50/90 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-900 leading-tight">Mode Hapus Banyak Aktif</p>
              <p className="text-[11px] text-red-600">Klik kartu tim di bawah untuk memilih tim yang ingin dihapus</p>
            </div>
            <span className="ml-2 text-xs bg-white text-red-700 px-3 py-1 rounded-full border border-red-200 font-bold shadow-2xs">
              {selectedTeamIds.length} terpilih
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs"
            >
              {selectedTeamIds.length === filteredTeams.length && filteredTeams.length > 0
                ? "Batal Pilih Semua"
                : "Pilih Semua Tim"}
            </button>

            <button
              type="button"
              disabled={selectedTeamIds.length === 0}
              onClick={() => setIsConfirmBulkModalOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedTeamIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Search Bar */}
      <div className="relative w-full max-w-4xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3 bg-white border-none rounded-full shadow-sm focus:ring-2 focus:ring-[#389F9D] focus:outline-none sm:text-sm transition-shadow font-poppins placeholder:text-gray-400"
          placeholder="Cari nama tim (e.g. HMD 1, Group A)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Status daftar tim */}
      {teamsState.status === "loading" && (
        <div className="flex items-center gap-3 py-12 justify-center text-gray-600 font-poppins" role="status">
          <div className="w-6 h-6 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat daftar tim dari server...</span>
        </div>
      )}

      {teamsState.status === "error" && (
        <div className="flex flex-col items-center gap-3 py-12 text-center font-poppins" role="alert">
          <p className="text-red-700 font-medium">Daftar tim gagal dimuat: {teamsState.message}</p>
          <button
            type="button"
            onClick={reloadTeams}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-[#389F9D] hover:bg-[#2C7D7B] text-white transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 3. Teams Grid (Original clean layout: Logo + Name with Bulk Select / Hover Delete Option) */}
      <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-x-6 gap-y-12">
        {filteredTeams.map((team) => {
          const isSelected = selectedTeamIds.includes(team.id);
          return (
            <div
              key={team.id}
              className={`flex flex-col items-center justify-center cursor-pointer group relative p-3 rounded-2xl transition-all duration-200 ${
                isBulkDeleteMode
                  ? isSelected
                    ? "bg-red-50/80 ring-2 ring-red-500 shadow-md scale-[1.03]"
                    : "hover:bg-gray-100/60 ring-1 ring-gray-200/80"
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
                  className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all z-10 ${
                    isSelected
                      ? "bg-red-600 border-red-600 text-white shadow-sm"
                      : "bg-white border-gray-300 text-transparent hover:border-red-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : canEdit ? (
                /* Tombol Hapus Tim Individual (Tanda Silang X) */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeamToDelete({ id: team.id, name: team.name });
                  }}
                  className="absolute -top-1.5 right-1 sm:right-3 w-6 h-6 rounded-full bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer"
                  title={`Hapus tim ${team.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <div className="relative w-24 h-24 mb-3 transition-transform duration-300 group-hover:scale-105">
                <TeamLogo src={team.logo} sizes="96px" className="object-contain drop-shadow-md" />
              </div>
              <span className="text-[#2d3748] font-bold text-lg text-center font-poppins truncate max-w-full px-1">
                {team.name}
              </span>
            </div>
          );
        })}
      </div>

      {teamsState.status === "ready" && teams.length === 0 && (
        <div className="text-center py-12 text-gray-600 font-poppins">
          <p className="font-semibold text-gray-700">Belum ada tim terdaftar.</p>
          {canEdit && (
            <p className="text-sm mt-1">Tambahkan tim lewat tombol Tambah Tim, atau import dari file XLSX/CSV.</p>
          )}
        </div>
      )}

      {teamsState.status === "ready" && teams.length > 0 && filteredTeams.length === 0 && (
        <div className="text-center py-12 text-gray-600 font-poppins">
          Tidak ada tim yang cocok dengan &quot;{searchQuery}&quot;.
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Tambah Tim Baru */}
      {/* ========================================================================= */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[calc(100vh-2rem)] overflow-y-auto">
            <button
              type="button"
              onClick={closeAddTeamModal}
              aria-label="Tutup"
              className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tambah Tim Baru</h3>
                <p className="text-xs text-gray-500">Daftarkan tim baru ke turnamen IBL 2K26</p>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              {addTeamError && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {addTeamError}
                </div>
              )}

              <div>
                <label htmlFor="new-team-name" className="block text-xs font-bold text-gray-700 uppercase mb-1">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="new-team-group" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Grup Pertandingan
                </label>
                <select
                  id="new-team-group"
                  value={selectedGroupId}
                  onChange={(e) => setNewTeamGroupId(e.target.value)}
                  disabled={groupsState.status !== "ready"}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm bg-white cursor-pointer disabled:cursor-wait"
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
                  <span className="text-[11px] text-red-700 mt-1 block">
                    Daftar grup gagal dimuat; tim bisa disimpan tanpa grup dan diatur nanti.
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="new-team-players" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Jumlah Pemain Awal
                </label>
                <input
                  id="new-team-players"
                  type="number"
                  min={1}
                  max={MAX_ROSTER}
                  value={newTeamPlayerCount}
                  onChange={(e) => setNewTeamPlayerCount(parseInt(e.target.value, 10) || 15)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
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

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAddTeamModal}
                  disabled={isCreating}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 rounded-full text-sm font-bold bg-[#389F9D] hover:bg-[#2C7D7B] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportStatus(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Import Data Tim & Pemain</h3>
                <p className="text-xs text-gray-500">Kompatibel dengan Spreadsheet / Excel / CSV</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <p className="text-gray-600 text-xs leading-relaxed">
                Anda dapat mengunggah berkas CSV/XLSX yang berisi data tim dan pemain. Format kolom yang didukung:
              </p>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-700 overflow-x-auto">
                <code>NAMA_TIM, GROUP, NAMA_PEMAIN, NOPUNG, KAPTEN</code>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <span className="text-xs text-blue-800 font-medium">
                  Belum punya formatnya? Unduh template resmi:
                </span>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
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
                className={`mt-2 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-[#389F9D] bg-emerald-50/70 scale-[1.01]"
                    : "border-gray-300 hover:border-emerald-500 bg-gray-50/50 hover:bg-emerald-50/20"
                }`}
              >
                <div className={`p-3 rounded-full ${isDragging ? "bg-emerald-100 scale-110" : "bg-emerald-50"} transition-all`}>
                  <Upload className={`w-8 h-8 ${isDragging ? "text-[#389F9D]" : "text-emerald-600"}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {isImporting
                    ? "Mengimpor ke database..."
                    : isDragging
                      ? "Lepaskan file di sini untuk mengunggah"
                      : "Klik untuk Memilih File atau Tarik (Drag & Drop) ke Sini"}
                </span>
                <span className="text-xs text-gray-400 text-center">
                  (Mendukung berkas .xlsx, .xls, atau .csv)
                </span>
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
                  className="absolute pointer-events-none opacity-0 w-px h-px"
                />
              </div>

              {importStatus && (
                <div
                  role={importStatus.startsWith("Berhasil") ? "status" : "alert"}
                  className={`p-3 rounded-xl text-xs font-medium text-center ${
                    importStatus.startsWith("Berhasil")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {importStatus}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setTeamToDelete(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mt-2 shadow-xs">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Hapus Tim {teamToDelete.name}?
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus tim <strong>{teamToDelete.name}</strong>? Seluruh data pemain dan logo tim ini ikut terhapus. Tim yang sudah punya pertandingan tidak bisa dihapus.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeam}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors cursor-pointer disabled:opacity-70"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsConfirmBulkModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mt-2 shadow-xs">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Hapus {selectedTeamIds.length} Tim Terpilih?
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{selectedTeamIds.length} tim</strong> yang dipilih? Seluruh data pemain dan logo tim-tim ini akan dihapus secara permanen.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsConfirmBulkModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors cursor-pointer disabled:opacity-70"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setPendingConflictImport(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mt-2 shadow-xs">
              <FileSpreadsheet className="w-7 h-7 text-amber-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Tim Sudah Terdaftar
            </h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Berkas <span className="font-semibold text-gray-800">&quot;{pendingConflictImport.fileName}&quot;</span> memuat <strong>{pendingConflictImport.conflictingTeams.length} tim</strong> yang sudah ada di sistem:
            </p>

            {/* List nama tim yang bentrok */}
            <div className="w-full max-h-36 overflow-y-auto bg-gray-50 p-3 rounded-2xl border border-gray-200 mb-4 flex flex-wrap gap-1.5 justify-center">
              {pendingConflictImport.conflictingTeams.map((name, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white text-gray-800 font-semibold text-[11px] rounded-lg border border-gray-200 shadow-2xs"
                >
                  {name}
                </span>
              ))}
            </div>

            <p className="text-xs text-gray-600 mb-5 font-medium leading-relaxed">
              Apakah Anda ingin <strong>menimpa data</strong> pemain tim tersebut dengan data dari file, atau <strong>jangan timpa</strong> data yang sudah ada?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setPendingConflictImport(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer order-3 sm:order-1"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleResolveConflictImport(false)}
                className="w-full sm:flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer order-2"
              >
                Jangan Timpa
              </button>

              <button
                type="button"
                onClick={() => handleResolveConflictImport(true)}
                className="w-full sm:flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors cursor-pointer order-1 sm:order-3"
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

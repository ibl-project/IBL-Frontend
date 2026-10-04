"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Search, Plus, Upload, FileSpreadsheet, X, Download, Trash2, Check } from "lucide-react";
import * as XLSX from "xlsx";

import { useTeamStore } from "@/lib/store/useTeamStore";

interface TeamsLandingSectionProps {
  onTeamClick?: (teamId: string, teamName: string) => void;
}

export const TeamsLandingSection = ({ onTeamClick }: TeamsLandingSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { teams, addTeam, deleteTeam, deleteTeams, importTeamsFromRawData } = useTeamStore();

  // Modals state
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(null);

  // Bulk Delete state
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [isConfirmBulkModalOpen, setIsConfirmBulkModalOpen] = useState(false);

  // Import Conflict state (Opsi Timpa atau Tidak)
  const [pendingConflictImport, setPendingConflictImport] = useState<{
    rows: Array<{
      teamName: string;
      group?: string;
      playerName?: string;
      nopung?: string;
      isCaptain?: boolean;
    }>;
    fileName: string;
    conflictingTeams: string[];
  } | null>(null);

  // Add Team Form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGroup, setNewTeamGroup] = useState("Group A");
  const [newTeamPlayerCount, setNewTeamPlayerCount] = useState(15);
  const [addTeamError, setAddTeamError] = useState("");

  // Import state
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.group && team.group.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setAddTeamError("Nama tim tidak boleh kosong!");
      return;
    }

    // Check duplicate
    const exists = teams.some(
      (t) => t.name.toLowerCase() === newTeamName.trim().toLowerCase()
    );
    if (exists) {
      setAddTeamError(`Tim dengan nama "${newTeamName.trim()}" sudah ada!`);
      return;
    }

    // Generate initial players for this new team
    const initialPlayers = Array.from({ length: Math.max(1, newTeamPlayerCount) }, (_, i) => ({
      name: `Pemain ${i + 1}`,
      nopung: String(i + 1),
      isCaptain: i === 0,
    }));

    addTeam({
      name: newTeamName.trim(),
      group: newTeamGroup,
      logo: "/images/LOGO_1.svg",
      players: initialPlayers,
    });

    setNewTeamName("");
    setNewTeamGroup("Group A");
    setNewTeamPlayerCount(15);
    setAddTeamError("");
    setIsAddTeamModalOpen(false);
  };

  const handleConfirmDeleteTeam = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete.id);
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

  const handleConfirmBulkDelete = () => {
    if (selectedTeamIds.length > 0) {
      deleteTeams(selectedTeamIds);
      setSelectedTeamIds([]);
      setIsBulkDeleteMode(false);
      setIsConfirmBulkModalOpen(false);
    }
  };

  const handleResolveConflictImport = (overwrite: boolean) => {
    if (!pendingConflictImport) return;
    importTeamsFromRawData(pendingConflictImport.rows, overwrite);
    setImportStatus(
      overwrite
        ? `Berhasil menimpa data ${pendingConflictImport.conflictingTeams.length} tim dan mengimpor ${pendingConflictImport.rows.length} data pemain!`
        : `Berhasil mengimpor data ${pendingConflictImport.rows.length} pemain tanpa menimpa tim yang sudah ada!`
    );
    setPendingConflictImport(null);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportStatus(null);
    }, 1500);
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
      const rawJson = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

      if (!rawJson || rawJson.length <= 1) {
        setImportStatus("File kosong atau hanya berisi baris judul.");
        return;
      }

      // Expected header format: NAMA_TIM, GROUP, NAMA_PEMAIN, NOPUNG, KAPTEN
      const headers = (rawJson[0] as any[]).map((h) =>
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

      const parsedRows: Array<{
        teamName: string;
        group?: string;
        playerName?: string;
        nopung?: string;
        isCaptain?: boolean;
      }> = [];

      for (let i = 1; i < rawJson.length; i++) {
        const cols = (rawJson[i] as any[]) || [];
        if (cols.length === 0) continue;

        const teamName = String(teamNameIdx !== -1 ? cols[teamNameIdx] : cols[0] || "").trim();
        const group = String(groupIdx !== -1 ? cols[groupIdx] : cols[1] || "Group A").trim();
        const playerName = String(playerIdx !== -1 ? cols[playerIdx] : cols[2] || "").trim();
        const nopung = String(nopungIdx !== -1 ? cols[nopungIdx] : cols[3] || "").trim();
        const capVal = String(captainIdx !== -1 ? cols[captainIdx] : cols[4] || "").toLowerCase().trim();
        const isCaptain = capVal === "true" || capVal === "1" || capVal === "ya" || capVal === "yes";

        if (teamName) {
          parsedRows.push({
            teamName,
            group: group || "Group A",
            playerName,
            nopung,
            isCaptain,
          });
        }
      }

      if (parsedRows.length > 0) {
        // Cek apakah ada tim dalam file yang sudah terdaftar di sistem
        const uploadedTeamNames = Array.from(new Set(parsedRows.map((r) => r.teamName)));
        const existingTeamNames = uploadedTeamNames.filter((name) =>
          teams.some((t) => t.name.toLowerCase() === name.toLowerCase())
        );

        if (existingTeamNames.length > 0) {
          // Buka modal konfirmasi apakah ingin menimpa data atau tidak
          setPendingConflictImport({
            rows: parsedRows,
            fileName: file.name,
            conflictingTeams: existingTeamNames,
          });
        } else {
          // Tidak ada tim yang bentrok, langsung import normal
          importTeamsFromRawData(parsedRows, false);
          setImportStatus(`Berhasil mengimpor ${parsedRows.length} data pemain & tim dari "${file.name}"!`);
          setTimeout(() => {
            setIsImportModalOpen(false);
            setImportStatus(null);
          }, 1500);
        }
      } else {
        setImportStatus("Tidak ditemukan data valid dalam file.");
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

  return (
    <div className="w-full flex flex-col gap-6 pt-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#2d3748]">Teams</h1>
          <p className="text-sm text-gray-500 font-poppins mt-1">
            Total {teams.length} Tim Terdaftar dalam IBL 2K26
          </p>
        </div>

        {/* Buttons Tambah Tim & Import & Hapus Banyak */}
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
      </div>

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
              ) : (
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
              )}

              <div className="relative w-24 h-24 mb-3 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={team.logo || "/images/LOGO_1.svg"}
                  alt={team.name}
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              <span className="text-[#2d3748] font-bold text-lg text-center font-poppins truncate max-w-full px-1">
                {team.name}
              </span>
            </div>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12 text-gray-500 font-poppins">
          No teams found matching "{searchQuery}"
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Tambah Tim Baru */}
      {/* ========================================================================= */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              type="button"
              onClick={() => setIsAddTeamModalOpen(false)}
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {addTeamError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nama Tim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: HMD 19 / Teknik Mesin"
                  value={newTeamName}
                  onChange={(e) => {
                    setNewTeamName(e.target.value);
                    setAddTeamError("");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Grup Pertandingan
                </label>
                <select
                  value={newTeamGroup}
                  onChange={(e) => setNewTeamGroup(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="Group A">Group A</option>
                  <option value="Group B">Group B</option>
                  <option value="Group C">Group C</option>
                  <option value="Group D">Group D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Jumlah Pemain Awal
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newTeamPlayerCount}
                  onChange={(e) => setNewTeamPlayerCount(parseInt(e.target.value, 10) || 15)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Pemain dapat diedit nama dan statistiknya di halaman Edit Tim.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-sm font-bold bg-[#389F9D] hover:bg-[#2C7D7B] text-white shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Tim
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
                onClick={() => fileInputRef.current?.click()}
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
                  {isDragging ? "Lepaskan file di sini untuk mengunggah" : "Klik untuk Memilih File atau Tarik (Drag & Drop) ke Sini"}
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
                  className="hidden"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium text-center ${
                    importStatus.startsWith("Berhasil")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
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
              Apakah Anda yakin ingin menghapus tim <strong>{teamToDelete.name}</strong>? Seluruh data pemain dan statistik tim ini akan dihapus dari daftar.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeam}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors cursor-pointer"
              >
                Hapus Tim
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
              Apakah Anda yakin ingin menghapus <strong>{selectedTeamIds.length} tim</strong> yang dipilih? Seluruh data pemain dan statistik dalam tim-tim ini akan dihapus secara permanen.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsConfirmBulkModalOpen(false)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors cursor-pointer"
              >
                Hapus ({selectedTeamIds.length}) Tim
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
              Berkas <span className="font-semibold text-gray-800">"{pendingConflictImport.fileName}"</span> memuat <strong>{pendingConflictImport.conflictingTeams.length} tim</strong> yang sudah ada di sistem:
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

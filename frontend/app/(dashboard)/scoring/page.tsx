"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useScoringSession } from "@/lib/hooks/useScoringSession";
import { type ScoringBoardItem, getScoringBoard } from "@/lib/matchesApi";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import { DatePicker } from "@/components/ui/DatePicker";
import { ScoringChooseMatchSection } from "@/components/sections/ScoringPage/ScoringChooseMatchSection";
import { ScoringLineupSection } from "@/components/sections/ScoringPage/ScoringLineupSection";
import { ScoringMatchListSection } from "@/components/sections/ScoringPage/ScoringMatchListSection";
import { ScoringMatchPanel } from "@/components/sections/ScoringPage/ScoringMatchPanel";
import { ScoringResetMatchDialog } from "@/components/sections/ScoringPage/ScoringResetMatchDialog";

/**
 * list   : card match yang sudah di-score + filter tanggal (Score, sampah)
 * choose : "+ Add Scoring", pilih jadwal yang belum dimulai
 * lineup : layar kapten & NOPUNG untuk jadwal yang dipilih → Create Match
 * desk   : scoring desk per periode (Quarter 1–4, OT, Total)
 */
type Mode = "list" | "choose" | "lineup" | "desk";

const BOARD_REFRESH_MS = 20_000;
// Data prototipe lama (sebelum scoring tersambung ke database).
const LEGACY_STORAGE_KEYS = ["ibl_teams_storage_v1", "ibl-match-store"];
// Layar yang sedang dibuka di tab ini, supaya refresh kembali ke tempat yang sama.
const VIEW_STORAGE_KEY = "ibl-scoring-view";

interface View {
  mode: Mode;
  focusId: string | null;
}

/** Halaman ini hanya dirender di browser (setelah sesi login dipulihkan), jadi aman membaca storage. */
function restoreView(): View {
  try {
    const saved = JSON.parse(sessionStorage.getItem(VIEW_STORAGE_KEY) ?? "null") as View | null;
    if (saved && ["list", "choose", "lineup", "desk"].includes(saved.mode)) return saved;
  } catch {
    // Storage diblokir atau isinya rusak: mulai dari awal.
  }
  return { mode: "list", focusId: null };
}

/** Urut jadwal (tanpa jadwal di akhir). */
function bySchedule(a: ScoringBoardItem, b: ScoringBoardItem): number {
  const time = (item: ScoringBoardItem) => (item.scheduledAt ? Date.parse(item.scheduledAt) : Number.POSITIVE_INFINITY);
  return time(a) - time(b);
}

export default function ScoringPage() {
  const canEdit = canEditData(useAuthStore((state) => state.user?.role));
  const [dateFilter, setDateFilter] = useState("");
  const loadBoard = useCallback(() => getScoringBoard(dateFilter || undefined), [dateFilter]);
  const { state: board, reload: reloadBoard } = useAsyncData(loadBoard);
  const [initialView] = useState(restoreView);
  const [mode, setMode] = useState<Mode>(initialView.mode);
  // Match yang sedang dikerjakan akun ini: di layar kapten (lineup) atau scoring desk.
  const [focusId, setFocusId] = useState<string | null>(initialView.focusId);
  // Pesan setelah hapus score, tampil di daftar.
  const [notice, setNotice] = useState<string | null>(null);
  // Card yang sedang dikonfirmasi lewat tombol sampah.
  const [resetTarget, setResetTarget] = useState<ScoringBoardItem | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify({ mode, focusId }));
    } catch {
      // Tidak bisa disimpan: refresh akan kembali ke daftar.
    }
  }, [mode, focusId]);

  useEffect(() => {
    try {
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
    } catch {
      // Storage diblokir browser: tidak ada yang perlu dibersihkan.
    }
  }, []);

  // Pemegang sesi, status periode, dan lock bisa berubah dari laptop lain.
  useEffect(() => {
    const timer = setInterval(reloadBoard, BOARD_REFRESH_MS);
    return () => clearInterval(timer);
  }, [reloadBoard]);

  // `opened` sudah urut nomor Match N dari backend.
  const opened = board.status === "ready" ? board.data.opened : [];
  const available = board.status === "ready" ? [...board.data.available].sort(bySchedule) : [];
  const focusItem = [...opened, ...available].find((match) => match.id === focusId) ?? null;
  // Mode yang dipulihkan setelah refresh bisa sudah tidak cocok dengan status match.
  const view: Mode =
    mode === "choose"
      ? "choose"
      : mode === "list" || !focusItem
        ? "list"
        : focusItem.status === "SCHEDULED"
          ? "lineup"
          : "desk";

  // Satu sesi untuk seluruh halaman, supaya pindah dari layar kapten ke
  // scoring desk tidak melepas lalu mengambil ulang sesi.
  const sessionMatchId = (view === "lineup" || view === "desk") && focusId && !focusItem?.locked ? focusId : null;
  const { session, recheck } = useScoringSession(sessionMatchId);

  const backToList = useCallback(() => {
    setMode("list");
    setFocusId(null);
    reloadBoard();
  }, [reloadBoard]);

  if (!canEdit) {
    return (
      <Shell subtitle={null}>
        <p className="py-32 text-center font-poppins text-base font-semibold text-[#202224]">
          Halaman Scoring khusus akun admin dan scorekeeper.
        </p>
      </Shell>
    );
  }

  const pill =
    "h-9 rounded-full bg-[#7a9ba8] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#688591] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a9ba8]";
  const subtitle =
    view === "desk" && focusItem
      ? `Match ${focusItem.matchNumber} · ${focusItem.team1.name} vs ${focusItem.team2.name}`
      : board.status === "ready"
        ? `Total ${opened.length} Pertandingan Terdaftar dalam IBL 2K26`
        : null;

  return (
    <Shell subtitle={subtitle} compact={view === "desk"}>
      {view === "list" && notice && (
        <div
          role="status"
          className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{notice}</span>
          <button type="button" aria-label="Tutup pesan" onClick={() => setNotice(null)} className="shrink-0 rounded-full p-1 hover:bg-black/5">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}

      {view === "list" && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <DatePicker id="scoring-date-filter" ariaLabel="Filter tanggal" value={dateFilter} onChange={setDateFilter} />
            <button type="button" onClick={() => setDateFilter("")} className={pill}>
              Reset
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setNotice(null);
              // Pilihan jadwal selalu menampilkan semua tanggal.
              setDateFilter("");
              setMode("choose");
              reloadBoard();
            }}
            className={pill}
          >
            + Add Scoring
          </button>
        </div>
      )}

      {board.status === "loading" && (
        <p role="status" className="py-24 text-center font-poppins text-sm text-gray-600">
          Memuat pertandingan...
        </p>
      )}

      {board.status === "error" && (
        <div role="alert" className="flex flex-col items-center gap-3 py-24 text-center font-poppins">
          <p className="text-sm font-medium text-red-700">Data scoring gagal dimuat: {board.message}</p>
          <button type="button" onClick={reloadBoard} className="rounded-full bg-[#7a9ba8] px-5 py-2 text-xs font-semibold text-white">
            Coba Lagi
          </button>
        </div>
      )}

      {board.status === "ready" && view === "list" && (
        <ScoringMatchListSection
          items={opened}
          filtered={dateFilter !== ""}
          onScore={(match) => {
            setNotice(null);
            setMode("desk");
            setFocusId(match.id);
          }}
          onDelete={setResetTarget}
        />
      )}

      {board.status === "ready" && view === "choose" && (
        <ScoringChooseMatchSection
          available={available}
          onChoose={(match) => {
            setMode("lineup");
            setFocusId(match.id);
          }}
          onCancel={backToList}
        />
      )}

      {board.status === "ready" && view === "lineup" && focusItem && (
        <ScoringLineupSection
          match={focusItem}
          session={session}
          onBack={() => {
            setMode("choose");
            setFocusId(null);
            reloadBoard();
          }}
          onStarted={() => {
            setMode("desk");
            reloadBoard();
          }}
        />
      )}

      {board.status === "ready" && view === "desk" && focusItem && (
        <ScoringMatchPanel
          key={focusItem.id}
          item={focusItem}
          session={session}
          recheckSession={recheck}
          onBoardChange={reloadBoard}
          onLeave={backToList}
        />
      )}

      <ScoringResetMatchDialog
        match={resetTarget}
        onClose={() => setResetTarget(null)}
        onDone={(message) => {
          setResetTarget(null);
          setNotice(message);
          reloadBoard();
        }}
      />
    </Shell>
  );
}

/** `compact`: jarak atas & samping tipis untuk scoring desk supaya dua tabel muat di laptop 1366 px. */
const Shell = ({
  subtitle,
  compact = false,
  children,
}: {
  subtitle: string | null;
  compact?: boolean;
  children: React.ReactNode;
}) => (
  <div className={`relative min-h-screen w-full bg-[#e1e7ea] font-poppins ${compact ? "px-4 py-4" : "px-6 py-6 md:px-[46px]"}`}>
    <div className={`flex w-full flex-col ${compact ? "" : "pt-6"}`}>
      <div className={compact ? "mb-4" : "mb-6"}>
        <h1 className={`font-bold tracking-[-0.11px] text-[#202224] ${compact ? "text-[26px]" : "text-[32px]"}`}>Scoring</h1>
        {subtitle && <p className={`mt-1 text-sm ${compact ? "font-semibold text-[#202224]" : "text-gray-600"}`}>{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

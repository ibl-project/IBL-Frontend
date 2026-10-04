"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { useScoringSession } from "@/lib/hooks/useScoringSession";
import { getScoringBoard } from "@/lib/matchesApi";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import { ScoringChooseMatchSection } from "@/components/sections/ScoringPage/ScoringChooseMatchSection";
import { ScoringLandingSection } from "@/components/sections/ScoringPage/ScoringLandingSection";
import { ScoringLineupSection } from "@/components/sections/ScoringPage/ScoringLineupSection";
import { ScoringMatchPanel } from "@/components/sections/ScoringPage/ScoringMatchPanel";

type Mode = "tabs" | "choose" | "lineup";

const BOARD_REFRESH_MS = 20_000;
// Data prototipe lama (sebelum scoring tersambung ke database).
const LEGACY_STORAGE_KEYS = ["ibl_teams_storage_v1", "ibl-match-store"];

export default function ScoringPage() {
  const canEdit = canEditData(useAuthStore((state) => state.user?.role));
  const loadBoard = useCallback(() => getScoringBoard(), []);
  const { state: board, reload: reloadBoard } = useAsyncData(loadBoard);
  const [mode, setMode] = useState<Mode>("tabs");
  // Match yang sedang dikerjakan akun ini: di layar kapten (lineup) atau tab Match N.
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    try {
      for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
    } catch {
      // Storage diblokir browser: tidak ada yang perlu dibersihkan.
    }
  }, []);

  // Pemegang sesi & status lock bisa berubah dari laptop lain.
  useEffect(() => {
    const timer = setInterval(reloadBoard, BOARD_REFRESH_MS);
    return () => clearInterval(timer);
  }, [reloadBoard]);

  const opened = board.status === "ready" ? board.data.opened : [];
  const available = board.status === "ready" ? board.data.available : [];
  const focusItem = [...opened, ...available].find((match) => match.id === focusId) ?? null;

  // Satu sesi untuk seluruh halaman, supaya pindah dari layar kapten ke
  // Match N tidak melepas lalu mengambil ulang sesi.
  const sessionMatchId = mode !== "choose" && focusId && !focusItem?.locked ? focusId : null;
  const { session, recheck } = useScoringSession(sessionMatchId);

  const openTab = (id: string) => {
    setMode("tabs");
    setFocusId(id);
  };

  if (!canEdit) {
    return (
      <Shell total={null}>
        <p className="py-32 text-center font-poppins text-base font-semibold text-[#202224]">
          Halaman Scoring khusus akun admin dan scorekeeper.
        </p>
      </Shell>
    );
  }

  return (
    <Shell total={opened.length}>
      {/* Tab Match N + tombol Add Scoring */}
      <div className="mb-8 flex items-center justify-between gap-4 overflow-x-auto rounded-[12px] bg-white px-6 py-4 shadow-sm">
        <div role="tablist" aria-label="Pertandingan" className="flex items-center gap-2">
          {opened.map((match) => {
            const active = mode === "tabs" && match.id === focusId;
            const takenBy = !match.locked && match.scoring.holder && !match.scoring.isMine ? match.scoring.holder.name : null;
            return (
              <button
                key={match.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => openTab(match.id)}
                title={
                  match.locked ? "Terkunci" : takenBy ? `Sedang dipakai ${takenBy}` : `${match.team1.name} vs ${match.team2.name}`
                }
                className={`flex h-[36px] shrink-0 items-center gap-1.5 rounded-full border px-4 font-poppins text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a9ba8] ${
                  active ? "border-transparent bg-[#e2e8f0] text-black" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Match {match.matchNumber}
                {match.locked && <Lock aria-label="terkunci" className="h-3.5 w-3.5" />}
                {takenBy && <span aria-label={`dipakai ${takenBy}`} className="h-2 w-2 rounded-full bg-amber-600" />}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            setMode("choose");
            setFocusId(null);
            reloadBoard();
          }}
          className="ml-4 flex h-[36px] shrink-0 items-center justify-center rounded-full bg-[#7a9ba8] px-6 font-poppins text-[12px] font-semibold text-white transition-colors hover:bg-[#688591] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a9ba8]"
        >
          + Add Scoring
        </button>
      </div>

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

      {board.status === "ready" && mode === "choose" && (
        <ScoringChooseMatchSection
          available={available}
          onChoose={(match) => {
            setMode("lineup");
            setFocusId(match.id);
          }}
          onCancel={() => setMode("tabs")}
        />
      )}

      {board.status === "ready" && mode === "lineup" && focusItem && (
        <ScoringLineupSection
          match={focusItem}
          session={session}
          onBack={() => {
            setMode("choose");
            setFocusId(null);
            reloadBoard();
          }}
          onStarted={() => {
            setMode("tabs");
            reloadBoard();
          }}
        />
      )}

      {board.status === "ready" && mode === "tabs" && (
        <>
          {opened.length === 0 && <ScoringLandingSection />}
          {opened.length > 0 && !focusItem && (
            <p className="py-24 text-center font-poppins text-sm text-gray-600">
              Pilih Match di atas untuk melanjutkan scoring, atau klik &quot;+ Add Scoring&quot;.
            </p>
          )}
          {focusItem && (
            <ScoringMatchPanel
              key={focusItem.id}
              item={focusItem}
              session={session}
              recheckSession={recheck}
              onBoardChange={reloadBoard}
              onLeave={() => {
                setFocusId(null);
                reloadBoard();
              }}
            />
          )}
        </>
      )}
    </Shell>
  );
}

const Shell = ({ total, children }: { total: number | null; children: React.ReactNode }) => (
  <div className="relative min-h-screen w-full bg-[#e1e7ea] px-6 py-6 font-poppins md:px-[46px]">
    <div className="flex w-full flex-col pt-6">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold tracking-[-0.11px] text-[#202224]">Scoring</h1>
        {total !== null && (
          <p className="mt-1 text-sm text-gray-600">Total {total} Pertandingan Terdaftar dalam IBL 2K26</p>
        )}
      </div>
      {children}
    </div>
  </div>
);

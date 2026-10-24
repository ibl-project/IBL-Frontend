"use client";

import React, { useCallback, useState } from "react";
import { getPlayoffs, type PlayoffMatch } from "@/lib/standingsApi";
import { listTeams } from "@/lib/teamsApi";
import type { PlayoffRound } from "@/lib/matchesApi";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { PlayoffBracketBoard } from "./PlayoffBracketBoard";
import { PlayoffEditModal } from "./PlayoffEditModal";

export const PlayoffAdminSection: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Slot to edit
  const [activeSlot, setActiveSlot] = useState<{
    round: PlayoffRound;
    position: number;
    match: PlayoffMatch | null;
  } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const [playoffs, teams] = await Promise.all([
      getPlayoffs(),
      listTeams(),
    ]);
    return {
      playoffs,
      teams,
    };
  }, []);

  const { state, reload } = useAsyncData(fetchDashboardData);

  const handleEditSlot = (
    round: PlayoffRound,
    position: number,
    match: PlayoffMatch | null
  ) => {
    setActiveSlot({ round, position, match });
  };

  const handleSaved = (message: string) => {
    setToastMessage(message);
    reload();
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="flex w-full flex-col gap-8 pt-6 font-poppins">
      <h1 className="text-[32px] font-bold tracking-tight text-[#202224]">
        Playoff
      </h1>

      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-teal-600 hover:text-teal-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{state.message}</span>
          <button
            type="button"
            onClick={reload}
            className="underline font-semibold ml-4 hover:text-red-900"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Loading state */}
      {state.status === "loading" && (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="size-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Ready state */}
      {state.status === "ready" && (
        state.data.playoffs ? (
          <PlayoffBracketBoard
            playoffs={state.data.playoffs}
            onEditSlot={handleEditSlot}
          />
        ) : (
          <div className="min-h-[400px] flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Bracket playoff belum tersedia di backend.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Muat Ulang
            </button>
          </div>
        )
      )}

      {/* Edit Modal */}
      {activeSlot && state.status === "ready" && (
        <PlayoffEditModal
          open={Boolean(activeSlot)}
          round={activeSlot.round}
          position={activeSlot.position}
          match={activeSlot.match}
          teams={state.data.teams}
          onClose={() => setActiveSlot(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

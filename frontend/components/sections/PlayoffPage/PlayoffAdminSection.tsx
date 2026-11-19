"use client";

import React, { useCallback, useState } from "react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import type { PlayoffRound } from "@/lib/matchesApi";
import { getPlayoffs, type PlayoffMatch } from "@/lib/standingsApi";
import { listTeams } from "@/lib/teamsApi";

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
    const [playoffs, teams] = await Promise.all([getPlayoffs(), listTeams()]);
    return {
      playoffs,
      teams,
    };
  }, []);

  const { state, reload } = useAsyncData(fetchDashboardData);

  const handleEditSlot = (round: PlayoffRound, position: number, match: PlayoffMatch | null) => {
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
      <h1 className="text-[32px] font-bold tracking-tight text-[#202224]">Playoff</h1>

      {/* Toast feedback */}
      {toastMessage && (
        <div className="animate-fade-in flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-xs font-semibold text-teal-800 shadow-sm">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-4 font-bold text-teal-600 hover:text-teal-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <span>{state.message}</span>
          <button type="button" onClick={reload} className="ml-4 font-semibold underline hover:text-red-900">
            Coba lagi
          </button>
        </div>
      )}

      {/* Loading state */}
      {state.status === "loading" && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
        </div>
      )}

      {/* Ready state */}
      {state.status === "ready" &&
        (state.data.playoffs ? (
          <PlayoffBracketBoard playoffs={state.data.playoffs} onEditSlot={handleEditSlot} />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">Bracket playoff belum tersedia di backend.</p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              Muat Ulang
            </button>
          </div>
        ))}

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

"use client";

import React, { useState, useEffect } from "react";
import { ScoringLandingSection } from "@/components/sections/ScoringPage/ScoringLandingSection";
import { ScoringSearchTeamSection } from "@/components/sections/ScoringPage/ScoringSearchTeamSection";
import { ScoringBoxScoreSection } from "@/components/sections/ScoringPage/ScoringBoxScoreSection";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useMatchStore } from "@/lib/store/useMatchStore";

export default function ScoringPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    matches,
    activeMatchId,
    addMatch,
    removeMatch,
    setActiveMatchId,
    createMatch,
  } = useMatchStore();

  // Pastikan activeMatchId selalu valid jika matches ada
  useEffect(() => {
    if (matches.length > 0 && (!activeMatchId || !matches.some((m) => m.id === activeMatchId))) {
      setActiveMatchId(matches[0].id);
    }
  }, [matches, activeMatchId, setActiveMatchId]);

  // State modal konfirmasi hapus match
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  const handleAddMatch = () => {
    addMatch();
  };

  const handleRequestRemoveMatch = (id: number) => {
    setMatchToDelete(id);
  };

  const handleConfirmRemoveMatch = () => {
    if (matchToDelete === null) return;
    removeMatch(matchToDelete);
    setMatchToDelete(null);
  };

  const handleCreateMatch = (
    team1: string,
    team2: string,
    players1: any[],
    players2: any[]
  ) => {
    if (activeMatchId) {
      createMatch(activeMatchId, team1, team2, players1, players2);
    }
  };

  // SSR hydration guard
  if (!isMounted) {
    return (
      <div className="bg-[#e1e7ea] min-h-screen w-full flex items-center justify-center font-poppins">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const matchIndexToDelete =
    matchToDelete !== null
      ? matches.findIndex((m) => m.id === matchToDelete) + 1
      : 1;

  return (
    <div className="bg-[#e1e7ea] min-h-screen w-full px-6 py-6 md:px-[46px] font-poppins relative">
      {matches.length === 0 ? (
        <ScoringLandingSection onAddScoring={handleAddMatch} />
      ) : activeMatch?.mode === "BOX_SCORE" ? (
        <ScoringBoxScoreSection
          matches={matches}
          activeMatchId={activeMatchId}
          onAddScoring={handleAddMatch}
          onRemoveMatch={handleRequestRemoveMatch}
          onSelectMatch={setActiveMatchId}
          team1={activeMatch.team1!}
          team2={activeMatch.team2!}
          players1={activeMatch.players1!}
          players2={activeMatch.players2!}
        />
      ) : (
        <ScoringSearchTeamSection
          matches={matches}
          activeMatchId={activeMatchId}
          onAddScoring={handleAddMatch}
          onRemoveMatch={handleRequestRemoveMatch}
          onSelectMatch={setActiveMatchId}
          onCreate={handleCreateMatch}
          onBack={() => {
            if (activeMatchId) {
              handleRequestRemoveMatch(activeMatchId);
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: Konfirmasi Hapus Match */}
      {/* ========================================================================= */}
      {matchToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setMatchToDelete(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mt-2 shadow-xs">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Hapus Match {matchIndexToDelete}?
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus Match {matchIndexToDelete}? Data scoring dan pemain pada pertandingan ini akan dihapus secara permanen.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveMatch}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors cursor-pointer"
              >
                Hapus Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

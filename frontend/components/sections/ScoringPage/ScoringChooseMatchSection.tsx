"use client";

import React from "react";
import Link from "next/link";

import type { ScoringBoardItem } from "@/lib/matchesApi";
import { MatchCard } from "@/components/sections/ScheduleResultPage/MatchCard";

interface ScoringChooseMatchSectionProps {
  available: ScoringBoardItem[];
  onChoose: (match: ScoringBoardItem) => void;
  onCancel: () => void;
}

/**
 * "+ Add Scoring": pilih jadwal dari Schedule Result. Jadwal yang sedang
 * disiapkan akun lain tampil, tapi tidak bisa dipilih.
 */
export const ScoringChooseMatchSection = ({ available, onChoose, onCancel }: ScoringChooseMatchSectionProps) => {
  return (
    <section aria-labelledby="choose-match-title" className="flex flex-col gap-6 font-poppins">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="choose-match-title" className="text-lg font-semibold text-[#202224]">
          Pilih jadwal pertandingan
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-full bg-[#f26722] px-5 text-xs font-semibold text-white hover:bg-[#d8581a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26722]"
        >
          Back
        </button>
      </div>

      {available.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[12px] bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-[#202224]">Belum ada jadwal pertandingan</p>
          <p className="max-w-md text-sm text-gray-600">
            Scoring hanya bisa dimulai dari jadwal. Buat jadwalnya dulu di halaman Schedule Result, lalu kembali ke
            sini.
          </p>
          <Link
            href="/schedule-result"
            className="rounded-full bg-[#7a9ba8] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#688591] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a9ba8]"
          >
            Buka Schedule Result
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2 2xl:px-12">
          {available.map((match) => {
            const takenBy = match.scoring.holder && !match.scoring.isMine ? match.scoring.holder.name : null;
            return (
              <MatchCard
                key={match.id}
                match={match}
                actionLabel={match.scoring.isMine ? "Lanjutkan" : "Choose"}
                onAction={() => onChoose(match)}
                disabled={takenBy !== null}
                note={takenBy ? `Sedang dipakai ${takenBy}` : null}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

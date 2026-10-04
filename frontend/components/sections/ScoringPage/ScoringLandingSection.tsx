import React from "react";

/**
 * ScoringLandingSection (Photo 4)
 *
 * Catatan untuk staff:
 * - Bagian ini adalah tampilan awal landing Scoring saat belum ada match.
 * - Berisi:
 *   1. Header judul "Scoring"
 *   2. Tombol "+ Add Scoring" (memicu tampilan search tim Photo 5)
 *   3. Pesan/status "Belum ada scoring"
 */
export const ScoringLandingSection = ({ onAddScoring }: { onAddScoring?: () => void }) => {
  return (
    <div className="flex flex-col w-full h-full pt-6">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-[#202224] font-poppins tracking-[-0.11px]">
          Scoring
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          Total 0 Pertandingan Terdaftar dalam IBL 2K26
        </p>
      </div>

      <div className="bg-white flex items-center justify-between px-[44px] py-[18px] rounded-[12px] mb-8">
        <div className="h-[28px] w-[91px]"></div>
        
        <button 
          onClick={onAddScoring}
          className="bg-[#7a9ba8] hover:bg-[#688591] transition-colors flex items-center justify-center px-[24px] py-[10px] rounded-full h-[36px]"
        >
          <span className="font-semibold text-[12px] text-white font-poppins">
            + Add Scoring
          </span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-32">
        <p className="font-semibold text-[18px] text-[#202224] font-poppins">
          Belum ada scoring
        </p>
      </div>
    </div>
  );
};

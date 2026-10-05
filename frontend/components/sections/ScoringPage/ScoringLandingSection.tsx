import React from "react";

/**
 * Isi halaman Scoring saat belum ada match yang dimulai.
 * Judul, total, dan tombol "+ Add Scoring" ada di halaman (scoring/page.tsx).
 */
export const ScoringLandingSection = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pt-32 pb-32">
      <p className="font-semibold text-[18px] text-[#202224] font-poppins">Belum ada scoring</p>
      <p className="mt-2 max-w-md text-center text-sm text-gray-600 font-poppins">
        Klik &quot;+ Add Scoring&quot; lalu pilih jadwal pertandingan yang sudah dibuat di Schedule Result.
      </p>
    </div>
  );
};

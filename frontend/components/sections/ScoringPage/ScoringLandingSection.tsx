import React from "react";

/**
 * Isi halaman Scoring saat belum ada match yang di-score (atau tidak ada di
 * tanggal yang difilter). Tombol "+ Add Scoring" ada di halaman.
 */
export const ScoringLandingSection = ({ filtered }: { filtered: boolean }) => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[12px] bg-white px-6 py-16 text-center font-poppins">
      <p className="text-lg font-semibold text-[#202224]">
        {filtered ? "Tidak ada match di tanggal ini" : "Belum ada scoring"}
      </p>
      {!filtered && (
        <p className="max-w-md text-sm text-gray-600">
          Klik &quot;+ Add Scoring&quot; lalu pilih jadwal pertandingan yang sudah dibuat di Schedule Result.
        </p>
      )}
    </div>
  );
};

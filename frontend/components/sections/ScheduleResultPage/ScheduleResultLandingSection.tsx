"use client";

import React from "react";

import type { AsyncState } from "@/lib/hooks/useAsyncData";
import type { MatchListItem } from "@/lib/matchesApi";
import { DatePicker } from "@/components/ui/DatePicker";
import { MatchCard } from "./MatchCard";

interface ScheduleResultLandingSectionProps {
  matches: AsyncState<MatchListItem[]>;
  dateFilter: string;
  onDateChange: (date: string) => void;
  onReload: () => void;
  /** null untuk viewer: tombol "+ Add Schedule" disembunyikan. */
  onAdd: (() => void) | null;
  onDetail: (matchId: string) => void;
  /** Pesan hasil aksi terakhir (tambah/edit/hapus), tampil di bawah toolbar. */
  notice?: React.ReactNode;
}

/** Daftar jadwal (desain "Schedule Result [Empty]" dan "[Display]"). */
export const ScheduleResultLandingSection = ({
  matches,
  dateFilter,
  onDateChange,
  onReload,
  onAdd,
  onDetail,
  notice,
}: ScheduleResultLandingSectionProps) => {
  const pill =
    "h-9 rounded-full bg-[#7a9ba8] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#688591] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a9ba8]";

  return (
    <div className="flex w-full flex-col gap-8 pt-6 font-poppins">
      <h1 className="text-[32px] font-bold tracking-tight text-[#202224]">Schedule Result</h1>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <DatePicker id="schedule-date-filter" ariaLabel="Filter tanggal" value={dateFilter} onChange={onDateChange} />
          <button type="button" onClick={() => onDateChange("")} className={pill}>
            Reset
          </button>
        </div>
        {onAdd && (
          <button type="button" onClick={onAdd} className={pill}>
            + Add Schedule
          </button>
        )}
      </div>

      {notice}

      {matches.status === "loading" && (
        <p role="status" className="py-24 text-center text-sm text-gray-600">
          Memuat jadwal...
        </p>
      )}

      {matches.status === "error" && (
        <div role="alert" className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm font-medium text-red-700">Jadwal gagal dimuat: {matches.message}</p>
          <button type="button" onClick={onReload} className={pill}>
            Coba Lagi
          </button>
        </div>
      )}

      {matches.status === "ready" && matches.data.length === 0 && (
        <p className="py-40 text-center text-lg font-semibold text-[#202224]">
          {dateFilter ? "Tidak ada schedule di tanggal ini" : "Belum ada schedule"}
        </p>
      )}

      {matches.status === "ready" && matches.data.length > 0 && (
        <div className="grid grid-cols-1 gap-x-10 gap-y-7 px-0 lg:grid-cols-2 2xl:px-12">
          {matches.data.map((match) => (
            <MatchCard key={match.id} match={match} actionLabel="Detail" onAction={() => onDetail(match.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Calendar, Plus, RotateCcw } from "lucide-react";
import { useScheduleStore, ScheduleItem } from "@/lib/store/useScheduleStore";

interface ScheduleResultLandingSectionProps {
  onOpenCreate: () => void;
  onOpenDetail: (scheduleId: string) => void;
}

export const ScheduleResultLandingSection: React.FC<ScheduleResultLandingSectionProps> = ({
  onOpenCreate,
  onOpenDetail,
}) => {
  const { schedules } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [inputDateText, setInputDateText] = useState<string>("");
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD
  const parseDDMMYYYYtoISO = (val: string): string => {
    const clean = val.trim();
    const parts = clean.split(/[/.-]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      if (year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  };

  // Format YYYY-MM-DD to DD/MM/YYYY
  const formatISOtoDDMMYYYY = (iso: string): string => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
  };

  // Handle typing directly in text field
  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Only allow digits and slashes
    val = val.replace(/[^\d/]/g, "");

    // Auto-insert slash after day and month if typing pure digits
    if (val.length === 2 && !val.includes("/")) {
      val = `${val}/`;
    } else if (val.length === 5 && (val.match(/\//g) || []).length === 1) {
      val = `${val}/`;
    }
    if (val.length > 10) {
      val = val.slice(0, 10);
    }

    setInputDateText(val);

    if (val.length === 10) {
      const iso = parseDDMMYYYYtoISO(val);
      if (iso) {
        setSelectedDate(iso);
      }
    } else if (val.length === 0) {
      setSelectedDate("");
    }
  };

  // Handle date selection from native calendar picker
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      setSelectedDate(isoVal);
      setInputDateText(formatISOtoDDMMYYYY(isoVal));
    } else {
      setSelectedDate("");
      setInputDateText("");
    }
  };

  // Filter schedules by rawDate if a date is selected or typed
  const activeFilterISO = selectedDate || (inputDateText.length === 10 ? parseDDMMYYYYtoISO(inputDateText) : "");
  const filteredSchedules = activeFilterISO
    ? schedules.filter((s) => s.rawDate === activeFilterISO)
    : schedules;

  const handleRequestReset = () => {
    if (inputDateText || selectedDate) {
      setIsConfirmResetOpen(true);
    }
  };

  const handleConfirmReset = () => {
    setSelectedDate("");
    setInputDateText("");
    setIsConfirmResetOpen(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-72px)] p-6 md:p-10 font-poppins text-slate-800 relative">
      {/* 1. Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          Schedule Result
        </h1>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Date Filter & Reset */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full sm:w-[200px] justify-between focus-within:ring-2 focus-within:ring-[#1A827E]/30 focus-within:border-[#1A827E] transition-all">
            <input
              type="text"
              value={inputDateText}
              onChange={handleDateTextChange}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              className="bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none w-full pr-2"
            />
            
            {/* Calendar Icon Button to Open Picker */}
            <button
              type="button"
              onClick={() => {
                try {
                  hiddenDateInputRef.current?.showPicker();
                } catch {
                  hiddenDateInputRef.current?.focus();
                }
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer shrink-0"
              title="Pilih tanggal dari kalender"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* Hidden native date picker */}
            <input
              type="date"
              ref={hiddenDateInputRef}
              value={selectedDate}
              onChange={handleNativeDateChange}
              className="absolute pointer-events-none opacity-0 w-px h-px [color-scheme:light]"
            />
          </div>

          <button
            type="button"
            onClick={handleRequestReset}
            className="px-4 py-2 bg-[#5B8288] hover:bg-[#4A6E74] text-white text-xs md:text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* + Add Schedule Button (Single Plus Sign) */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="w-full sm:w-auto px-6 py-2 bg-[#5B8288] hover:bg-[#4A6E74] text-white text-sm font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* 3. Schedules List Grid or Empty State */}
      {filteredSchedules.length === 0 ? (
        <div className="w-full py-28 flex flex-col items-center justify-center text-center">
          <p className="text-slate-600 font-semibold text-lg md:text-xl">
            Belum ada schedule
          </p>
          {(selectedDate || inputDateText) && (
            <button
              onClick={handleConfirmReset}
              className="mt-3 text-sm text-[#F4631E] hover:underline font-medium cursor-pointer"
            >
              Tampilkan semua schedule
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchedules.map((schedule: ScheduleItem) => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center justify-between gap-4"
            >
              {/* Team 1 */}
              <div className="flex flex-col items-center justify-center min-w-[70px] text-center">
                <div className="w-12 h-12 relative mb-2 flex items-center justify-center">
                  <Image
                    src={schedule.team1Logo || "/images/LOGO_1.svg"}
                    alt={schedule.team1}
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 line-clamp-1">
                  {schedule.team1}
                </span>
              </div>

              {/* Match Center Info */}
              <div className="flex flex-col items-center text-center flex-1 px-2">
                <span className="text-xs md:text-sm font-medium text-slate-600 line-clamp-1 mb-1">
                  {schedule.venue}
                </span>
                <span className="text-xs md:text-sm font-bold text-[#E63946] mb-3">
                  {schedule.date} {schedule.time}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenDetail(schedule.id)}
                  className="px-6 py-1.5 bg-[#F4631E] hover:bg-[#D85214] text-white text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow hover:scale-105 cursor-pointer"
                >
                  Detail
                </button>
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center justify-center min-w-[70px] text-center">
                <div className="w-12 h-12 relative mb-2 flex items-center justify-center">
                  <Image
                    src={schedule.team2Logo || "/images/LOGO_1.svg"}
                    alt={schedule.team2}
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 line-clamp-1">
                  {schedule.team2}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Konfirmasi Reset Filter Tanggal (Gaya Scoring Table) */}
      {/* ========================================================================= */}
      {isConfirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsConfirmResetOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mt-2 shadow-xs">
              <RotateCcw className="w-7 h-7 text-amber-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Reset Filter Tanggal?
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengatur ulang filter tanggal? Seluruh daftar jadwal pertandingan akan ditampilkan kembali.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsConfirmResetOpen(false)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-[#5B8288] hover:bg-[#4A6E74] shadow-md transition-colors cursor-pointer"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

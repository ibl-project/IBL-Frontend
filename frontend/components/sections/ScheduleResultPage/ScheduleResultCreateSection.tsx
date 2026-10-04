"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { useScheduleStore } from "@/lib/store/useScheduleStore";
import { useTeamStore } from "@/lib/store/useTeamStore";

interface ScheduleResultCreateSectionProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleResultCreateSection: React.FC<ScheduleResultCreateSectionProps> = ({
  onClose,
  onSuccess,
}) => {
  const { addSchedule } = useScheduleStore();
  const { teams } = useTeamStore();

  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [venue, setVenue] = useState("Lapangan Basket Fasor ITS");
  const [date, setDate] = useState("");
  const [dateText, setDateText] = useState("");
  const [time, setTime] = useState("11:00");
  const [error, setError] = useState("");
  const hiddenDateInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d/]/g, "");
    if (val.length === 2 && !val.includes("/")) {
      val = `${val}/`;
    } else if (val.length === 5 && (val.match(/\//g) || []).length === 1) {
      val = `${val}/`;
    }
    if (val.length > 10) val = val.slice(0, 10);
    setDateText(val);

    if (val.length === 10) {
      const iso = parseDDMMYYYYtoISO(val);
      if (iso) {
        setDate(iso);
        setError("");
      }
    } else {
      setDate("");
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    setDate(iso);
    if (iso) {
      const parts = iso.split("-");
      if (parts.length === 3) {
        setDateText(`${parts[2]}/${parts[1]}/${parts[0]}`);
      }
      setError("");
    } else {
      setDateText("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activeDate = date || (dateText.length === 10 ? parseDDMMYYYYtoISO(dateText) : "");

    if (!team1.trim()) {
      setError("Silakan pilih atau masukkan Team 1.");
      return;
    }
    if (!team2.trim()) {
      setError("Silakan pilih atau masukkan Team 2.");
      return;
    }
    if (team1.trim().toLowerCase() === team2.trim().toLowerCase()) {
      setError("Team 1 dan Team 2 tidak boleh sama.");
      return;
    }
    if (!activeDate) {
      setError("Silakan masukkan / pilih tanggal pertandingan yang valid (dd/mm/yyyy).");
      return;
    }
    if (!time) {
      setError("Silakan pilih jam pertandingan.");
      return;
    }

    addSchedule({
      team1: team1.trim(),
      team2: team2.trim(),
      venue: venue.trim() || "Lapangan Basket Fasor ITS",
      rawDate: activeDate,
      time: time.includes("WIB") ? time : `${time} WIB`,
      team1Logo: "/images/LOGO_1.svg",
      team2Logo: "/images/LOGO_1.svg",
    });

    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in font-poppins">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Tambah Schedule Baru
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Jadwalkan pertandingan antar tim di turnamen IBL 2K26
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Team Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Team 1 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="team1-options"
                  value={team1}
                  onChange={(e) => {
                    setTeam1(e.target.value);
                    setError("");
                  }}
                  placeholder="Pilih / ketik Team 1"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A827E]/30 focus:border-[#1A827E] transition-all"
                />
                <datalist id="team1-options">
                  {teams.map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
                  <option value="HMD 1" />
                  <option value="HMD 2" />
                  <option value="HMSI" />
                  <option value="HMIT" />
                  <option value="HMTK" />
                  <option value="HMTL" />
                </datalist>
              </div>
            </div>

            {/* Team 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Team 2 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="team2-options"
                  value={team2}
                  onChange={(e) => {
                    setTeam2(e.target.value);
                    setError("");
                  }}
                  placeholder="Pilih / ketik Team 2"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A827E]/30 focus:border-[#1A827E] transition-all"
                />
                <datalist id="team2-options">
                  {teams.map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
                  <option value="HMD 1" />
                  <option value="HMD 2" />
                  <option value="HMSI" />
                  <option value="HMIT" />
                  <option value="HMTK" />
                  <option value="HMTL" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Venue / Lokasi Pertandingan
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Lapangan Basket Fasor ITS"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A827E]/30 focus:border-[#1A827E] transition-all"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 justify-between focus-within:ring-2 focus-within:ring-[#1A827E]/30 focus-within:border-[#1A827E] transition-all">
                <input
                  type="text"
                  value={dateText}
                  onChange={handleDateTextChange}
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  className="bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none w-full pr-2"
                />
                
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

                <input
                  type="date"
                  ref={hiddenDateInputRef}
                  value={date}
                  onChange={handleNativeDateChange}
                  className="absolute pointer-events-none opacity-0 w-px h-px [color-scheme:light]"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Waktu (WIB) <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A827E]/30 focus:border-[#1A827E] transition-all cursor-pointer"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#F4631E] hover:bg-[#D85214] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#FFA000] hover:bg-[#E69000] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm hover:shadow"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

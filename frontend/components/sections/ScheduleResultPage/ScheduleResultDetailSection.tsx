"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, FileText, Download, Trash2, AlertTriangle } from "lucide-react";
import { useScheduleStore, ScheduleItem } from "@/lib/store/useScheduleStore";

interface ScheduleResultDetailSectionProps {
  scheduleId: string;
  onClose: () => void;
  onEdit: () => void;
}

export const ScheduleResultDetailSection: React.FC<ScheduleResultDetailSectionProps> = ({
  scheduleId,
  onClose,
  onEdit,
}) => {
  const { getScheduleById, deleteSchedule } = useScheduleStore();
  const schedule = getScheduleById(scheduleId);

  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const getFileBadge = (filename?: string) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls") {
      return { label: "XLS", bg: "bg-emerald-600" };
    }
    if (ext === "csv") {
      return { label: "CSV", bg: "bg-teal-600" };
    }
    return { label: "PDF", bg: "bg-red-500" };
  };

  if (!schedule) {
    return null;
  }

  const handleDelete = () => {
    deleteSchedule(scheduleId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in font-poppins">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-100 relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Top Header: Teams, Venue & DateTime */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center text-center min-w-[70px]">
            <div className="w-12 h-12 relative mb-1 flex items-center justify-center">
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

          {/* Center Info */}
          <div className="flex flex-col items-center text-center flex-1 px-2">
            <span className="text-xs font-semibold text-slate-700 mb-0.5">
              {schedule.venue}
            </span>
            <span className="text-xs font-bold text-[#E63946]">
              {schedule.date} {schedule.time}
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center text-center min-w-[70px]">
            <div className="w-12 h-12 relative mb-1 flex items-center justify-center">
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

        {/* 2. Result Section */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#F4631E] uppercase tracking-wider text-center mb-1.5">
            Result
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-xs text-slate-800 text-center">
              <thead>
                <tr className="bg-slate-50 font-bold text-slate-700">
                  <th className="border border-slate-300 py-1 px-2 text-left w-1/4">
                    Team
                  </th>
                  <th className="border border-slate-300 py-1 px-1.5">1st</th>
                  <th className="border border-slate-300 py-1 px-1.5">2nd</th>
                  <th className="border border-slate-300 py-1 px-1.5">3rd</th>
                  <th className="border border-slate-300 py-1 px-1.5">4th</th>
                  <th className="border border-slate-300 py-1 px-2 font-extrabold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 py-1 px-2 text-left font-bold">
                    {schedule.team1}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team1.q1}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team1.q2}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team1.q3}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team1.q4}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 font-extrabold">
                    {schedule.scores.team1.total}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-1 px-2 text-left font-bold">
                    {schedule.team2}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team2.q1}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team2.q2}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team2.q3}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-medium">
                    {schedule.scores.team2.q4}
                  </td>
                  <td className="border border-slate-300 py-1 px-2 font-extrabold">
                    {schedule.scores.team2.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Summary Section */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#F4631E] uppercase tracking-wider text-center mb-1.5">
            Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-xs text-slate-800 text-center">
              <thead>
                <tr className="bg-slate-50 font-bold text-slate-700">
                  <th className="border border-slate-300 py-1 px-2 w-[38%]">
                    {schedule.team1}
                  </th>
                  <th className="border border-slate-300 py-1 px-2 w-[24%]">
                    {/* Centered stat label header */}
                  </th>
                  <th className="border border-slate-300 py-1 px-2 w-[38%]">
                    {schedule.team2}
                  </th>
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team1.fieldGoals || "0/0 (0%)"}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                    Field Goals
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team2.fieldGoals || "0/0 (0%)"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team1.twoPoints || "0/0 (0%)"}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                    2 Points
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team2.twoPoints || "0/0 (0%)"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team1.threePoints || "0/0 (0%)"}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                    3 Points
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team2.threePoints || "0/0 (0%)"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team1.freeThrows || "0/0 (0%)"}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                    Free Throws
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team2.freeThrows || "0/0 (0%)"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team1.rebounds || "0/0"}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                    Rebounds (O/D)
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team2.rebounds || "0/0"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team1.assists || "0"}
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                    Assist
                  </td>
                  <td className="border border-slate-300 py-1 px-1.5">
                    {schedule.summary.team2.assists || "0"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Detailed Result Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#F4631E] uppercase tracking-wider text-center mb-1.5">
            Detailed Result
          </h3>
          {schedule.detailedResultFile ? (
            <div className="border border-[#E08A5E] bg-white rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${
                    getFileBadge(schedule.detailedResultFile.name).bg
                  } text-white flex flex-col items-center justify-center font-bold text-[10px] tracking-wider shadow-sm shrink-0`}
                >
                  <span>{getFileBadge(schedule.detailedResultFile.name).label}</span>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-slate-800 line-clamp-1">
                    {schedule.detailedResultFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {schedule.detailedResultFile.size} - uploaded {schedule.detailedResultFile.uploadedAt ? `(${schedule.detailedResultFile.uploadedAt})` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert(`Mengunduh berkas ${schedule.detailedResultFile?.name}`);
                }}
                className="p-2 text-slate-500 hover:text-[#1A827E] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Unduh Berkas"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border border-[#E08A5E] rounded-2xl py-4 px-4 text-center">
              <span className="text-xs font-medium text-slate-600">
                Belum ada data
              </span>
            </div>
          )}
        </div>

        {/* 5. Bottom Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setIsConfirmDelete(true)}
            className="px-5 py-2 bg-[#7E0202] hover:bg-[#600101] text-white text-xs md:text-sm font-semibold rounded-full transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            Delete
          </button>

          {/* Back & Edit Result Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#229799] hover:bg-[#1A827E] text-white text-xs md:text-sm font-semibold rounded-full transition-colors cursor-pointer shadow-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-6 py-2 bg-[#F4631E] hover:bg-[#D85214] text-white text-xs md:text-sm font-semibold rounded-full transition-colors cursor-pointer shadow-sm hover:shadow"
            >
              Edit Result
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay (Gaya Scoring Table) */}
        {isConfirmDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setIsConfirmDelete(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mt-2 shadow-xs">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Hapus Match {schedule.team1} vs {schedule.team2}?
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus jadwal pertandingan ini? Seluruh data hasil skor dan file statistik akan dihapus secara permanen.
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors cursor-pointer"
                >
                  Hapus Match
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

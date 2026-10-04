"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, UploadCloud, FileText, Trash2 } from "lucide-react";
import { useScheduleStore, ScheduleItem, DetailedFile } from "@/lib/store/useScheduleStore";

interface ScheduleResultEditSectionProps {
  scheduleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleResultEditSection: React.FC<ScheduleResultEditSectionProps> = ({
  scheduleId,
  onClose,
  onSuccess,
}) => {
  const { getScheduleById, updateSchedule } = useScheduleStore();
  const schedule = getScheduleById(scheduleId);

  // Scores state
  const [t1Q1, setT1Q1] = useState(schedule?.scores.team1.q1 === "-" ? "" : schedule?.scores.team1.q1 || "");
  const [t1Q2, setT1Q2] = useState(schedule?.scores.team1.q2 === "-" ? "" : schedule?.scores.team1.q2 || "");
  const [t1Q3, setT1Q3] = useState(schedule?.scores.team1.q3 === "-" ? "" : schedule?.scores.team1.q3 || "");
  const [t1Q4, setT1Q4] = useState(schedule?.scores.team1.q4 === "-" ? "" : schedule?.scores.team1.q4 || "");

  const [t2Q1, setT2Q1] = useState(schedule?.scores.team2.q1 === "-" ? "" : schedule?.scores.team2.q1 || "");
  const [t2Q2, setT2Q2] = useState(schedule?.scores.team2.q2 === "-" ? "" : schedule?.scores.team2.q2 || "");
  const [t2Q3, setT2Q3] = useState(schedule?.scores.team2.q3 === "-" ? "" : schedule?.scores.team2.q3 || "");
  const [t2Q4, setT2Q4] = useState(schedule?.scores.team2.q4 === "-" ? "" : schedule?.scores.team2.q4 || "");

  // Auto-calculated totals
  const calcTotal = (q1: string, q2: string, q3: string, q4: string) => {
    const sum =
      (parseInt(q1, 10) || 0) +
      (parseInt(q2, 10) || 0) +
      (parseInt(q3, 10) || 0) +
      (parseInt(q4, 10) || 0);
    return q1 || q2 || q3 || q4 ? String(sum) : "-";
  };

  const t1Total = calcTotal(t1Q1, t1Q2, t1Q3, t1Q4);
  const t2Total = calcTotal(t2Q1, t2Q2, t2Q3, t2Q4);

  // Summary state
  const [t1FG, setT1FG] = useState(schedule?.summary.team1.fieldGoals || "");
  const [t2FG, setT2FG] = useState(schedule?.summary.team2.fieldGoals || "");

  const [t12P, setT12P] = useState(schedule?.summary.team1.twoPoints || "");
  const [t22P, setT22P] = useState(schedule?.summary.team2.twoPoints || "");

  const [t13P, setT13P] = useState(schedule?.summary.team1.threePoints || "");
  const [t23P, setT23P] = useState(schedule?.summary.team2.threePoints || "");

  const [t1FT, setT1FT] = useState(schedule?.summary.team1.freeThrows || "");
  const [t2FT, setT2FT] = useState(schedule?.summary.team2.freeThrows || "");

  const [t1Reb, setT1Reb] = useState(schedule?.summary.team1.rebounds || "");
  const [t2Reb, setT2Reb] = useState(schedule?.summary.team2.rebounds || "");

  const [t1Ast, setT1Ast] = useState(schedule?.summary.team1.assists || "");
  const [t2Ast, setT2Ast] = useState(schedule?.summary.team2.assists || "");

  // File state
  const [uploadedFile, setUploadedFile] = useState<DetailedFile | null>(
    schedule?.detailedResultFile || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!schedule) {
    return null;
  }

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

  const processFile = (file: File) => {
    if (!file) return;

    const validExtensions = [".pdf", ".xlsx", ".xls", ".csv"];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setFileError("Format berkas tidak didukung. Harap unggah berkas .pdf, .xlsx, .xls, atau .csv.");
      return;
    }

    setFileError("");
    const sizeInMB = file.size / (1024 * 1024);
    const sizeFormatted =
      sizeInMB < 0.1
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${sizeInMB.toFixed(1)} MB`;

    setUploadedFile({
      name: file.name,
      size: sizeFormatted,
      uploadedAt: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateSchedule(scheduleId, {
      scores: {
        team1: {
          q1: t1Q1.trim() || "-",
          q2: t1Q2.trim() || "-",
          q3: t1Q3.trim() || "-",
          q4: t1Q4.trim() || "-",
          total: t1Total,
        },
        team2: {
          q1: t2Q1.trim() || "-",
          q2: t2Q2.trim() || "-",
          q3: t2Q3.trim() || "-",
          q4: t2Q4.trim() || "-",
          total: t2Total,
        },
      },
      summary: {
        team1: {
          fieldGoals: t1FG.trim() || "0/0 (0%)",
          twoPoints: t12P.trim() || "0/0 (0%)",
          threePoints: t13P.trim() || "0/0 (0%)",
          freeThrows: t1FT.trim() || "0/0 (0%)",
          rebounds: t1Reb.trim() || "0/0",
          assists: t1Ast.trim() || "0",
        },
        team2: {
          fieldGoals: t2FG.trim() || "0/0 (0%)",
          twoPoints: t22P.trim() || "0/0 (0%)",
          threePoints: t23P.trim() || "0/0 (0%)",
          freeThrows: t2FT.trim() || "0/0 (0%)",
          rebounds: t2Reb.trim() || "0/0",
          assists: t2Ast.trim() || "0",
        },
      },
      detailedResultFile: uploadedFile,
    });

    onSuccess();
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

        {/* 1. Header: Teams & DateTime */}
        <div className="flex items-center justify-between gap-2 pb-4 mb-4">
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

          <div className="flex flex-col items-center text-center flex-1 px-2">
            <span className="text-xs font-semibold text-slate-700 mb-0.5">
              {schedule.venue}
            </span>
            <span className="text-xs font-bold text-[#E63946]">
              {schedule.date} {schedule.time}
            </span>
          </div>

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

        <form onSubmit={handleSave}>
          {/* 2. Result Section Form */}
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
                  {/* Team 1 Score Row */}
                  <tr>
                    <td className="border border-slate-300 py-1 px-2 text-left font-bold">
                      {schedule.team1}
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t1Q1}
                        onChange={(e) => setT1Q1(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t1Q2}
                        onChange={(e) => setT1Q2(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t1Q3}
                        onChange={(e) => setT1Q3(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t1Q4}
                        onChange={(e) => setT1Q4(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-2 font-extrabold bg-slate-50 text-slate-800">
                      {t1Total}
                    </td>
                  </tr>

                  {/* Team 2 Score Row */}
                  <tr>
                    <td className="border border-slate-300 py-1 px-2 text-left font-bold">
                      {schedule.team2}
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t2Q1}
                        onChange={(e) => setT2Q1(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t2Q2}
                        onChange={(e) => setT2Q2(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t2Q3}
                        onChange={(e) => setT2Q3(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="number"
                        min="0"
                        value={t2Q4}
                        onChange={(e) => setT2Q4(e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1 px-0.5 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-2 font-extrabold bg-slate-50 text-slate-800">
                      {t2Total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Summary Section Form */}
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
                      {/* Metric Name */}
                    </th>
                    <th className="border border-slate-300 py-1 px-2 w-[38%]">
                      {schedule.team2}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Field Goals */}
                  <tr>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t1FG}
                        onChange={(e) => setT1FG(e.target.value)}
                        placeholder="e.g. 28/65 (43%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                      Field Goals
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t2FG}
                        onChange={(e) => setT2FG(e.target.value)}
                        placeholder="e.g. 26/62 (41%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                  </tr>

                  {/* 2 Points */}
                  <tr>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t12P}
                        onChange={(e) => setT12P(e.target.value)}
                        placeholder="e.g. 22/45 (48%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                      2 Points
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t22P}
                        onChange={(e) => setT22P(e.target.value)}
                        placeholder="e.g. 21/44 (47%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                  </tr>

                  {/* 3 Points */}
                  <tr>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t13P}
                        onChange={(e) => setT13P(e.target.value)}
                        placeholder="e.g. 6/20 (30%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                      3 Points
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t23P}
                        onChange={(e) => setT23P(e.target.value)}
                        placeholder="e.g. 5/18 (27%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                  </tr>

                  {/* Free Throws */}
                  <tr>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t1FT}
                        onChange={(e) => setT1FT(e.target.value)}
                        placeholder="e.g. 13/18 (72%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                      Free Throws
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t2FT}
                        onChange={(e) => setT2FT(e.target.value)}
                        placeholder="e.g. 13/16 (81%)"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                  </tr>

                  {/* Rebounds */}
                  <tr>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t1Reb}
                        onChange={(e) => setT1Reb(e.target.value)}
                        placeholder="e.g. 12/28"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                      Rebounds (O/D)
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t2Reb}
                        onChange={(e) => setT2Reb(e.target.value)}
                        placeholder="e.g. 10/25"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                  </tr>

                  {/* Assist */}
                  <tr>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t1Ast}
                        onChange={(e) => setT1Ast(e.target.value)}
                        placeholder="e.g. 18"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                    <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-800">
                      Assist
                    </td>
                    <td className="border border-slate-300 p-0.5">
                      <input
                        type="text"
                        value={t2Ast}
                        onChange={(e) => setT2Ast(e.target.value)}
                        placeholder="e.g. 14"
                        className="w-full text-center py-1 px-1 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A827E]"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Detailed Result Upload Area */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-[#F4631E] uppercase tracking-wider text-center mb-1.5">
              Detailed Result
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  processFile(file);
                  e.target.value = "";
                }
              }}
              accept=".pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="absolute pointer-events-none opacity-0 w-px h-px"
            />
            {uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm transition-all duration-200 ${
                  isDragging
                    ? "border-[#F4631E] bg-amber-50/70 ring-2 ring-[#F4631E]/30 scale-[1.01]"
                    : "border-[#E08A5E] bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${getFileBadge(
                      uploadedFile.name
                    ).bg} text-white flex flex-col items-center justify-center font-bold text-[10px] tracking-wider shadow-sm shrink-0`}
                  >
                    <span>{getFileBadge(uploadedFile.name).label}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-slate-800 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {uploadedFile.size} - uploaded {uploadedFile.uploadedAt ? `(${uploadedFile.uploadedAt})` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-xs text-[#F4631E] hover:underline font-semibold cursor-pointer"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setFileError("");
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Hapus berkas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl py-5 px-4 text-center cursor-pointer transition-all duration-200 select-none ${
                  isDragging
                    ? "border-[#F4631E] bg-amber-100/60 ring-2 ring-[#F4631E]/30 scale-[1.02]"
                    : "border-[#E08A5E]/60 bg-amber-50/20 hover:bg-amber-50/50 hover:border-[#E08A5E]"
                }`}
              >
                <UploadCloud
                  className={`w-6 h-6 mx-auto mb-1 transition-transform duration-200 ${
                    isDragging
                      ? "text-[#F4631E] scale-125"
                      : "text-[#F4631E] opacity-70"
                  }`}
                />
                <p className="text-xs font-medium text-slate-700">
                  {isDragging ? (
                    <span className="font-bold text-[#F4631E]">
                      Lepaskan berkas di sini...
                    </span>
                  ) : (
                    <>
                      Drop your files here or{" "}
                      <span className="underline font-semibold text-[#F4631E]">
                        click to upload
                      </span>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Format didukung: PDF, Excel (.xlsx, .xls, .csv)
                </p>
              </div>
            )}

            {fileError && (
              <p className="text-[11px] text-red-500 font-medium text-center mt-1.5">
                {fileError}
              </p>
            )}
          </div>

          {/* 5. Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2 bg-[#F4631E] hover:bg-[#D85214] text-white text-xs md:text-sm font-semibold rounded-full transition-colors cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-[#FFA000] hover:bg-[#E69000] text-white text-xs md:text-sm font-semibold rounded-full transition-colors cursor-pointer shadow-sm hover:shadow"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

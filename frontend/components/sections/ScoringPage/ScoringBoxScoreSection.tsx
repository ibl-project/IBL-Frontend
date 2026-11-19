"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  buildBoxScoreCsv,
  downloadCsv,
  exportFileName,
  exportPdf,
  exportSections,
  linesForView,
} from "@/lib/boxScoreExport";
import { periodLabel, type MatchSnapshot, type PlayerLine, type StatKey } from "@/lib/matchesApi";

import { ScoringExportSheet } from "./ScoringExportSheet";
import type { ScoringView } from "./ScoringQuarterTabs";

interface ScoringBoxScoreSectionProps {
  quarterTabs?: React.ReactNode;
  /** Data match dari server (nama pemain selalu mengikuti halaman Teams). */
  snapshot: MatchSnapshot;
  /** Periode yang ditampilkan, atau "total" (akumulasi semua periode). */
  view: ScoringView;
  /** true saat match dikunci atau akun ini bukan pemegang sesi (warna jersey ikut terkunci). */
  readOnly: boolean;
  /** Tombol ◀ ▶ hanya muncul di periode aktif milik pemegang sesi; selain itu angka saja. */
  canTap: boolean;
  /** `player` = baris pemain di tampilan ini (angka periode itu). */
  onStep: (side: 1 | 2, player: PlayerLine, stat: StatKey, delta: 1 | -1) => void;
  onColorsChange: (colors: { team1Color?: string; team2Color?: string }) => void;
  /** Tombol sesi (Save and Lock / Unlock / Keluar) + status simpan, di kiri bawah. */
  footer?: React.ReactNode;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export const STAT_LABEL: Record<StatKey, string> = {
  twoPointMade: "2 Point Made",
  twoPointMiss: "2 Point Miss",
  threePointMade: "3 Point Made",
  threePointMiss: "3 Point Miss",
  assist: "Assist",
  freethrowMade: "Freethrow Made",
  freethrowMiss: "Freethrow Miss",
  reboundOff: "Rebound Off",
  reboundDef: "Rebound Def",
  foul: "Foul",
};

interface PlayerStats {
  twoPointMade: number;
  twoPointMiss: number;
  threePointMade: number;
  threePointMiss: number;
  assist: number;
  freethrowMade: number;
  freethrowMiss: number;
  reboundOff: number;
  reboundDef: number;
  foul: number;
}

const initialStats = (): PlayerStats => ({
  twoPointMade: 0,
  twoPointMiss: 0,
  threePointMade: 0,
  threePointMiss: 0,
  assist: 0,
  freethrowMade: 0,
  freethrowMiss: 0,
  reboundOff: 0,
  reboundDef: 0,
  foul: 0,
});

const HMD_COLOR_PRESETS = [
  { name: "Biru Informatika", hex: "#1d4ed8" },
  { name: "Teal SI", hex: "#0f766e" },
  { name: "Merah Mesin", hex: "#b91c1c" },
  { name: "Kuning Sipil", hex: "#d97706" },
  { name: "Orange Arsitektur", hex: "#ea580c" },
  { name: "Ungu Elektro", hex: "#7e22ce" },
  { name: "Pink DKV", hex: "#db2777" },
  { name: "Maroon MB", hex: "#881337" },
  { name: "Navy UKM", hex: "#1e293b" },
  { name: "Hijau", hex: "#15803d" },
];

/**
 * Penghitung satu statistik di dalam sel tabel:
 * Berbentuk kapsul memanjang [ ◀  00  ▶ ] dengan panah SVG simetris dan angka tepat di tengah.
 */
const CounterPill = ({
  value,
  variant = "green",
  label,
  onIncrement,
  onDecrement,
}: {
  value: number;
  variant?: "green" | "red";
  /** Mis. "2 Point Made Budi Santoso", untuk pembaca layar. */
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  return (
    <div
      className={`mx-auto flex h-[28px] w-[64px] items-center justify-between rounded-full border px-0.5 shadow-2xs select-none sm:h-[30px] sm:w-[68px] ${
        variant === "green" ? "border-[#a5d6a7] bg-[#c8e6c9]" : "border-[#ef9a9a] bg-[#ffcdd2]"
      }`}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Kurangi ${label}`}
        title="Kurang"
        className="flex h-full w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-l-full transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-black active:scale-90 sm:w-[20px]"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-[#b71c1c] sm:h-[18px] sm:w-[18px]">
          <path d="M16 4L6 12l10 8z" />
        </svg>
      </button>
      <span className="flex-1 text-center font-mono text-[12px] leading-none font-black tracking-tight text-black select-none sm:text-[13px]">
        {String(value).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Tambah ${label}`}
        title="Tambah"
        className="flex h-full w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-r-full transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-black active:scale-90 sm:w-[20px]"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-[#1b5e20] sm:h-[18px] sm:w-[18px]">
          <path d="M8 4l10 8-10 8z" />
        </svg>
      </button>
    </div>
  );
};

/** Angka statistik di tampilan baca saja (periode terkunci, Total). */
const StaticCount = ({ value, variant = "green" }: { value: number; variant?: "green" | "red" }) => (
  <div
    className={`mx-auto flex h-[28px] w-[64px] items-center justify-center rounded-full border px-0.5 select-none sm:h-[30px] sm:w-[68px] ${
      variant === "green" ? "border-[#a5d6a7] bg-[#c8e6c9]" : "border-[#ef9a9a] bg-[#ffcdd2]"
    }`}
  >
    <span className="font-mono text-[12px] font-black tracking-tight text-black sm:text-[13px]">
      {String(value).padStart(2, "0")}
    </span>
  </div>
);

const isColorDark = (hex: string) => {
  if (!hex || hex === "#ffffff") return false;
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 155;
};

export const ScoringBoxScoreSection = ({
  quarterTabs,
  snapshot,
  view,
  readOnly,
  canTap,
  onStep,
  onColorsChange,
  footer,
}: ScoringBoxScoreSectionProps) => {
  // Export PDF: lembar statis dirender di luar layar dulu, lalu difoto per halaman.
  const sheetsRef = useRef<HTMLDivElement>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | null>(null);
  const isExporting = exportFormat !== null;

  const team1 = snapshot.team1.name ?? "Team 1";
  const team2 = snapshot.team2.name ?? "Team 2";
  const viewTitle = view === "total" ? "Total" : periodLabel(view);
  // Nama & nomor punggung dari server: nama mengikuti Teams, nomor mengikuti susunan pemain match ini.
  // Angka statistik mengikuti tampilan: satu periode, atau Total semua periode.
  const players1List = useMemo(() => linesForView(snapshot.team1.players, view), [snapshot.team1.players, view]);
  const players2List = useMemo(() => linesForView(snapshot.team2.players, view), [snapshot.team2.players, view]);

  // Warna jersey: tampil langsung, disimpan ke server setelah berhenti mengetik/memilih.
  const [color1, setColor1] = useState(snapshot.team1.color);
  const [color2, setColor2] = useState(snapshot.team2.color);
  const [syncedColors, setSyncedColors] = useState(`${snapshot.team1.color}|${snapshot.team2.color}`);
  if (syncedColors !== `${snapshot.team1.color}|${snapshot.team2.color}`) {
    setSyncedColors(`${snapshot.team1.color}|${snapshot.team2.color}`);
    setColor1(snapshot.team1.color);
    setColor2(snapshot.team2.color);
  }
  const [showColorPicker1, setShowColorPicker1] = useState(false);
  const [showColorPicker2, setShowColorPicker2] = useState(false);
  const colorTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(colorTimer.current), []);

  const saveColors = (colors: { team1Color?: string; team2Color?: string }) => {
    const value = colors.team1Color ?? colors.team2Color ?? "";
    if (readOnly || !HEX.test(value)) return;
    clearTimeout(colorTimer.current);
    colorTimer.current = setTimeout(() => onColorsChange(colors), 400);
  };

  const handleColor1Change = (newColor: string) => {
    setColor1(newColor);
    saveColors({ team1Color: newColor });
  };

  const handleColor2Change = (newColor: string) => {
    setColor2(newColor);
    saveColors({ team2Color: newColor });
  };

  const toStats = (lines: PlayerLine[]) =>
    Object.fromEntries(lines.map((line) => [line.id, line])) as { [playerId: string]: PlayerStats };
  const stats1 = useMemo(() => toStats(players1List), [players1List]);
  const stats2 = useMemo(() => toStats(players2List), [players2List]);

  const updateStat = (teamIdx: 1 | 2, playerId: string, statKey: StatKey, delta: 1 | -1) => {
    if (!canTap) return;
    const player = (teamIdx === 1 ? players1List : players2List).find((p) => p.id === playerId);
    if (player) onStep(teamIdx, player, statKey, delta);
  };

  // Calculate player total points
  const getPlayerPoints = (pStats: PlayerStats) => {
    return (pStats.twoPointMade || 0) * 2 + (pStats.threePointMade || 0) * 3 + (pStats.freethrowMade || 0) * 1;
  };

  // Calculate team total points
  const getTeamTotalPoints = (teamIdx: 1 | 2, playersList: PlayerLine[]) => {
    const s = teamIdx === 1 ? stats1 : stats2;
    return playersList.reduce((acc, p) => {
      const pStats = s[p.id] || initialStats();
      return acc + getPlayerPoints(pStats);
    }, 0);
  };

  // Skor di tampilan ini (periode atau Total) dan skor Total match untuk banner atas.
  const team1Score = getTeamTotalPoints(1, players1List);
  const team2Score = getTeamTotalPoints(2, players2List);
  const sumPoints = (players: PlayerLine[]) => players.reduce((sum, player) => sum + player.points, 0);
  const match1Score = sumPoints(snapshot.team1.players);
  const match2Score = sumPoints(snapshot.team2.players);

  // Dari tab mana pun: satu file berisi Quarter 1–4 (+ OT kalau ada), lalu Total.
  const sections = exportSections(snapshot);
  const fileBase = exportFileName(snapshot);

  const handleExportCSV = () => {
    if (isExporting) return;
    setExportFormat("csv");
    downloadCsv(buildBoxScoreCsv(snapshot, sections), `${fileBase}.csv`);
    setTimeout(() => setExportFormat(null), 800);
  };

  const handleExportPdf = () => {
    if (!isExporting) setExportFormat("pdf");
  };

  // Jalan setelah lembar export ikut dirender: satu halaman PDF per lembar.
  useEffect(() => {
    if (exportFormat !== "pdf") return;
    const container = sheetsRef.current;
    if (!container) return;
    let active = true;
    const run = async () => {
      try {
        await document.fonts?.ready;
        await exportPdf(Array.from(container.children) as HTMLElement[], `${fileBase}.pdf`);
      } catch (err) {
        console.error("Export PDF gagal:", err);
        alert("Gagal membuat file PDF. Silakan coba lagi.");
      } finally {
        if (active) setExportFormat(null);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [exportFormat, fileBase]);

  /** Satu sel statistik: ◀ ▶ di periode aktif, angka saja di tampilan baca saja. */
  const statCell = (teamIdx: 1 | 2, player: PlayerLine, stat: StatKey, variant: "green" | "red", teamName: string) => {
    const value = player[stat] || 0;
    return (
      <div className="flex h-full min-h-[40px] w-full items-center justify-center">
        {!canTap ? (
          <StaticCount value={value} variant={variant} />
        ) : (
          <CounterPill
            value={value}
            variant={variant}
            label={`${STAT_LABEL[stat]} ${player.name}, ${teamName}, ${viewTitle}`}
            onIncrement={() => updateStat(teamIdx, player.id, stat, 1)}
            onDecrement={() => updateStat(teamIdx, player.id, stat, -1)}
          />
        )}
      </div>
    );
  };

  const renderScoringTable = (teamIdx: 1 | 2, currentTeam: string, playersList: PlayerLine[], themeColor: string) => {
    const s = teamIdx === 1 ? stats1 : stats2;

    let totalPoints = 0;
    let totalAssists = 0;
    let totalOffReb = 0;
    let totalDefReb = 0;
    let totalFouls = 0;

    playersList.forEach((p) => {
      const pStats = s[p.id] || initialStats();
      totalPoints += getPlayerPoints(pStats);
      totalAssists += pStats.assist || 0;
      totalOffReb += pStats.reboundOff || 0;
      totalDefReb += pStats.reboundDef || 0;
      totalFouls += pStats.foul || 0;
    });

    const isCustom = themeColor && themeColor !== "#ffffff";
    const isDark = isCustom ? isColorDark(themeColor) : false;
    const headerBg = isCustom ? themeColor : "#ffffff";
    const headerText = isCustom ? (isDark ? "#ffffff" : "#000000") : "#000000";

    return (
      <div className="flex w-full flex-col">
        <table className="w-full table-fixed border-collapse border border-black bg-white font-poppins text-[11px] text-black">
          {/* Nama, NO, dan Total lebar tetap; 10 kolom statistik berbagi sisa lebar sama rata. */}
          <colgroup>
            <col style={{ width: 72 }} />
            <col style={{ width: 26 }} />
            <col style={{ width: 34 }} />
            {Array.from({ length: 10 }, (_, index) => (
              <col key={index} />
            ))}
          </colgroup>
          <thead style={{ backgroundColor: headerBg, color: headerText }}>
            {/* Team Title Row */}
            <tr style={{ backgroundColor: headerBg, color: headerText }}>
              <th
                colSpan={13}
                className="border border-black px-3 py-2 text-center font-poppins text-[15px] font-black tracking-wider whitespace-nowrap uppercase"
                style={{ color: headerText, backgroundColor: headerBg }}
              >
                {currentTeam}
              </th>
            </tr>

            {/* Header Row 1 */}
            <tr className="text-center text-[11px] font-bold" style={{ backgroundColor: headerBg, color: headerText }}>
              <th
                rowSpan={2}
                className="truncate border border-black px-1 py-1 text-center font-bold"
                style={{ color: headerText }}
              >
                Nama
              </th>
              <th
                rowSpan={2}
                className="border border-black px-0.5 py-1 text-center font-bold"
                style={{ color: headerText }}
              >
                NO
              </th>
              <th
                rowSpan={2}
                className="border border-black px-0.5 py-1 text-center font-bold"
                style={{ color: headerText }}
              >
                Total
              </th>
              <th
                colSpan={2}
                className="border border-black py-0.5 text-center font-bold"
                style={{ color: headerText }}
              >
                2 Point
              </th>
              <th
                colSpan={2}
                className="border border-black py-0.5 text-center font-bold"
                style={{ color: headerText }}
              >
                3 Point
              </th>
              <th
                rowSpan={2}
                className="border border-black px-0.5 py-1 text-center font-bold"
                style={{ color: headerText }}
              >
                Assist
              </th>
              <th
                colSpan={2}
                className="border border-black py-0.5 text-center font-bold"
                style={{ color: headerText }}
              >
                Freethrow
              </th>
              <th
                colSpan={2}
                className="border border-black py-0.5 text-center font-bold"
                style={{ color: headerText }}
              >
                Rebound
              </th>
              <th
                rowSpan={2}
                className="border border-black px-0.5 py-1 text-center font-bold"
                style={{ color: headerText }}
              >
                Foul
              </th>
            </tr>

            {/* Header Row 2 */}
            <tr
              className="text-center text-[10px] font-normal"
              style={{ backgroundColor: headerBg, color: headerText }}
            >
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Made
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Miss
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Made
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Miss
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Made
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Miss
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Off
              </th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>
                Def
              </th>
            </tr>
          </thead>

          <tbody>
            {playersList.map((p, idx) => {
              const pStats = s[p.id] || initialStats();
              const points = getPlayerPoints(pStats);
              const isEvenRow = idx % 2 === 1;

              return (
                <tr
                  key={p.id}
                  className={`h-[44px] transition-colors ${
                    isEvenRow ? "bg-[#e8ecef]" : "bg-white"
                  } hover:brightness-95`}
                >
                  {/* Nama (Static Text) */}
                  <td
                    className="truncate border border-black px-1.5 py-1 text-[11px] font-semibold text-gray-900"
                    title={p.name}
                  >
                    {p.name}
                  </td>

                  {/* NO */}
                  <td className="border border-black px-0.5 py-1 text-center text-[13px] font-black text-black">
                    {p.nopung || "-"}
                  </td>

                  {/* Total Points */}
                  <td className="border border-black px-0.5 py-1 text-center text-[12px] font-black text-black">
                    {points}
                  </td>

                  {/* 2 Point Made */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "twoPointMade", "green", currentTeam)}
                  </td>

                  {/* 2 Point Miss */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "twoPointMiss", "red", currentTeam)}
                  </td>

                  {/* 3 Point Made */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "threePointMade", "green", currentTeam)}
                  </td>

                  {/* 3 Point Miss */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "threePointMiss", "red", currentTeam)}
                  </td>

                  {/* Assist */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "assist", "green", currentTeam)}
                  </td>

                  {/* Freethrow Made */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "freethrowMade", "green", currentTeam)}
                  </td>

                  {/* Freethrow Miss */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "freethrowMiss", "red", currentTeam)}
                  </td>

                  {/* Rebound Off */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "reboundOff", "green", currentTeam)}
                  </td>

                  {/* Rebound Def */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "reboundDef", "green", currentTeam)}
                  </td>

                  {/* Foul */}
                  <td className="overflow-hidden border border-black px-0 py-0.5 text-center align-middle">
                    {statCell(teamIdx, p, "foul", "red", currentTeam)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Footer TOTALS */}
          <tfoot>
            <tr className="border-t-2 border-black text-[12px] font-extrabold">
              <td className="border border-black py-1.5 text-center font-extrabold tracking-wider uppercase">TOTALS</td>
              <td className="border border-black"></td>
              <td className="border border-black text-center font-extrabold">{totalPoints}</td>
              <td colSpan={4} className="border border-black"></td>
              <td className="border border-black text-center font-extrabold">{totalAssists}</td>
              <td colSpan={2} className="border border-black"></td>
              <td className="border border-black text-center font-extrabold">{totalOffReb}</td>
              <td className="border border-black text-center font-extrabold">{totalDefReb}</td>
              <td className="border border-black text-center font-extrabold">{totalFouls}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col">
      {/* Main Box Score Card */}
      <div className="relative flex w-full flex-col items-center rounded-[12px] bg-white px-2 py-6 shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] sm:px-4">
        {quarterTabs && <div className="mb-6 flex w-full justify-center">{quarterTabs}</div>}

        {/* Static Top Header (Teams & Score Banner with Color Pickers) */}
        <div className="mb-6 flex w-full max-w-full flex-row items-center justify-between gap-2 px-1 sm:gap-4 sm:px-2">
          {/* Team 1 Header with Custom Color Picker */}
          <div className="relative flex min-w-0 flex-1 items-center justify-start gap-2 sm:gap-4">
            <div className="relative flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowColorPicker1(!showColorPicker1)}
                disabled={readOnly}
                aria-label={`Warna jersey ${team1}`}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1.5 shadow-sm transition-colors hover:bg-gray-200 sm:gap-2 sm:px-3"
              >
                <div
                  className="h-4 w-4 shrink-0 rounded-full border border-black/20 shadow-inner"
                  style={{ backgroundColor: color1 }}
                ></div>
                <span className="font-poppins text-[12px] font-medium text-gray-800">Custom</span>
              </button>

              {/* Color Picker Dropdown 1 */}
              {showColorPicker1 && (
                <div className="absolute top-full left-0 z-50 mt-2 w-[220px] rounded-xl border border-gray-200 bg-white p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-poppins text-[11px] font-bold text-gray-700">Pilih Warna {team1}:</p>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker1(false)}
                      className="cursor-pointer p-0.5 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mb-3 grid grid-cols-5 gap-2">
                    {HMD_COLOR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleColor1Change(p.hex);
                          setShowColorPicker1(false);
                        }}
                        className="h-7 w-7 cursor-pointer rounded-full border-2 border-white shadow transition-transform hover:scale-110"
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                    <span className="font-poppins text-[10px] text-gray-500">Hex:</span>
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => handleColor1Change(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border-0 p-0"
                    />
                    <input
                      type="text"
                      value={color1}
                      onChange={(e) => handleColor1Change(e.target.value)}
                      className="w-20 rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            <h2
              className="min-w-0 truncate font-poppins text-base font-black tracking-tight uppercase sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              style={{ color: color1 === "#ffffff" ? "#1c1b1f" : color1 }}
              title={team1}
            >
              {team1}
            </h2>

            <div className="min-w-[65px] shrink-0 rounded-[10px] bg-[#aeb6b8] px-4 py-1.5 text-center text-xl leading-tight font-black text-[#1c1b1f] shadow-xs select-none sm:min-w-[80px] sm:px-6 sm:py-2 sm:text-2xl md:text-3xl">
              {view === "total" ? match1Score : team1Score}
            </div>
          </div>

          {/* Tengah: VS */}
          <div className="flex shrink-0 items-center justify-center px-2 font-poppins select-none sm:px-4">
            <span className="text-2xl leading-none font-black tracking-wider text-[#8b0000] sm:text-3xl md:text-4xl lg:text-5xl">
              VS
            </span>
          </div>

          {/* Team 2 Header with Custom Color Picker */}
          <div className="relative flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
            <div className="min-w-[65px] shrink-0 rounded-[10px] bg-[#aeb6b8] px-4 py-1.5 text-center text-xl leading-tight font-black text-[#1c1b1f] shadow-xs select-none sm:min-w-[80px] sm:px-6 sm:py-2 sm:text-2xl md:text-3xl">
              {view === "total" ? match2Score : team2Score}
            </div>

            <h2
              className="min-w-0 truncate text-right font-poppins text-base font-black tracking-tight uppercase sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              style={{ color: color2 === "#ffffff" ? "#1c1b1f" : color2 }}
              title={team2}
            >
              {team2}
            </h2>

            <div className="relative flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowColorPicker2(!showColorPicker2)}
                disabled={readOnly}
                aria-label={`Warna jersey ${team2}`}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1.5 shadow-sm transition-colors hover:bg-gray-200 sm:gap-2 sm:px-3"
              >
                <div
                  className="h-4 w-4 rounded-full border border-black/20 shadow-inner"
                  style={{ backgroundColor: color2 }}
                ></div>
                <span className="font-poppins text-[12px] font-medium text-gray-800">Custom</span>
              </button>

              {/* Color Picker Dropdown 2 */}
              {showColorPicker2 && (
                <div className="absolute top-full right-0 z-50 mt-2 w-[220px] rounded-xl border border-gray-200 bg-white p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-poppins text-[11px] font-bold text-gray-700">Pilih Warna {team2}:</p>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker2(false)}
                      className="cursor-pointer p-0.5 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mb-3 grid grid-cols-5 gap-2">
                    {HMD_COLOR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleColor2Change(p.hex);
                          setShowColorPicker2(false);
                        }}
                        className="h-7 w-7 cursor-pointer rounded-full border-2 border-white shadow transition-transform hover:scale-110"
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
                    <span className="font-poppins text-[10px] text-gray-500">Hex:</span>
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => handleColor2Change(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border-0 p-0"
                    />
                    <input
                      type="text"
                      value={color2}
                      onChange={(e) => handleColor2Change(e.target.value)}
                      className="w-20 rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[11px] uppercase"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Container on Screen */}
        <div className="w-full overflow-x-auto pb-4">
          {/* min-w: kolom statistik tetap ≥ 49 px supaya tombol ◀ ▶ ≥ 24 px; di bawah 1366 px tabel digeser. */}
          <div className="flex w-full min-w-[1280px] flex-col gap-3 rounded-xl bg-white p-1">
            {/* Side-by-Side Dual Tables */}
            <div className="flex flex-row items-start gap-2">
              {/* Table Team 1 */}
              <div className="min-w-0 flex-1">{renderScoringTable(1, team1, players1List, color1)}</div>

              {/* Table Team 2 */}
              <div className="min-w-0 flex-1">{renderScoringTable(2, team2, players2List, color2)}</div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row: 1 Baris Memanjang (Horizontal) */}
        <div className="mt-8 flex w-full flex-col-reverse items-stretch justify-between gap-4 border-t pt-6 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">{footer}</div>
          <div className="flex flex-row flex-nowrap items-center justify-end gap-3 overflow-x-auto pb-2">
            {/* Export CSV / Excel */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="group relative inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full border border-gray-200 bg-white px-6 py-2.5 font-poppins text-xs font-semibold whitespace-nowrap text-gray-800 shadow-xs transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              title="Satu file CSV berisi Quarter 1 sampai Total (bisa dibuka di Excel)"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-700">
                {exportFormat === "csv" ? (
                  <svg className="h-3.5 w-3.5 animate-spin text-emerald-700" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 fill-emerald-600" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] leading-tight font-bold">Export CSV</span>
                <span className="mt-0.5 text-[10px] leading-none font-normal text-gray-400 group-hover:text-emerald-700">
                  .csv / Excel
                </span>
              </div>
            </button>

            {/* Export PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="group relative inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full bg-[#d92d20] px-6 py-2.5 font-poppins text-xs font-semibold whitespace-nowrap text-white shadow-xs transition-all duration-200 hover:bg-[#b42318] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              title="Satu file PDF A4 landscape: satu halaman per quarter, lalu Total"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                {exportFormat === "pdf" ? (
                  <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] leading-tight font-bold">
                  {exportFormat === "pdf" ? "Exporting..." : "Export PDF"}
                </span>
                <span className="mt-0.5 text-[10px] leading-none font-normal text-white/80">.pdf / Print A4</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Lembar export PDF: dirender di luar layar hanya selama export berjalan. */}
      {exportFormat === "pdf" && (
        <div aria-hidden="true" className="pointer-events-none fixed top-0 left-[-20000px]">
          <div ref={sheetsRef} className="flex w-[1280px] flex-col gap-6 bg-white">
            {sections.map((section) => (
              <ScoringExportSheet
                key={String(section)}
                snapshot={snapshot}
                section={section}
                color1={color1}
                color2={color2}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

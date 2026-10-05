"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

import { type MatchSnapshot, type PlayerLine, type StatKey, getQuarterStats } from "@/lib/matchesApi";

interface ScoringBoxScoreSectionProps {
  /** Data match dari server (nama pemain selalu mengikuti halaman Teams). */
  snapshot: MatchSnapshot;
  /** true saat match dikunci atau akun ini bukan pemegang sesi. */
  readOnly: boolean;
  onStep: (side: 1 | 2, player: PlayerLine, stat: StatKey, delta: 1 | -1, quarter?: number) => void;
  onColorsChange: (colors: { team1Color?: string; team2Color?: string }) => void;
  /** Tombol sesi (Save and Lock / Unlock / Keluar) + status simpan, di kiri bawah. */
  footer?: React.ReactNode;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

const STAT_LABEL: Record<StatKey, string> = {
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
 * Capsule Counter Component with Red Left Arrow (decrement) and Green Right Arrow (increment)
 */
const CounterPill = ({
  value,
  variant = "green",
  label,
  disabled = false,
  onIncrement,
  onDecrement,
}: {
  value: number;
  variant?: "green" | "red";
  /** Mis. "2 Point Made Budi Santoso", untuk pembaca layar. */
  label: string;
  disabled?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  return (
    <div
      className={`h-[24px] w-full max-w-[48px] min-w-0 mx-auto px-0.5 rounded-[4px] flex items-center justify-between select-none box-border border ${variant === "green"
        ? "bg-[#c8e6c9] border-[#a5d6a7]"
        : "bg-[#ffcdd2] border-[#ef9a9a]"
        }`}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        aria-label={`Kurangi ${label}`}
        className="w-3 h-3 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer shrink-0 disabled:cursor-default disabled:opacity-30 disabled:hover:scale-100"
        title="Kurang"
      >
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#b71c1c]">
          <path d="M18 4L6 12l12 8z" />
        </svg>
      </button>

      <span className="text-[11px] font-black text-black font-mono leading-none tracking-tight">
        {String(value).padStart(2, "0")}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label={`Tambah ${label}`}
        className="w-3 h-3 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer shrink-0 disabled:cursor-default disabled:opacity-30 disabled:hover:scale-100"
        title="Tambah"
      >
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#1b5e20]">
          <path d="M6 4l12 8-12 8z" />
        </svg>
      </button>
    </div>
  );
};

/** Nomor punggung angka diurutkan naik; yang bukan angka di belakang. */
const sortByNopung = (list: PlayerLine[]) =>
  [...list].sort((a, b) => {
    const numA = parseInt(a.nopung, 10);
    const numB = parseInt(b.nopung, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return a.nopung.localeCompare(b.nopung, undefined, { numeric: true });
  });

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
  snapshot,
  readOnly,
  onStep,
  onColorsChange,
  footer,
}: ScoringBoxScoreSectionProps) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "png" | null>(null);

  const team1 = snapshot.team1.name ?? "Team 1";
  const team2 = snapshot.team2.name ?? "Team 2";
  // Nama & nomor punggung dari server: nama mengikuti Teams, nomor mengikuti susunan pemain match ini.
  // Diurutkan dari nomor punggung terkecil.
  const players1List = useMemo(() => sortByNopung(snapshot.team1.players), [snapshot.team1.players]);
  const players2List = useMemo(() => sortByNopung(snapshot.team2.players), [snapshot.team2.players]);

  // Warna jersey: tampil langsung, disimpan ke server setelah berhenti mengetik/memilih.
  const [color1, setColor1] = useState(snapshot.team1.color);
  const [color2, setColor2] = useState(snapshot.team2.color);
  const [activeQuarter, setActiveQuarter] = useState<number>(snapshot.currentQuarter || 1);
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
    if (readOnly) return;
    const player = (teamIdx === 1 ? players1List : players2List).find((p) => p.id === playerId);
    if (player) onStep(teamIdx, player, statKey, delta, activeQuarter);
  };

  // Calculate player total points
  const getPlayerPoints = (pStats: PlayerStats) => {
    return (
      (pStats.twoPointMade || 0) * 2 +
      (pStats.threePointMade || 0) * 3 +
      (pStats.freethrowMade || 0) * 1
    );
  };

  // Calculate team total points
  const getTeamTotalPoints = (teamIdx: 1 | 2, playersList: PlayerLine[]) => {
    const s = teamIdx === 1 ? stats1 : stats2;
    return playersList.reduce((acc, p) => {
      const pStats = s[p.id] || initialStats();
      return acc + getPlayerPoints(pStats);
    }, 0);
  };

  const team1Score = getTeamTotalPoints(1, players1List);
  const team2Score = getTeamTotalPoints(2, players2List);

  // Handle Export to Image (PNG)
  const handleExportPNG = async () => {
    if (!exportRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setExportFormat("png");
      const el = exportRef.current;

      // Temporarily enforce full unconstrained width during export so nothing wraps or shrinks
      const originalWidth = el.style.width;
      const originalMinWidth = el.style.minWidth;
      // Use a definite width: max-content makes the percentage-column tables expand to ~1,000,000px
      el.style.width = "1280px";
      el.style.minWidth = "1280px";

      // Force layout recalculation
      void el.offsetHeight;

      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        width: el.scrollWidth,
        height: el.scrollHeight,
      });

      // Restore original inline styles
      el.style.width = originalWidth;
      el.style.minWidth = originalMinWidth;

      const link = document.createElement("a");
      link.download = `IBL_2K26_Table_${team1}_vs_${team2}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
      alert("Gagal melakukan export gambar PNG. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // Handle Export to PDF
  const handleExportPDF = async () => {
    if (!exportRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setExportFormat("pdf");
      const el = exportRef.current;

      // Temporarily enforce full unconstrained width during export so nothing wraps or shrinks
      const originalWidth = el.style.width;
      const originalMinWidth = el.style.minWidth;
      // Use a definite width: max-content makes the percentage-column tables expand to ~1,000,000px
      el.style.width = "1280px";
      el.style.minWidth = "1280px";

      // Force layout recalculation
      void el.offsetHeight;

      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        width: el.scrollWidth,
        height: el.scrollHeight,
      });

      // Restore original inline styles
      el.style.width = originalWidth;
      el.style.minWidth = originalMinWidth;

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 297 mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210 mm

      const margin = 8;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Fit proportionately within available page dimensions
      const widthRatio = availableWidth / img.naturalWidth;
      const heightRatio = availableHeight / img.naturalHeight;
      const scale = Math.min(widthRatio, heightRatio);

      const renderWidth = img.naturalWidth * scale;
      const renderHeight = img.naturalHeight * scale;

      const xPos = (pageWidth - renderWidth) / 2;
      const yPos = (pageHeight - renderHeight) / 2;

      pdf.addImage(dataUrl, "PNG", xPos, yPos, renderWidth, renderHeight, undefined, "FAST");
      pdf.save(`IBL_2K26_Table_${team1}_vs_${team2}.pdf`);
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("Gagal melakukan export PDF. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // Handle Export to CSV & Excel (.xlsx) with clean columns and formatting
  const handleExportCSV = async () => {
    if (isExporting) return;
    setExportFormat("csv");

    const formatPercent = (made: number, att: number) => {
      if (!att || att <= 0) return "0.0%";
      return `${((made / att) * 100).toFixed(1)}%`;
    };

    const buildTeamData = (
      teamName: string,
      teamTotalScore: number,
      playersList: PlayerLine[],
      s: { [id: string]: PlayerStats }
    ) => {
      let totPts = 0;
      let tot2PM = 0;
      let tot2PMiss = 0;
      let tot3PM = 0;
      let tot3PMiss = 0;
      let totFTM = 0;
      let totFTMiss = 0;
      let totAst = 0;
      let totOreb = 0;
      let totDreb = 0;
      let totFoul = 0;

      const playerRows = playersList.map((p) => {
        const ps = s[p.id] || initialStats();
        const pts = getPlayerPoints(ps);
        const twoPM = ps.twoPointMade || 0;
        const twoPMiss = ps.twoPointMiss || 0;
        const twoPA = twoPM + twoPMiss;
        const threePM = ps.threePointMade || 0;
        const threePMiss = ps.threePointMiss || 0;
        const threePA = threePM + threePMiss;
        const ftM = ps.freethrowMade || 0;
        const ftMiss = ps.freethrowMiss || 0;
        const ftA = ftM + ftMiss;
        const ast = ps.assist || 0;
        const oreb = ps.reboundOff || 0;
        const dreb = ps.reboundDef || 0;
        const reb = oreb + dreb;
        const foul = ps.foul || 0;

        totPts += pts;
        tot2PM += twoPM;
        tot2PMiss += twoPMiss;
        tot3PM += threePM;
        tot3PMiss += threePMiss;
        totFTM += ftM;
        totFTMiss += ftMiss;
        totAst += ast;
        totOreb += oreb;
        totDreb += dreb;
        totFoul += foul;

        return [
          p.nopung || "-",
          p.name || "-",
          pts,
          twoPM,
          twoPMiss,
          twoPA,
          formatPercent(twoPM, twoPA),
          threePM,
          threePMiss,
          threePA,
          formatPercent(threePM, threePA),
          ftM,
          ftMiss,
          ftA,
          formatPercent(ftM, ftA),
          ast,
          oreb,
          dreb,
          reb,
          foul,
        ];
      });

      const tot2PA = tot2PM + tot2PMiss;
      const tot3PA = tot3PM + tot3PMiss;
      const totFTA = totFTM + totFTMiss;
      const totReb = totOreb + totDreb;

      const totalRow = [
        "TOTAL",
        `${teamName} TOTAL`,
        totPts,
        tot2PM,
        tot2PMiss,
        tot2PA,
        formatPercent(tot2PM, tot2PA),
        tot3PM,
        tot3PMiss,
        tot3PA,
        formatPercent(tot3PM, tot3PA),
        totFTM,
        totFTMiss,
        totFTA,
        formatPercent(totFTM, totFTA),
        totAst,
        totOreb,
        totDreb,
        totReb,
        totFoul,
      ];

      return {
        playerRows,
        totalRow,
      };
    };

    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const headers = [
      "NO",
      "NAMA PEMAIN",
      "PTS",
      "2PM",
      "2PMISS",
      "2PA",
      "2P%",
      "3PM",
      "3PMISS",
      "3PA",
      "3P%",
      "FTM",
      "FTMISS",
      "FTA",
      "FT%",
      "AST",
      "OREB",
      "DREB",
      "REB",
      "FOUL",
    ];

    // Satu lembar box score; dipakai untuk total match dan tiap quarter.
    const buildSheetData = (
      scoreLabel: string,
      score1: number,
      score2: number,
      lines1: PlayerLine[],
      lines2: PlayerLine[],
    ): Array<Array<string | number>> => {
      const team1Data = buildTeamData(team1, score1, lines1, toStats(lines1));
      const team2Data = buildTeamData(team2, score2, lines2, toStats(lines2));
      return [
        ["IBL 2K26 - OFFICIAL BASKETBALL BOX SCORE REPORT"],
        ["Match", `${team1} vs ${team2}`],
        [scoreLabel, `${team1} (${score1}) - (${score2}) ${team2}`],
        ["Tanggal & Waktu", formattedDate],
        [],
        [`--- TEAM: ${team1} (Total Points: ${score1}) ---`],
        headers,
        ...team1Data.playerRows,
        team1Data.totalRow,
        [],
        [`--- TEAM: ${team2} (Total Points: ${score2}) ---`],
        headers,
        ...team2Data.playerRows,
        team2Data.totalRow,
      ];
    };

    // 1. Generate real Excel (.xlsx) file with separate columns and custom column widths
    const aoaData = buildSheetData("Final Score", team1Score, team2Score, players1List, players2List);
    const sheets: Array<[string, Array<Array<string | number>>]> = [["Box Score", aoaData]];

    // Sheet Q1–Q4 dalam file yang sama. Kalau backend belum punya quarter-stats, cukup sheet total.
    try {
      const { quarters } = await getQuarterStats(snapshot.id);
      for (const q of quarters) {
        sheets.push([
          `Q${q.quarter}`,
          buildSheetData(
            `Score Q${q.quarter}`,
            q.team1.score,
            q.team2.score,
            sortByNopung(q.team1.players),
            sortByNopung(q.team2.players),
          ),
        ]);
      }
    } catch {
      // Export total tetap jalan.
    }

    const wb = XLSX.utils.book_new();

    // Auto-fit column widths so text is never truncated in Excel
    const cols = [
      { wch: 8 },  // NO
      { wch: 28 }, // NAMA PEMAIN
      { wch: 8 },  // PTS
      { wch: 8 },  // 2PM
      { wch: 9 },  // 2PMISS
      { wch: 8 },  // 2PA
      { wch: 8 },  // 2P%
      { wch: 8 },  // 3PM
      { wch: 9 },  // 3PMISS
      { wch: 8 },  // 3PA
      { wch: 8 },  // 3P%
      { wch: 8 },  // FTM
      { wch: 9 },  // FTMISS
      { wch: 8 },  // FTA
      { wch: 8 },  // FT%
      { wch: 8 },  // AST
      { wch: 8 },  // OREB
      { wch: 8 },  // DREB
      { wch: 8 },  // REB
      { wch: 8 },  // FOUL
    ];

    for (const [name, data] of sheets) {
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = cols;
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
    XLSX.writeFile(wb, `BoxScore_${team1}_vs_${team2}.xlsx`);

    // 2. Also export CSV with sep=, directive so Indonesian Windows Excel splits columns perfectly!
    const csvRows = aoaData.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    );

    const csvContent = "\uFEFFsep=,\r\n" + csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BoxScore_${team1}_vs_${team2}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setExportFormat(null), 800);
  };

  const renderScoringTable = (
    teamIdx: 1 | 2,
    currentTeam: string,
    playersList: PlayerLine[],
    themeColor: string
  ) => {
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
      <div className="w-full flex flex-col">
        <table className="w-full border-collapse border border-black bg-white text-black font-poppins text-[11px] table-fixed">
          <colgroup>
            <col className="w-[13%]" />
            <col className="w-[5%]" />
            <col className="w-[6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
            <col className="w-[7.6%]" />
          </colgroup>
          <thead style={{ backgroundColor: headerBg, color: headerText }}>
            {/* Team Title Row */}
            <tr style={{ backgroundColor: headerBg, color: headerText }}>
              <th
                colSpan={13}
                className="border border-black py-2 px-3 text-center font-black text-[15px] uppercase tracking-wider font-poppins whitespace-nowrap"
                style={{ color: headerText, backgroundColor: headerBg }}
              >
                {currentTeam}
              </th>
            </tr>

            {/* Header Row 1 */}
            <tr className="text-center font-bold text-[11px]" style={{ backgroundColor: headerBg, color: headerText }}>
              <th rowSpan={2} className="border border-black px-1 py-1 text-center font-bold truncate" style={{ color: headerText }}>
                Nama
              </th>
              <th rowSpan={2} className="border border-black px-0.5 py-1 text-center font-bold" style={{ color: headerText }}>
                NO
              </th>
              <th rowSpan={2} className="border border-black px-0.5 py-1 text-center font-bold" style={{ color: headerText }}>
                Total
              </th>
              <th colSpan={2} className="border border-black py-0.5 text-center font-bold" style={{ color: headerText }}>
                2 Point
              </th>
              <th colSpan={2} className="border border-black py-0.5 text-center font-bold" style={{ color: headerText }}>
                3 Point
              </th>
              <th rowSpan={2} className="border border-black px-0.5 py-1 text-center font-bold" style={{ color: headerText }}>
                Assist
              </th>
              <th colSpan={2} className="border border-black py-0.5 text-center font-bold" style={{ color: headerText }}>
                Freethrow
              </th>
              <th colSpan={2} className="border border-black py-0.5 text-center font-bold" style={{ color: headerText }}>
                Rebound
              </th>
              <th rowSpan={2} className="border border-black px-0.5 py-1 text-center font-bold" style={{ color: headerText }}>
                Foul
              </th>
            </tr>

            {/* Header Row 2 */}
            <tr className="text-center text-[10px] font-normal" style={{ backgroundColor: headerBg, color: headerText }}>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Made</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Miss</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Made</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Miss</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Made</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Miss</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Off</th>
              <th className="border border-black py-0.5 text-center font-normal" style={{ color: headerText }}>Def</th>
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
                  className={`transition-colors ${isEvenRow ? "bg-[#e8ecef]" : "bg-white"
                    } hover:brightness-95`}
                >
                  {/* Nama (Static Text) */}
                  <td className="border border-black px-2 py-1 text-[11px] font-semibold text-gray-900 truncate" title={p.name}>
                    {p.name}
                  </td>

                  {/* NO */}
                  <td className="border border-black px-0.5 py-1 text-center font-black text-[13px] text-black">
                    {p.nopung || "-"}
                  </td>

                  {/* Total Points */}
                  <td className="border border-black px-0.5 py-1 text-center font-black text-[12px] text-black">
                    {points}
                  </td>

                  {/* 2 Point Made */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.twoPointMade}
                      variant="green"
                      label={`${STAT_LABEL.twoPointMade} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "twoPointMade", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "twoPointMade", -1)}
                    />
                  </td>

                  {/* 2 Point Miss */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.twoPointMiss}
                      variant="red"
                      label={`${STAT_LABEL.twoPointMiss} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "twoPointMiss", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "twoPointMiss", -1)}
                    />
                  </td>

                  {/* 3 Point Made */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.threePointMade}
                      variant="green"
                      label={`${STAT_LABEL.threePointMade} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "threePointMade", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "threePointMade", -1)}
                    />
                  </td>

                  {/* 3 Point Miss */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.threePointMiss}
                      variant="red"
                      label={`${STAT_LABEL.threePointMiss} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "threePointMiss", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "threePointMiss", -1)}
                    />
                  </td>

                  {/* Assist */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.assist}
                      variant="green"
                      label={`${STAT_LABEL.assist} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "assist", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "assist", -1)}
                    />
                  </td>

                  {/* Freethrow Made */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.freethrowMade}
                      variant="green"
                      label={`${STAT_LABEL.freethrowMade} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "freethrowMade", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "freethrowMade", -1)}
                    />
                  </td>

                  {/* Freethrow Miss */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.freethrowMiss}
                      variant="red"
                      label={`${STAT_LABEL.freethrowMiss} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "freethrowMiss", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "freethrowMiss", -1)}
                    />
                  </td>

                  {/* Rebound Off */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.reboundOff}
                      variant="green"
                      label={`${STAT_LABEL.reboundOff} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "reboundOff", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "reboundOff", -1)}
                    />
                  </td>

                  {/* Rebound Def */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.reboundDef}
                      variant="green"
                      label={`${STAT_LABEL.reboundDef} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "reboundDef", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "reboundDef", -1)}
                    />
                  </td>

                  {/* Foul */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.foul}
                      variant="red"
                      label={`${STAT_LABEL.foul} ${p.name}, ${currentTeam}`}
                      disabled={readOnly}
                      onIncrement={() => updateStat(teamIdx, p.id, "foul", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "foul", -1)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Footer TOTALS */}
          <tfoot>
            <tr className="border-t-2 border-black font-extrabold text-[12px]">
              <td className="border border-black py-1.5 text-center uppercase tracking-wider font-extrabold">
                TOTALS
              </td>
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
    <div className="flex flex-col w-full">
      {/* Main Box Score Card */}
      <div className="relative bg-white rounded-[12px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] w-full py-8 px-4 lg:px-8 flex flex-col items-center">

        {/* Static Top Header (Teams & Score Banner with Color Pickers) */}
        <div className="w-full max-w-full flex flex-row items-center justify-between gap-2 sm:gap-4 mb-8 px-1 sm:px-2">

          {/* Team 1 Header with Custom Color Picker */}
          <div className="flex items-center gap-2 sm:gap-3 relative flex-1 min-w-0 justify-start">
            <div className="relative flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowColorPicker1(!showColorPicker1)}
                disabled={readOnly}
                aria-label={`Warna jersey ${team1}`}
                className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 hover:bg-gray-200 px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-300 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <div
                  className="w-4 h-4 rounded-full border border-black/20 shadow-inner shrink-0"
                  style={{ backgroundColor: color1 }}
                ></div>
                <span className="text-[12px] font-medium text-gray-800 font-poppins">Custom</span>
              </button>

              {/* Color Picker Dropdown 1 */}
              {showColorPicker1 && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-gray-700 font-poppins">Pilih Warna {team1}:</p>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker1(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {HMD_COLOR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleColor1Change(p.hex);
                          setShowColorPicker1(false);
                        }}
                        className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-500 font-poppins">Hex:</span>
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => handleColor1Change(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={color1}
                      onChange={(e) => handleColor1Change(e.target.value)}
                      className="w-20 text-[11px] font-mono border border-gray-200 rounded px-1.5 py-0.5 uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            <h2
              className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black font-poppins uppercase tracking-tight truncate min-w-0"
              style={{ color: color1 === "#ffffff" ? "#1c1b1f" : color1 }}
              title={team1}
            >
              {team1}
            </h2>

            <div
              className="font-extrabold text-lg sm:text-xl md:text-2xl px-3 sm:px-4 lg:px-5 py-1 rounded-[10px] min-w-[45px] sm:min-w-[55px] text-center leading-tight shadow-md shrink-0"
              style={{
                backgroundColor: color1 === "#ffffff" ? "#afb3b6" : color1,
                color: color1 === "#ffffff" ? "#1c1b1f" : "#ffffff",
              }}
            >
              {team1Score}
            </div>
          </div>

          {/* Central VS with Quarter Selector Button */}
          <div className="flex flex-col items-center gap-1.5 px-2 shrink-0">
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#8b0000] font-poppins leading-none select-none">
              VS
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setActiveQuarter(q)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                    activeQuarter === q
                      ? "bg-[#f99f1b] text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>

          {/* Team 2 Header with Custom Color Picker */}
          <div className="flex items-center gap-2 sm:gap-3 relative flex-1 min-w-0 justify-end">
            <div
              className="font-extrabold text-lg sm:text-xl md:text-2xl px-3 sm:px-4 lg:px-5 py-1 rounded-[10px] min-w-[45px] sm:min-w-[55px] text-center leading-tight shadow-md shrink-0"
              style={{
                backgroundColor: color2 === "#ffffff" ? "#afb3b6" : color2,
                color: color2 === "#ffffff" ? "#1c1b1f" : "#ffffff",
              }}
            >
              {team2Score}
            </div>

            <h2
              className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black font-poppins uppercase tracking-tight text-right truncate min-w-0"
              style={{ color: color2 === "#ffffff" ? "#1c1b1f" : color2 }}
              title={team2}
            >
              {team2}
            </h2>

            <div className="relative flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowColorPicker2(!showColorPicker2)}
                disabled={readOnly}
                aria-label={`Warna jersey ${team2}`}
                className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 hover:bg-gray-200 px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-300 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <div
                  className="w-4 h-4 rounded-full border border-black/20 shadow-inner"
                  style={{ backgroundColor: color2 }}
                ></div>
                <span className="text-[12px] font-medium text-gray-800 font-poppins">Custom</span>
              </button>

              {/* Color Picker Dropdown 2 */}
              {showColorPicker2 && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-gray-700 font-poppins">Pilih Warna {team2}:</p>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker2(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {HMD_COLOR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleColor2Change(p.hex);
                          setShowColorPicker2(false);
                        }}
                        className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-500 font-poppins">Hex:</span>
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => handleColor2Change(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={color2}
                      onChange={(e) => handleColor2Change(e.target.value)}
                      className="w-20 text-[11px] font-mono border border-gray-200 rounded px-1.5 py-0.5 uppercase"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Scrollable Container on Screen */}
        <div className="w-full overflow-x-auto pb-4">
          {/* Target for PDF & PNG Export (Full Unclipped Width) */}
          <div ref={exportRef} className="w-full min-w-[1280px] flex flex-col gap-4 bg-white p-5 rounded-xl">
            {/* Match Header with Playing HMD Teams */}
            <div className="w-full flex flex-row items-center justify-between px-3 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <h3
                  className="font-black text-[22px] font-poppins uppercase tracking-wide whitespace-nowrap"
                  style={{ color: color1 === "#ffffff" ? "#1c1b1f" : color1 }}
                >
                  {team1}
                </h3>
                <span
                  className="font-extrabold text-[13px] font-poppins px-3 py-0.5 rounded text-white whitespace-nowrap shrink-0"
                  style={{ backgroundColor: color1 === "#ffffff" ? "#202224" : color1 }}
                >
                  {team1Score} PTS
                </span>
              </div>

              <span className="font-black text-[18px] text-[#8b0000] font-poppins whitespace-nowrap shrink-0 mx-4">
                VS
              </span>

              <div className="flex items-center gap-3">
                <span
                  className="font-extrabold text-[13px] font-poppins px-3 py-0.5 rounded text-white whitespace-nowrap shrink-0"
                  style={{ backgroundColor: color2 === "#ffffff" ? "#202224" : color2 }}
                >
                  {team2Score} PTS
                </span>
                <h3
                  className="font-black text-[22px] font-poppins uppercase tracking-wide whitespace-nowrap"
                  style={{ color: color2 === "#ffffff" ? "#1c1b1f" : color2 }}
                >
                  {team2}
                </h3>
              </div>
            </div>

            {/* Side-by-Side Dual Tables */}
            <div className="flex flex-row items-start gap-4">
              {/* Table Team 1 */}
              <div className="flex-1 min-w-[600px]">
                {renderScoringTable(1, team1, players1List, color1)}
              </div>

              {/* Table Team 2 */}
              <div className="flex-1 min-w-[600px]">
                {renderScoringTable(2, team2, players2List, color2)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row: 1 Baris Memanjang (Horizontal) */}
        <div className="w-full mt-8 border-t pt-6 flex flex-col-reverse items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">{footer}</div>
          <div className="flex flex-row items-center justify-end gap-3 flex-nowrap overflow-x-auto pb-2">
          {/* Export CSV / Excel */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="shrink-0 group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 font-poppins text-xs font-semibold shadow-xs hover:shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Unduh data dalam format CSV & Excel"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0">
              {exportFormat === "csv" ? (
                <svg className="w-3.5 h-3.5 animate-spin text-emerald-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[13px] leading-tight">Export CSV</span>
              <span className="text-[10px] text-gray-400 group-hover:text-emerald-700 font-normal leading-none mt-0.5">.csv / Excel</span>
            </div>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="shrink-0 group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#d92d20] hover:bg-[#b42318] text-white font-poppins text-xs font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Unduh dokumen box score resmi ukuran A4 Landscape siap cetak"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
              {exportFormat === "pdf" ? (
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[13px] leading-tight">
                {exportFormat === "pdf" ? "Exporting..." : "Export PDF"}
              </span>
              <span className="text-[10px] text-white/80 font-normal leading-none mt-0.5">.pdf / Print A4</span>
            </div>
          </button>

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPNG}
            disabled={isExporting}
            className="shrink-0 group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#202224] hover:bg-black text-white font-poppins text-xs font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Unduh box score resolusi tinggi format gambar PNG"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
              {exportFormat === "png" ? (
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[13px] leading-tight">
                {exportFormat === "png" ? "Exporting..." : "Export PNG"}
              </span>
              <span className="text-[10px] text-white/80 font-normal leading-none mt-0.5">.png / HD Image</span>
            </div>
          </button>
          </div>
        </div>

      </div>
    </div>
  );
};
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MatchInfo } from "./ScoringSearchTeamSection";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface ScoringBoxScoreSectionProps {
  matches: MatchInfo[];
  activeMatchId: number | null;
  onAddScoring: () => void;
  onRemoveMatch: (id: number) => void;
  onSelectMatch: (id: number) => void;
  team1: string;
  team2: string;
  players1: any[];
  players2: any[];
}

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
  onIncrement,
  onDecrement,
}: {
  value: number;
  variant?: "green" | "red";
  onIncrement: () => void;
  onDecrement: () => void;
}) => {
  return (
    <div
      className={`h-[24px] w-full max-w-[48px] min-w-0 mx-auto px-0.5 rounded-[4px] flex items-center justify-between select-none box-border border ${
        variant === "green"
          ? "bg-[#c8e6c9] border-[#a5d6a7]"
          : "bg-[#ffcdd2] border-[#ef9a9a]"
      }`}
    >
      <button
        type="button"
        onClick={onDecrement}
        className="w-3 h-3 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer shrink-0"
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
        className="w-3 h-3 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer shrink-0"
        title="Tambah"
      >
        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#1b5e20]">
          <path d="M6 4l12 8-12 8z" />
        </svg>
      </button>
    </div>
  );
};

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
  matches,
  activeMatchId,
  onAddScoring,
  onRemoveMatch,
  onSelectMatch,
  team1,
  team2,
  players1,
  players2,
}: ScoringBoxScoreSectionProps) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Player lists in state so names are editable
  const [players1List, setPlayers1List] = useState(players1);
  const [players2List, setPlayers2List] = useState(players2);

  useEffect(() => {
    setPlayers1List(players1);
  }, [players1]);

  useEffect(() => {
    setPlayers2List(players2);
  }, [players2]);

  // Custom colors for Team 1 and Team 2 (default pure white)
  const [color1, setColor1] = useState("#ffffff");
  const [color2, setColor2] = useState("#ffffff");
  const [showColorPicker1, setShowColorPicker1] = useState(false);
  const [showColorPicker2, setShowColorPicker2] = useState(false);

  // Initialize stats state for team 1 and team 2
  const [stats1, setStats1] = useState<{ [playerId: number]: PlayerStats }>(() => {
    const initial: { [playerId: number]: PlayerStats } = {};
    players1.forEach((p) => {
      initial[p.id] = initialStats();
    });
    return initial;
  });

  const [stats2, setStats2] = useState<{ [playerId: number]: PlayerStats }>(() => {
    const initial: { [playerId: number]: PlayerStats } = {};
    players2.forEach((p) => {
      initial[p.id] = initialStats();
    });
    return initial;
  });

  const updateStat = (
    teamIdx: 1 | 2,
    playerId: number,
    statKey: keyof PlayerStats,
    delta: number
  ) => {
    if (teamIdx === 1) {
      setStats1((prev) => {
        const current = prev[playerId] || initialStats();
        const nextVal = Math.max(0, (current[statKey] || 0) + delta);
        return {
          ...prev,
          [playerId]: {
            ...current,
            [statKey]: nextVal,
          },
        };
      });
    } else {
      setStats2((prev) => {
        const current = prev[playerId] || initialStats();
        const nextVal = Math.max(0, (current[statKey] || 0) + delta);
        return {
          ...prev,
          [playerId]: {
            ...current,
            [statKey]: nextVal,
          },
        };
      });
    }
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
  const getTeamTotalPoints = (teamIdx: 1 | 2, playersList: any[]) => {
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
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const el = exportRef.current;

      // Temporarily enforce full unconstrained width during export so nothing wraps or shrinks
      const originalWidth = el.style.width;
      const originalMinWidth = el.style.minWidth;
      el.style.width = "max-content";
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
    }
  };

  // Handle Export to PDF
  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const el = exportRef.current;

      // Temporarily enforce full unconstrained width during export so nothing wraps or shrinks
      const originalWidth = el.style.width;
      const originalMinWidth = el.style.minWidth;
      el.style.width = "max-content";
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
    }
  };

  // Handle Export to CSV
  const handleExportCSV = () => {
    try {
      const buildTeamCSV = (teamName: string, playersList: any[], s: { [id: number]: PlayerStats }) => {
        const rows = [
          `TEAM: ${teamName}`,
          "Nama,NO,Total,2PT Made,2PT Miss,3PT Made,3PT Miss,Assist,FT Made,FT Miss,Rebound Off,Rebound Def,Foul",
        ];
        playersList.forEach((p) => {
          const ps = s[p.id] || initialStats();
          const total = getPlayerPoints(ps);
          const no = p.nopung || p.jerseyNumber || "-";
          const safeName = String(p.name || "").replace(/"/g, '""');
          rows.push(
            `"${safeName}",${no},${total},${ps.twoPointMade},${ps.twoPointMiss},${ps.threePointMade},${ps.threePointMiss},${ps.assist},${ps.freethrowMade},${ps.freethrowMiss},${ps.reboundOff},${ps.reboundDef},${ps.foul}`
          );
        });
        return rows.join("\n");
      };

      const csvContent =
        `MATCH: ${team1} vs ${team2}\nSCORE: ${team1Score} - ${team2Score}\n\n` +
        buildTeamCSV(team1, players1List, stats1) +
        "\n\n" +
        buildTeamCSV(team2, players2List, stats2);

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `BoxScore_${team1}_vs_${team2}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV failed:", err);
      alert("Gagal melakukan export CSV. Silakan coba lagi.");
    }
  };

  const renderScoringTable = (
    teamIdx: 1 | 2,
    currentTeam: string,
    playersList: any[],
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
                  className={`transition-colors ${
                    isEvenRow ? "bg-[#e8ecef]" : "bg-white"
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
                      onIncrement={() => updateStat(teamIdx, p.id, "twoPointMade", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "twoPointMade", -1)}
                    />
                  </td>

                  {/* 2 Point Miss */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.twoPointMiss}
                      variant="red"
                      onIncrement={() => updateStat(teamIdx, p.id, "twoPointMiss", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "twoPointMiss", -1)}
                    />
                  </td>

                  {/* 3 Point Made */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.threePointMade}
                      variant="green"
                      onIncrement={() => updateStat(teamIdx, p.id, "threePointMade", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "threePointMade", -1)}
                    />
                  </td>

                  {/* 3 Point Miss */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.threePointMiss}
                      variant="red"
                      onIncrement={() => updateStat(teamIdx, p.id, "threePointMiss", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "threePointMiss", -1)}
                    />
                  </td>

                  {/* Assist */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.assist}
                      variant="green"
                      onIncrement={() => updateStat(teamIdx, p.id, "assist", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "assist", -1)}
                    />
                  </td>

                  {/* Freethrow Made */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.freethrowMade}
                      variant="green"
                      onIncrement={() => updateStat(teamIdx, p.id, "freethrowMade", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "freethrowMade", -1)}
                    />
                  </td>

                  {/* Freethrow Miss */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.freethrowMiss}
                      variant="red"
                      onIncrement={() => updateStat(teamIdx, p.id, "freethrowMiss", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "freethrowMiss", -1)}
                    />
                  </td>

                  {/* Rebound Off */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.reboundOff}
                      variant="green"
                      onIncrement={() => updateStat(teamIdx, p.id, "reboundOff", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "reboundOff", -1)}
                    />
                  </td>

                  {/* Rebound Def */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.reboundDef}
                      variant="green"
                      onIncrement={() => updateStat(teamIdx, p.id, "reboundDef", 1)}
                      onDecrement={() => updateStat(teamIdx, p.id, "reboundDef", -1)}
                    />
                  </td>

                  {/* Foul */}
                  <td className="border border-black px-0.5 py-1 text-center align-middle overflow-hidden">
                    <CounterPill
                      value={pStats.foul}
                      variant="red"
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
    <div className="flex flex-col w-full h-full pt-6">
      <h1 className="text-[32px] font-bold text-[#202224] font-poppins tracking-[-0.11px] mb-6">
        Scoring
      </h1>

      {/* Tabs */}
      <div className="bg-white flex items-center justify-between px-6 py-4 rounded-[12px] mb-8 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2">
          {matches.map((match, index) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className={`flex items-center h-[36px] px-4 rounded-full cursor-pointer transition-colors border ${
                activeMatchId === match.id
                  ? "bg-[#e2e8f0] border-transparent"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span
                className={`font-semibold text-[12px] font-poppins ${
                  activeMatchId === match.id ? "text-black" : "text-gray-600"
                }`}
              >
                Match {index + 1}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMatch(match.id);
                }}
                className={`flex items-center justify-center ml-2 ${
                  activeMatchId === match.id
                    ? "text-black hover:text-gray-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onAddScoring}
          className="bg-[#7a9ba8] hover:bg-[#688591] transition-colors flex items-center justify-center px-[24px] py-[10px] rounded-full h-[36px] shrink-0 ml-4"
        >
          <span className="font-semibold text-[12px] text-white font-poppins">
            + Add Scoring
          </span>
        </button>
      </div>

      {/* Main Box Score Card */}
      <div className="relative bg-white rounded-[12px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] w-full py-8 px-4 lg:px-8 flex flex-col items-center">
        
        {/* Static Top Header (Teams & Score Banner with Color Pickers) */}
        <div className="w-full flex flex-row items-center justify-between gap-4 mb-8 px-2">
              
              {/* Team 1 Header with Custom Color Picker */}
              <div className="flex items-center gap-3 relative">
                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker1(!showColorPicker1)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-300 transition-colors shadow-sm cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-black/20 shadow-inner"
                      style={{ backgroundColor: color1 }}
                    ></div>
                    <span className="text-[12px] font-medium text-gray-800 font-poppins">Custom</span>
                  </button>

                  {/* Color Picker Dropdown 1 */}
                  {showColorPicker1 && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[220px]">
                      <p className="text-[11px] font-bold text-gray-600 font-poppins mb-2">Pilih Warna HMD 1:</p>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {HMD_COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setColor1(p.hex);
                              setShowColorPicker1(false);
                            }}
                            className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-[10px] text-gray-500 font-poppins">Hex:</span>
                        <input
                          type="color"
                          value={color1}
                          onChange={(e) => setColor1(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={color1}
                          onChange={(e) => setColor1(e.target.value)}
                          className="w-20 text-[11px] font-mono border rounded px-1.5 py-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <h2
                  className="text-[28px] lg:text-[36px] font-black font-poppins uppercase tracking-tight whitespace-nowrap"
                  style={{ color: color1 === "#ffffff" ? "#1c1b1f" : color1 }}
                >
                  {team1}
                </h2>

                <div
                  className="font-extrabold text-[24px] lg:text-[28px] px-5 py-1 rounded-[10px] min-w-[65px] text-center leading-tight shadow-md whitespace-nowrap"
                  style={{
                    backgroundColor: color1 === "#ffffff" ? "#afb3b6" : color1,
                    color: color1 === "#ffffff" ? "#1c1b1f" : "#ffffff",
                  }}
                >
                  {team1Score}
                </div>
              </div>

              {/* Central VS */}
              <div className="text-[32px] lg:text-[40px] font-black text-[#8b0000] font-poppins leading-none select-none my-2 whitespace-nowrap">
                VS
              </div>

              {/* Team 2 Header with Custom Color Picker */}
              <div className="flex items-center gap-3 relative">
                <div
                  className="font-extrabold text-[24px] lg:text-[28px] px-5 py-1 rounded-[10px] min-w-[65px] text-center leading-tight shadow-md whitespace-nowrap"
                  style={{
                    backgroundColor: color2 === "#ffffff" ? "#afb3b6" : color2,
                    color: color2 === "#ffffff" ? "#1c1b1f" : "#ffffff",
                  }}
                >
                  {team2Score}
                </div>

                <h2
                  className="text-[28px] lg:text-[36px] font-black font-poppins uppercase tracking-tight whitespace-nowrap"
                  style={{ color: color2 === "#ffffff" ? "#1c1b1f" : color2 }}
                >
                  {team2}
                </h2>

                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker2(!showColorPicker2)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-300 transition-colors shadow-sm cursor-pointer"
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
                      <p className="text-[11px] font-bold text-gray-600 font-poppins mb-2">Pilih Warna HMD 2:</p>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {HMD_COLOR_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setColor2(p.hex);
                              setShowColorPicker2(false);
                            }}
                            className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-[10px] text-gray-500 font-poppins">Hex:</span>
                        <input
                          type="color"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="w-20 text-[11px] font-mono border rounded px-1.5 py-0.5"
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
              <div ref={exportRef} className="w-max min-w-full flex flex-col gap-4 bg-white p-5 rounded-xl">
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

        {/* Bottom Actions Row */}
        <div className="w-full flex flex-wrap justify-between items-center gap-4 mt-8 border-t pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors rounded-[50px] px-5 py-2 h-[38px] flex items-center gap-2 font-poppins text-[13px] font-bold shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 fill-gray-600" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-[#d92d20] hover:bg-[#b42318] text-white transition-colors rounded-[50px] px-5 py-2 h-[38px] flex items-center gap-2 font-poppins text-[13px] font-bold shadow-md disabled:opacity-60 cursor-pointer"
            >
              {isExporting ? (
                <span>Exporting...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z" />
                  </svg>
                  <span>Export PDF</span>
                </>
              )}
            </button>

            {/* Export PNG */}
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="bg-[#202224] hover:bg-black text-white transition-colors rounded-[50px] px-5 py-2 h-[38px] flex items-center gap-2 font-poppins text-[13px] font-bold shadow-md disabled:opacity-60 cursor-pointer"
            >
              {isExporting ? (
                <span>Exporting...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                  </svg>
                  <span>Export PNG</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

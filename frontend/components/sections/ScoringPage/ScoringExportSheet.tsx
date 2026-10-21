import React from "react";

import { type ExportSection, linesForView, sectionTitle, teamTotals } from "@/lib/boxScoreExport";
import { formatWib } from "@/lib/datetime";
import type { MatchSnapshot, PlayerLine, StatKey } from "@/lib/matchesApi";

interface ScoringExportSheetProps {
  snapshot: MatchSnapshot;
  section: ExportSection;
  color1: string;
  color2: string;
}

const STAT_COLUMNS: StatKey[] = [
  "twoPointMade",
  "twoPointMiss",
  "threePointMade",
  "threePointMiss",
  "assist",
  "freethrowMade",
  "freethrowMiss",
  "reboundOff",
  "reboundDef",
  "foul",
];

const isDark = (hex: string) => {
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const [r, g, b] = [0, 2, 4].map((start) => Number.parseInt(value.slice(start, start + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 155;
};

const cell = "border border-black px-1 py-1 text-center";

const TeamTable = ({ name, lines, color }: { name: string; lines: PlayerLine[]; color: string }) => {
  const custom = color !== "#ffffff";
  const headerStyle = { backgroundColor: custom ? color : "#ffffff", color: custom && isDark(color) ? "#ffffff" : "#000000" };
  const totals = teamTotals(lines);
  const points = totals.twoPointMade * 2 + totals.threePointMade * 3 + totals.freethrowMade;
  return (
    <table className="w-full table-fixed border-collapse border border-black bg-white font-poppins text-[11px] text-black">
      <colgroup>
        <col style={{ width: 110 }} />
        <col style={{ width: 30 }} />
        <col style={{ width: 40 }} />
        {STAT_COLUMNS.map((key) => (
          <col key={key} />
        ))}
      </colgroup>
      <thead style={headerStyle}>
        <tr>
          <th colSpan={13} className="border border-black py-1.5 text-[14px] font-black uppercase tracking-wider">
            {name}
          </th>
        </tr>
        <tr className="font-bold">
          <th rowSpan={2} className={cell}>Nama</th>
          <th rowSpan={2} className={cell}>NO</th>
          <th rowSpan={2} className={cell}>Total</th>
          <th colSpan={2} className={cell}>2 Point</th>
          <th colSpan={2} className={cell}>3 Point</th>
          <th rowSpan={2} className={cell}>Assist</th>
          <th colSpan={2} className={cell}>Freethrow</th>
          <th colSpan={2} className={cell}>Rebound</th>
          <th rowSpan={2} className={cell}>Foul</th>
        </tr>
        <tr className="text-[10px] font-normal">
          {["Made", "Miss", "Made", "Miss", "Made", "Miss", "Off", "Def"].map((label, index) => (
            <th key={index} className={`${cell} font-normal`}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lines.map((line, index) => (
          <tr key={line.id} className={index % 2 === 1 ? "bg-[#e8ecef]" : "bg-white"}>
            <td className="truncate border border-black px-1.5 py-1 font-semibold">{line.name}</td>
            <td className={`${cell} font-black`}>{line.nopung || "-"}</td>
            <td className={`${cell} font-black`}>{line.points}</td>
            {STAT_COLUMNS.map((key) => (
              <td key={key} className={`${cell} font-mono`}>
                {line[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="font-extrabold">
          <td className="border border-black py-1 text-center uppercase tracking-wider">Totals</td>
          <td className="border border-black" />
          <td className={cell}>{points}</td>
          {STAT_COLUMNS.map((key) => (
            <td key={key} className={cell}>
              {totals[key]}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
};

/**
 * Satu lembar export (satu bagian: Total atau satu periode). Hanya angka, tanpa
 * tombol ◀ ▶. Lebar tetap 1280 px, dirender di luar layar saat export PDF/PNG.
 */
export const ScoringExportSheet = ({ snapshot, section, color1, color2 }: ScoringExportSheetProps) => {
  const team1 = snapshot.team1.name ?? "Team 1";
  const team2 = snapshot.team2.name ?? "Team 2";
  const lines1 = linesForView(snapshot.team1.players, section);
  const lines2 = linesForView(snapshot.team2.players, section);
  const score1 = section === "total" ? snapshot.team1.score : (snapshot.team1.quarterScores[section - 1] ?? 0);
  const score2 = section === "total" ? snapshot.team2.score : (snapshot.team2.quarterScores[section - 1] ?? 0);

  return (
    <div className="flex w-[1280px] flex-col gap-3 bg-white p-6 font-poppins text-[#202224]">
      <div className="flex items-end justify-between border-b-2 border-black pb-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-600">IBL 2K26 · Box Score</p>
          <p className="text-[16px] font-bold">
            {snapshot.matchNumber !== null ? `Match ${snapshot.matchNumber} · ` : ""}
            {team1} vs {team2}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[20px] font-black uppercase tracking-wide text-[#8b0000]">{sectionTitle(section)}</p>
          <p className="text-[16px] font-bold">
            {team1} {score1} – {score2} {team2}
          </p>
        </div>
        <div className="text-right text-[12px]">
          <p>{snapshot.venue ?? ""}</p>
          <p>{formatWib(snapshot.scheduledAt)}</p>
          {section !== "total" && (
            <p className="font-semibold">
              Total: {snapshot.team1.score} – {snapshot.team2.score}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <TeamTable name={team1} lines={lines1} color={color1} />
        </div>
        <div className="min-w-0 flex-1">
          <TeamTable name={team2} lines={lines2} color={color2} />
        </div>
      </div>
    </div>
  );
};

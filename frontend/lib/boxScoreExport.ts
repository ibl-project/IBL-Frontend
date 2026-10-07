import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import { type MatchSnapshot, type PlayerLine, type StatCounts, STAT_KEYS, periodLabel } from "@/lib/matchesApi";

/**
 * Export box score scoring desk: CSV dan PDF.
 *
 * Satu bagian (section) = satu periode (1–4 = Quarter, 5+ = OT) atau "total".
 * Dari tab mana pun, satu file selalu berisi Quarter 1–4 (lalu OT kalau ada)
 * dan terakhir Total, berurutan dari atas ke bawah.
 */
export type ExportSection = number | "total";

const zeroCounts = (): StatCounts => Object.fromEntries(STAT_KEYS.map((key) => [key, 0])) as StatCounts;

/** Baris pemain dengan angka satu periode, atau Total apa adanya. */
export function linesForView(players: PlayerLine[], view: ExportSection): PlayerLine[] {
  if (view === "total") return players;
  return players.map((player) => {
    const line = player.quarters?.[view];
    return { ...player, ...zeroCounts(), ...line, points: line?.points ?? 0 };
  });
}

/** Bagian yang masuk file: semua periode (Quarter 1–4, OT kalau ada), lalu Total. */
export function exportSections(snapshot: MatchSnapshot): ExportSection[] {
  const periods = snapshot.quarters.length > 0 ? snapshot.quarters.map((quarter) => quarter.quarter) : [1, 2, 3, 4];
  return [...periods, "total"];
}

export function sectionTitle(section: ExportSection): string {
  return section === "total" ? "Total" : periodLabel(section);
}

/** Nama file: IBL2K26_Match3_HMD_1_vs_HMD_2_BoxScore. */
export function exportFileName(snapshot: MatchSnapshot): string {
  const clean = (text: string) => text.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const match = snapshot.matchNumber !== null ? `Match${snapshot.matchNumber}_` : "";
  return `IBL2K26_${match}${clean(snapshot.team1.name ?? "Team1")}_vs_${clean(snapshot.team2.name ?? "Team2")}_BoxScore`;
}

// ----------------------------------------------------------------------------
// CSV
// ----------------------------------------------------------------------------

const CSV_HEADERS = [
  "NO", "NAMA PEMAIN", "PTS", "2PM", "2PMISS", "2PA", "2P%", "3PM", "3PMISS", "3PA", "3P%",
  "FTM", "FTMISS", "FTA", "FT%", "AST", "OREB", "DREB", "REB", "FOUL",
];

const percent = (made: number, attempted: number) => (attempted > 0 ? `${((made / attempted) * 100).toFixed(1)}%` : "0.0%");

/** Satu baris statistik (pemain atau total tim) dalam urutan CSV_HEADERS. */
function statRow(no: string, name: string, counts: StatCounts): Array<string | number> {
  const twoAttempted = counts.twoPointMade + counts.twoPointMiss;
  const threeAttempted = counts.threePointMade + counts.threePointMiss;
  const freeAttempted = counts.freethrowMade + counts.freethrowMiss;
  return [
    no,
    name,
    counts.twoPointMade * 2 + counts.threePointMade * 3 + counts.freethrowMade,
    counts.twoPointMade, counts.twoPointMiss, twoAttempted, percent(counts.twoPointMade, twoAttempted),
    counts.threePointMade, counts.threePointMiss, threeAttempted, percent(counts.threePointMade, threeAttempted),
    counts.freethrowMade, counts.freethrowMiss, freeAttempted, percent(counts.freethrowMade, freeAttempted),
    counts.assist, counts.reboundOff, counts.reboundDef, counts.reboundOff + counts.reboundDef, counts.foul,
  ];
}

/** Jumlah statistik semua pemain satu tim. */
export function teamTotals(lines: PlayerLine[]): StatCounts {
  const total = zeroCounts();
  for (const line of lines) for (const key of STAT_KEYS) total[key] += line[key];
  return total;
}

const pointsOf = (counts: StatCounts) => counts.twoPointMade * 2 + counts.threePointMade * 3 + counts.freethrowMade;

/** Satu file CSV bersection: header match, lalu setiap bagian berisi dua tabel tim. */
export function buildBoxScoreCsv(snapshot: MatchSnapshot, sections: ExportSection[], exportedAt = new Date()): string {
  const team1 = snapshot.team1.name ?? "Team 1";
  const team2 = snapshot.team2.name ?? "Team 2";
  const periodScores = snapshot.quarters
    .map((quarter) => {
      const index = quarter.quarter - 1;
      return `${periodLabel(quarter.quarter)} ${snapshot.team1.quarterScores[index] ?? 0}-${snapshot.team2.quarterScores[index] ?? 0}`;
    })
    .join(" | ");

  const rows: Array<Array<string | number>> = [
    ["IBL 2K26 - OFFICIAL BASKETBALL BOX SCORE REPORT"],
    ["Match", `${snapshot.matchNumber !== null ? `Match ${snapshot.matchNumber} - ` : ""}${team1} vs ${team2}`],
    ["Skor Total", `${team1} (${snapshot.team1.score}) - (${snapshot.team2.score}) ${team2}`],
    ["Skor per periode", periodScores || "-"],
    ["Isi file", sections.map((section) => sectionTitle(section).toUpperCase()).join(", ")],
    [
      "Diekspor",
      exportedAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "long", timeStyle: "short" }) + " WIB",
    ],
  ];

  for (const section of sections) {
    rows.push([], [`=== ${sectionTitle(section).toUpperCase()} ===`]);
    for (const side of [snapshot.team1, snapshot.team2]) {
      const name = side.name ?? "Team";
      const lines = linesForView(side.players, section);
      const totals = teamTotals(lines);
      rows.push(
        [`--- TEAM: ${name} (Points: ${pointsOf(totals)}) ---`],
        CSV_HEADERS,
        ...lines.map((line) => statRow(line.nopung || "-", line.name || "-", line)),
        statRow("TOTAL", `${name} TOTAL`, totals),
        [],
      );
    }
  }

  const escape = (cell: string | number) => {
    const text = String(cell);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // BOM + sep=, supaya Excel (locale Indonesia) memisahkan kolom dengan benar.
  return "﻿sep=,\r\n" + rows.map((row) => row.map(escape).join(",")).join("\r\n");
}

export function downloadCsv(content: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// PDF (dari lembar export statis yang dirender di luar layar)
// ----------------------------------------------------------------------------

function capture(element: HTMLElement): Promise<string> {
  return toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });
}

/** PDF A4 landscape, satu halaman per lembar. */
export async function exportPdf(sheets: HTMLElement[], fileName: string): Promise<void> {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;

  for (const [index, sheet] of sheets.entries()) {
    const dataUrl = await capture(sheet);
    const image = new Image();
    image.src = dataUrl;
    await image.decode();

    const scale = Math.min((pageWidth - margin * 2) / image.naturalWidth, (pageHeight - margin * 2) / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    if (index > 0) pdf.addPage("a4", "landscape");
    pdf.addImage(dataUrl, "PNG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height, undefined, "FAST");
  }
  pdf.save(fileName);
}

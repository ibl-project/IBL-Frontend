import { toWibFields } from "@/lib/datetime";
import type { MatchSide, MatchTeamSide } from "@/lib/matchesApi";
import { MONTHS_ID_SHORT } from "@/lib/scheduleDays";

/**
 * Format tampilan satu pertandingan, dipakai halaman Schedule & Result (publik) dan
 * detail jadwal di dashboard.
 */

/** Nama tim; di playoff sisi yang belum ditentukan memakai placeholder, mis. "Pemenang QF1". */
export function teamLabel(side: MatchTeamSide): string {
  return side.name ?? side.placeholder ?? "TBD";
}

/** "05 Okt 2026 19.00 WIB" (format kartu jadwal). */
export function formatKickoff(iso: string | null): string {
  if (!iso) return "Jadwal belum diatur";
  const { date, time } = toWibFields(iso);
  const [year, month, day] = date.split("-");
  return `${day} ${MONTHS_ID_SHORT[Number(month) - 1]} ${year} ${time.replace(":", ".")} WIB`;
}

const ratio = (made: number, attempted: number, percentage: number) =>
  `${made}/${attempted} (${Number.isInteger(percentage) ? percentage : percentage.toFixed(1)}%)`;

/** Baris tabel ringkasan statistik tim (Total semua periode). */
export const SUMMARY_ROWS: Array<{ label: string; value: (side: MatchSide) => string }> = [
  {
    label: "Field Goals",
    value: ({ summary: s }) => ratio(s.fieldGoalsMade, s.fieldGoalsAttempted, s.fieldGoalPercentage),
  },
  { label: "2 Points", value: ({ summary: s }) => ratio(s.twoPointMade, s.twoPointAttempted, s.twoPointPercentage) },
  {
    label: "3 Points",
    value: ({ summary: s }) => ratio(s.threePointMade, s.threePointAttempted, s.threePointPercentage),
  },
  {
    label: "Free Throws",
    value: ({ summary: s }) => ratio(s.freeThrowsMade, s.freeThrowsAttempted, s.freeThrowPercentage),
  },
  { label: "Rebounds (O/D)", value: ({ summary: s }) => `${s.reboundOff}/${s.reboundDef}` },
  { label: "Assist", value: ({ summary: s }) => String(s.assist) },
];

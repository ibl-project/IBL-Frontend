import { toWibFields } from "@/lib/datetime";
import type { MatchListItem } from "@/lib/matchesApi";

/**
 * Hari pertandingan untuk kalender di halaman Schedule & Result.
 * Tanggal selalu menurut WIB, jadi laga 23:30 UTC masuk ke hari berikutnya.
 */

export const WEEKDAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const WEEKDAYS_ID_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const MONTHS_ID_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export interface MatchDay {
  /** "YYYY-MM-DD" menurut WIB, juga dipakai di ?date= */
  dateKey: string;
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  /** 0 = Minggu … 6 = Sabtu */
  weekday: number;
  /** Urut jam, lalu nomor laga. Jumlah laga = matches.length. */
  matches: MatchListItem[];
}

export interface GroupedMatchDays {
  days: MatchDay[];
  /** Laga tanpa jadwal (scheduledAt kosong), tidak masuk kalender. */
  unscheduled: MatchListItem[];
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(value: string | null | undefined): value is string {
  return !!value && DATE_KEY.test(value);
}

function compareWithinDay(a: MatchListItem, b: MatchListItem): number {
  // Bandingkan waktunya, bukan teksnya: "…Z" dan "…+07:00" bisa menunjuk jam yang sama.
  const byTime = Date.parse(a.scheduledAt ?? "") - Date.parse(b.scheduledAt ?? "");
  if (byTime !== 0) return byTime;
  return (a.matchNumber ?? Number.MAX_SAFE_INTEGER) - (b.matchNumber ?? Number.MAX_SAFE_INTEGER);
}

/** Kelompokkan laga per hari WIB, urut tanggal. */
export function groupMatchesByWibDay(matches: MatchListItem[]): GroupedMatchDays {
  const byDate = new Map<string, MatchListItem[]>();
  const unscheduled: MatchListItem[] = [];

  for (const match of matches) {
    if (!match.scheduledAt) {
      unscheduled.push(match);
      continue;
    }
    const { date } = toWibFields(match.scheduledAt);
    const list = byDate.get(date);
    if (list) list.push(match);
    else byDate.set(date, [match]);
  }

  const days = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b)) // "YYYY-MM-DD" urut seperti kalender
    .map(([dateKey, list]) => {
      const [year, month, day] = dateKey.split("-").map(Number);
      return {
        dateKey,
        year,
        month,
        day,
        // Dari tanggal, bukan dari jam laga: getDay() biasa memakai zona waktu browser.
        weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
        matches: [...list].sort(compareWithinDay),
      };
    });

  return { days, unscheduled };
}

/**
 * Hari yang terpilih saat halaman dibuka: ?date= kalau ada di kalender, lalu hari ini,
 * lalu hari laga berikutnya, lalu hari laga terakhir. null kalau belum ada jadwal.
 */
export function pickDefaultDay(days: MatchDay[], requested: string | null, today: string): string | null {
  if (days.length === 0) return null;
  if (isDateKey(requested) && days.some((day) => day.dateKey === requested)) return requested;
  const upcoming = days.find((day) => day.dateKey >= today);
  return (upcoming ?? days[days.length - 1]).dateKey;
}

/** "Senin, 5 Oktober 2026" (untuk aria-label dan pengumuman layar). */
export function formatMatchDay(day: MatchDay): string {
  return `${WEEKDAYS_ID[day.weekday]}, ${day.day} ${MONTHS_ID[day.month - 1]} ${day.year}`;
}

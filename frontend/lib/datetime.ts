/**
 * Jadwal pertandingan selalu dalam WIB (Asia/Jakarta), apa pun zona waktu
 * laptop panitia. Tanggal disimpan "YYYY-MM-DD" dan jam "HH:MM" (24 jam).
 */

const TIME_ZONE = "Asia/Jakarta";

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const monthFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, month: "short" });

function wibParts(iso: string) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
  };
}

/** "2026-09-02T04:00:00Z" → "02 Sep 2026 11:00 WIB" (format kartu jadwal). */
export function formatWib(iso: string | null): string {
  if (!iso) return "Jadwal belum diatur";
  const { year, day, hour, minute } = wibParts(iso);
  return `${day} ${monthFormatter.format(new Date(iso))} ${year} ${hour}:${minute} WIB`;
}

/** ISO → { date: "YYYY-MM-DD", time: "HH:MM" } dalam WIB, untuk mengisi form Edit. */
export function toWibFields(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const { year, month, day, hour, minute } = wibParts(iso);
  return { date: `${year}-${month}-${day}`, time: `${hour}:${minute}` };
}

/** "2026-09-02" + "11:00" → "2026-09-02T11:00:00+07:00". */
export function fromWibFields(date: string, time: string): string {
  return `${date}T${time}:00+07:00`;
}

/** "2026-09-02" → "09/02/2026" (format mm/dd/yyyy di desain). */
export function formatDateField(date: string): string {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${month}/${day}/${year}` : "";
}

/** Tanggal hari ini menurut WIB, "YYYY-MM-DD". */
export function todayWib(): string {
  return toWibFields(new Date().toISOString()).date;
}

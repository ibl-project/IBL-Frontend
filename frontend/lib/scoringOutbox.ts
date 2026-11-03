import type { StatKey } from "@/lib/matchesApi";

/**
 * =============================================================================
 * ANTREAN SCORING DI LAPTOP (localStorage)
 * =============================================================================
 * Ketukan ◀ ▶ dan "Save and Lock" yang belum dijawab server disimpan di sini
 * dulu, baru dikirim. Jadi kalau wifi/backend mati, tab di-reload, atau
 * laptop mati, isinya tidak hilang: dikirim lagi saat desk match itu dibuka
 * dan koneksi kembali (lib/hooks/useAutoSaveActions.ts).
 *
 * - Satu entri per item, kuncinya berisi akun + match + urutan. Dua tab tidak
 *   saling menimpa, dan antrean akun lain di laptop yang sama tidak terkirim
 *   atas nama akun ini.
 * - localStorage (bukan IndexedDB): datanya kecil (±200 byte per ketukan) dan
 *   tulisannya sudah selesai saat tombol diketuk.
 * - Isinya hanya data skor, tidak ada token.
 * =============================================================================
 */

export interface OutboxTap {
  kind: "tap";
  /** Urutan kirim (naik terus), sekaligus bagian kunci storage. */
  seq: number;
  actionId: string;
  playerId: string;
  teamId: string;
  quarter: number;
  actionType: StatKey;
  delta: 1 | -1;
  createdAt: string;
}

/** "Save and Lock" periode yang bukan periode terbuka terakhir (hasilnya pasti: periode berikutnya dibuka). */
export interface OutboxLock {
  kind: "lock";
  seq: number;
  quarter: number;
  createdAt: string;
}

export type OutboxItem = OutboxTap | OutboxLock;

const PREFIX = "ibl-scoring-outbox:v1";

const keyPrefix = (userId: string, matchId?: string) =>
  matchId ? `${PREFIX}:${userId}:${matchId}:` : `${PREFIX}:${userId}:`;

let lastSeq = 0;

/** Nomor urut baru. Angka acak kecil supaya dua tab di milidetik yang sama tidak bentrok. */
export function nextSeq(): number {
  lastSeq = Math.max(Date.now() * 1000 + Math.floor(Math.random() * 1000), lastSeq + 1);
  return lastSeq;
}

function isOutboxItem(value: unknown): value is OutboxItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<OutboxItem>;
  return (item.kind === "tap" || item.kind === "lock") && typeof item.seq === "number" && typeof item.quarter === "number";
}

/** Semua entri dengan awalan kunci tertentu. Storage diblokir → kosong. */
function readEntries(prefix: string): Array<{ key: string; item: OutboxItem }> {
  const entries: Array<{ key: string; item: OutboxItem }> = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      try {
        const item: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
        if (isOutboxItem(item)) entries.push({ key, item });
      } catch {
        // Entri rusak dilewati.
      }
    }
  } catch {
    // Storage diblokir browser.
  }
  return entries;
}

/** Antrean satu match milik akun ini, urut sesuai ketukan. */
export function loadOutbox(userId: string, matchId: string): OutboxItem[] {
  return readEntries(keyPrefix(userId, matchId))
    .map((entry) => entry.item)
    .sort((a, b) => a.seq - b.seq);
}

/** false kalau tidak bisa disimpan (storage diblokir atau penuh): item tetap jalan dari memori. */
export function saveOutboxItem(userId: string, matchId: string, item: OutboxItem): boolean {
  try {
    localStorage.setItem(`${keyPrefix(userId, matchId)}${item.seq}`, JSON.stringify(item));
    return true;
  } catch {
    return false;
  }
}

export function deleteOutboxItem(userId: string, matchId: string, seq: number): void {
  try {
    localStorage.removeItem(`${keyPrefix(userId, matchId)}${seq}`);
  } catch {
    // Storage diblokir: item memang tidak pernah tersimpan.
  }
}

export function hasOutbox(userId: string, matchId: string): boolean {
  return readEntries(keyPrefix(userId, matchId)).length > 0;
}

/** Jumlah item yang belum terkirim per match (untuk tanda di card daftar Scoring). */
export function countOutboxByMatch(userId: string): Record<string, number> {
  const prefix = keyPrefix(userId);
  const counts: Record<string, number> = {};
  for (const { key } of readEntries(prefix)) {
    const matchId = key.slice(prefix.length).split(":")[0];
    if (matchId) counts[matchId] = (counts[matchId] ?? 0) + 1;
  }
  return counts;
}

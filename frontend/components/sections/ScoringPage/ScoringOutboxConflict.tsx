"use client";

import React, { useState } from "react";

import { type MatchSnapshot, periodLabel } from "@/lib/matchesApi";
import { toWibFields } from "@/lib/datetime";
import type { OutboxItem } from "@/lib/scoringOutbox";
import { STAT_LABEL } from "./ScoringBoxScoreSection";

interface ScoringOutboxConflictProps {
  items: OutboxItem[];
  /** Untuk nama pemain & tim; null kalau data match belum termuat. */
  snapshot: MatchSnapshot | null;
  /** Alasan server menghentikan pengiriman; null kalau belum ada (mis. sesi dipegang akun lain). */
  reason: string | null;
  /** "Coba kirim lagi" hanya bisa saat akun ini pemegang sesi. */
  canRetry: boolean;
  onRetry: () => void;
  onDiscard: () => void;
}

function describe(item: OutboxItem, snapshot: MatchSnapshot | null): string {
  const time = toWibFields(item.createdAt).time;
  if (item.kind === "lock") return `${time} · Save and Lock ${periodLabel(item.quarter)}`;
  const team = snapshot?.team1.id === item.teamId ? snapshot.team1 : snapshot?.team2.id === item.teamId ? snapshot.team2 : null;
  const player = team?.players.find((line) => line.id === item.playerId);
  const who = player ? `${player.name}${team?.name ? ` (${team.name})` : ""}` : "Pemain tidak dikenal";
  return `${time} · ${periodLabel(item.quarter)} · ${who} · ${STAT_LABEL[item.actionType]} ${item.delta > 0 ? "+1" : "−1"}`;
}

/**
 * Antrean scoring yang berhenti dikirim (sesi diambil akun lain, match atau
 * periode berubah dari laptop lain). Tidak pernah dikirim atau dihapus
 * otomatis: panitia mencocokkan dulu, lalu memilih kirim lagi atau buang.
 */
export const ScoringOutboxConflict = ({
  items,
  snapshot,
  reason,
  canRetry,
  onRetry,
  onDiscard,
}: ScoringOutboxConflictProps) => {
  const [confirming, setConfirming] = useState(false);
  if (items.length === 0) return null;

  return (
    <div role="alert" className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left font-poppins text-sm text-red-800">
      <p className="font-semibold">{items.length} data scoring dari laptop ini belum terkirim, dan pengirimannya dihentikan.</p>
      {reason && <p className="mt-1">Alasan: {reason}</p>}
      <p className="mt-1">
        Data di bawah tetap tersimpan di laptop ini. Cocokkan dengan skor di layar, lalu kirim lagi setelah sesi kembali ke
        akun ini, atau input ulang manual lalu buang.
      </p>
      <ul className="mt-2 max-h-48 list-disc overflow-y-auto pl-5 text-xs">
        {items.map((item) => (
          <li key={item.seq}>{describe(item, snapshot)}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onDiscard();
              }}
              className="h-9 rounded-full bg-[#7a0000] px-4 text-xs font-bold text-white hover:bg-[#5c0000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a0000]"
            >
              Ya, buang {items.length} data
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-9 rounded-full bg-white px-4 text-xs font-bold text-gray-700 hover:bg-gray-100"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onRetry}
              disabled={!canRetry}
              title={canRetry ? undefined : "Sesi scoring match ini sedang tidak dipegang akun ini"}
              className="h-9 rounded-full bg-[#2f9b9a] px-4 text-xs font-bold text-white hover:bg-[#257f7e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9b9a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Coba kirim lagi
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="h-9 rounded-full border border-[#7a0000] bg-white px-4 text-xs font-bold text-[#7a0000] hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a0000]"
            >
              Buang
            </button>
          </>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Trash2 } from "lucide-react";

import { type ScoringBoardItem, isLiveNow, periodLabel } from "@/lib/matchesApi";
import { MatchCard } from "@/components/sections/ScheduleResultPage/MatchCard";
import { ScoringLandingSection } from "./ScoringLandingSection";

interface ScoringMatchListSectionProps {
  /** Match yang sudah di-score (sudah Create Match). */
  items: ScoringBoardItem[];
  /** true kalau daftar sedang difilter tanggal (untuk teks kosong). */
  filtered: boolean;
  /** Jumlah ketukan/kunci per match yang masih tersimpan di laptop ini dan belum terkirim. */
  unsent: Record<string, number>;
  onScore: (match: ScoringBoardItem) => void;
  /** Tombol sampah: hapus score match ini (dua kali konfirmasi di halaman). */
  onDelete: (match: ScoringBoardItem) => void;
}

/** Status singkat di kartu: belum dimulai, periode yang berjalan, koreksi, selesai. */
function statusText(match: ScoringBoardItem): string {
  const current = match.scoring.currentQuarter;
  // LIVE yang belum di-scoring siapa pun (0–0, tanpa sesi) juga "Belum dimulai".
  if (match.status === "SCHEDULED" || (match.status === "LIVE" && !isLiveNow(match))) return "Belum dimulai";
  if (match.status === "LIVE") return current ? `Berlangsung · ${periodLabel(current)}` : "Berlangsung";
  if (!match.locked) return current ? `Koreksi · ${periodLabel(current)}` : "Koreksi";
  return "Selesai";
}

/**
 * Card match yang sudah di-score di halaman Scoring (desain "Schedule Result
 * [Display]"): tombol Score membuka scoring desk, tombol sampah menghapus score
 * match itu. Jadwal baru ditambahkan lewat "+ Add Scoring".
 */
export const ScoringMatchListSection = ({ items, filtered, unsent, onScore, onDelete }: ScoringMatchListSectionProps) => {
  if (items.length === 0) return <ScoringLandingSection filtered={filtered} />;

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-7 font-poppins lg:grid-cols-2 2xl:px-12">
      {items.map((match) => {
        const holder = match.scoring.holder && !match.scoring.isMine ? match.scoring.holder.name : null;
        const incomplete = !match.team1.id || !match.team2.id;
        // Jadwal yang sedang disiapkan akun lain belum bisa dibuka; match yang
        // sudah berjalan tetap bisa dibuka (desk menampilkan siapa pemegangnya).
        const blocked = incomplete || (match.status === "SCHEDULED" && holder !== null);
        const label = match.matchNumber !== null ? `Match ${match.matchNumber}` : "Belum dimulai";
        const waiting = unsent[match.id] ?? 0;
        return (
          <MatchCard
            key={match.id}
            match={match}
            actionLabel="Score"
            actionContext={label}
            onAction={() => onScore(match)}
            disabled={blocked}
            meta={
              <p className="flex flex-wrap items-center justify-center gap-x-2 text-[12px]">
                <span className="font-bold text-[#202224]">{label}</span>
                {match.matchNumber !== null && <span className="text-gray-600">{statusText(match)}</span>}
              </p>
            }
            corner={
              <button
                type="button"
                onClick={() => onDelete(match)}
                disabled={holder !== null}
                title={holder ? `Sedang dipakai ${holder}` : `Hapus score ${label}`}
                aria-label={`Hapus score ${label}, ${match.team1.name} vs ${match.team2.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#7a0000] transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a0000] disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
              >
                <Trash2 aria-hidden="true" className="h-5 w-5" />
              </button>
            }
            note={
              waiting > 0
                ? `${waiting} belum terkirim dari laptop ini. Buka Score untuk mengirim.`
                : incomplete
                  ? "Tim belum lengkap"
                  : holder
                    ? match.status === "SCHEDULED"
                      ? `Sedang disiapkan ${holder}`
                      : `Dipakai ${holder}`
                    : null
            }
          />
        );
      })}
    </div>
  );
};

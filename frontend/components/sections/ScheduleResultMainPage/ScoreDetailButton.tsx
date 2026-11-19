"use client";

import React, { useRef } from "react";

import { motion } from "framer-motion";

import type { MatchSnapshot } from "@/lib/matchesApi";

interface ScoreDetailButtonProps {
  match: MatchSnapshot | null;
}

/** Klik kedua dalam rentang ini diabaikan, supaya double-click tidak membuka dua tab. */
const REPEAT_CLICK_MS = 1_000;

/**
 * Link ke halaman PDF Score Detail, dibuka di tab baru.
 *
 * PDF sengaja TIDAK dibuat di sini: di HP, halaman ini dibekukan browser begitu tab baru tampil di depan,
 * sehingga proses berhenti. Halaman /schedule-result-main/score-detail membuat PDF-nya sendiri.
 */
export function ScoreDetailButton({ match }: ScoreDetailButtonProps) {
  const lastClickRef = useRef(0);

  const className =
    "relative inline-flex items-center justify-center " +
    "rounded-[3.5px] sm:rounded-[6px] md:rounded-[8px] " +
    "border border-[#5ed3df]/60 bg-gradient-to-b from-[#389ba6] to-[#1e6570] " +
    "px-[clamp(7px,1.8cqw,24px)] h-[clamp(17px,3.4cqw,40px)] " +
    "font-poppins font-bold text-white tracking-wide " +
    "text-[clamp(8px,1.25cqw,15px)] leading-none " +
    "shadow-[0_1px_3px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] sm:shadow-[0_2px_5px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] " +
    "transition-colors select-none";

  if (!match) {
    return (
      <span
        aria-disabled="true"
        title="Memuat data pertandingan..."
        className={`${className} cursor-not-allowed opacity-50`}
      >
        Score Detail
      </span>
    );
  }

  return (
    <motion.a
      href={`/schedule-result-main/score-detail?id=${encodeURIComponent(match.id)}`}
      target="_blank"
      rel="noopener"
      title="Buka Lembar Skor di Tab Baru"
      onClick={(event) => {
        const now = Date.now();
        if (now - lastClickRef.current < REPEAT_CLICK_MS) event.preventDefault();
        lastClickRef.current = now;
      }}
      whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.96 }}
      className={`${className} cursor-pointer hover:border-[#6fe5f0]`}
    >
      Score Detail
    </motion.a>
  );
}

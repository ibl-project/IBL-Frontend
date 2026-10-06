"use client";

import React, { useRef } from "react";
import { Lock } from "lucide-react";

import { type QuarterState, periodLabel } from "@/lib/matchesApi";

/** Tampilan di scoring desk: satu periode (1–4 = Quarter, 5+ = OT) atau Total. */
export type ScoringView = number | "total";

interface ScoringQuarterTabsProps {
  quarters: QuarterState[];
  /** Periode aktif (terkecil yang belum terkunci); null kalau semua terkunci. */
  currentQuarter: number | null;
  view: ScoringView;
  onSelect: (view: ScoringView) => void;
}

type TabState = "active" | "locked" | "closed";

const STATUS_LABEL: Record<TabState, string> = {
  active: "Aktif",
  locked: "Terkunci",
  closed: "Belum dibuka",
};

/**
 * Tab Quarter 1–4, OT (kalau ada), dan Total di scoring desk.
 *   - Aktif       : periode yang sedang diisi.
 *   - Terkunci    : sudah Save and Lock; bisa dilihat dan di-Unlock.
 *   - Belum dibuka: abu-abu, tidak bisa diklik sampai periode sebelumnya dikunci.
 * Total hanya bisa dibuka setelah semua periode terkunci (baca saja).
 */
export const ScoringQuarterTabs = ({ quarters, currentQuarter, view, onSelect }: ScoringQuarterTabsProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const allLocked = quarters.length > 0 && quarters.every((quarter) => quarter.locked);

  const tabs: Array<{ key: string; view: ScoringView; label: string; state: TabState; hint: string }> = [
    ...quarters.map((quarter) => {
      const state: TabState = quarter.locked ? "locked" : quarter.quarter === currentQuarter ? "active" : "closed";
      return {
        key: String(quarter.quarter),
        view: quarter.quarter,
        label: periodLabel(quarter.quarter),
        state,
        hint:
          state === "closed" && currentQuarter !== null
            ? `Bisa dibuka setelah ${periodLabel(currentQuarter)} dikunci`
            : STATUS_LABEL[state],
      };
    }),
    {
      key: "total",
      view: "total",
      label: "Total",
      state: allLocked ? "locked" : "closed",
      hint: allLocked ? "Akumulasi semua periode (baca saja)" : "Bisa dibuka setelah semua periode dikunci",
    },
  ];

  // Panah kiri/kanan berpindah antar tab yang bisa dibuka.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const enabled = tabs.filter((tab) => tab.state !== "closed");
    const index = enabled.findIndex((tab) => tab.view === view);
    const next = enabled[(index + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
    if (!next) return;
    event.preventDefault();
    onSelect(next.view);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.key}"]`)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Periode pertandingan"
      onKeyDown={handleKeyDown}
      className="flex w-full items-center justify-center gap-2.5 sm:gap-4 overflow-x-auto py-2 font-poppins"
    >
      {tabs.map((tab) => {
        const selected = tab.view === view;
        const closed = tab.state === "closed";
        const displayLabel = tab.view === "total" ? "Total" : tab.label.toUpperCase();
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            data-tab={tab.key}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={closed}
            title={tab.hint}
            onClick={() => onSelect(tab.view)}
            className={`flex h-[40px] sm:h-[44px] min-w-[110px] sm:min-w-[130px] shrink-0 items-center justify-center rounded-full border-2 px-5 sm:px-6 text-xs sm:text-sm font-bold tracking-wide transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#208682] ${
              closed
                ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 opacity-60"
                : selected
                  ? "border-[#208682] bg-[#208682] text-white shadow-xs"
                  : "border-[#208682] bg-white text-[#208682] hover:bg-[#208682]/10"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {displayLabel}
              {tab.state === "locked" && tab.view !== "total" && (
                <Lock aria-hidden="true" className="h-3.5 w-3.5 opacity-80" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  MONTHS_ID,
  MONTHS_ID_SHORT,
  WEEKDAYS_ID,
  WEEKDAYS_ID_SHORT,
  type MatchDay,
  formatMatchDay,
} from "@/lib/scheduleDays";

/**
 * Kalender hari pertandingan (desain Figma "calendar grouping").
 *
 * Ukuran: wrapper adalah container bernama "strip". Posisi kartu & panah memakai cqw
 * strip; isi kartu memakai cqw kartunya sendiri, jadi tampilan kartu sama di semua lebar.
 * Di bawah 480px strip, baris kartu memakai tata letak Figma mobile (kartu lebih besar,
 * jarak lebih rapat). Detail angka: IMPLEMENTATION_CALENDAR.md §3–§5.
 */

const DAYS_PER_PAGE = 5;

export type CalendarStripStatus = "loading" | "error" | "ready";

interface CalendarStripProps {
  days: MatchDay[];
  selectedKey: string | null;
  onSelect: (dateKey: string) => void;
  status: CalendarStripStatus;
  onRetry?: () => void;
}

// Path chevron diambil dari "calendar grouping.svg" (elemen 3 dan 5), viewBox digeser ke lingkarannya.
const CHEVRON = {
  prev: {
    viewBox: "42.1779 108 26 26",
    d: "M58.4279 114.5C58.4279 114.5 51.928 119.287 51.9279 121C51.9279 122.713 58.4279 127.5 58.4279 127.5",
  },
  next: {
    viewBox: "910.178 108 26 26",
    d: "M919.928 114.5C919.928 114.5 926.428 119.287 926.428 121C926.428 122.713 919.928 127.5 919.928 127.5",
  },
};

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44D1D1]";

/** "Oktober 2026", "Okt – Nov 2026", atau "Des 2026 – Jan 2027" untuk hari yang sedang tampil. */
function captionFor(visible: MatchDay[]): string {
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (!first || !last) return "";
  if (first.year === last.year && first.month === last.month) {
    return `${MONTHS_ID[first.month - 1]} ${first.year}`;
  }
  const short = (day: MatchDay) => MONTHS_ID_SHORT[day.month - 1];
  return first.year === last.year
    ? `${short(first)} – ${short(last)} ${first.year}`
    : `${short(first)} ${first.year} – ${short(last)} ${last.year}`;
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  // Area ketuk 44px tak terlihat; melebar ke arah luar strip, tidak pernah menutupi kartu.
  const hitArea = isPrev
    ? "before:right-[calc(50%_-_min(22px,5.42cqw))] @max-[480px]/strip:before:right-[calc(50%_-_min(22px,2.69cqw))]"
    : "before:left-[calc(50%_-_min(22px,5.42cqw))] @max-[480px]/strip:before:left-[calc(50%_-_min(22px,2.69cqw))]";
  const position = isPrev
    ? "left-[4.31%] @max-[480px]/strip:left-[3.8%]"
    : "left-[93.07%] @max-[480px]/strip:left-[93.65%]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Hari sebelumnya" : "Hari berikutnya"}
      className={`absolute top-1/2 z-10 aspect-square w-[2.66cqw] -translate-y-1/2 cursor-pointer rounded-full bg-[#44D1D1] before:absolute before:top-1/2 before:h-11 before:w-11 before:-translate-y-1/2 before:content-[''] disabled:cursor-default disabled:opacity-40 @max-[480px]/strip:w-[3.17cqw] ${position} ${hitArea} ${FOCUS_RING}`}
    >
      <svg viewBox={CHEVRON[direction].viewBox} className="block h-full w-full" fill="none" aria-hidden="true">
        <path
          d={CHEVRON[direction].d}
          stroke="#09090B"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// Kartu: lebar & radius memakai cqw strip (properti elemen container sendiri merujuk ke strip),
// isinya memakai cqw kartu.
const CARD_SHELL =
  "@container group relative aspect-square w-[14.64cqw] shrink-0 rounded-[0.82cqw] bg-[linear-gradient(176.22deg,#F5EAA5_9.94%,#7E0202_122.17%)] @max-[480px]/strip:w-[16.21cqw] @max-[480px]/strip:rounded-[1.76cqw]";

// "Jendela" merah di dalam kartu. Warna gradiennya meniru panel di belakangnya pada tinggi kartu.
const CARD_WINDOW =
  "absolute inset-x-[5.24cqw] top-[5.24cqw] bottom-[5.24cqw] rounded-[6.28cqw] bg-[linear-gradient(180deg,#B60404,#770202)] motion-safe:transition-[top] motion-safe:duration-200 group-aria-pressed:top-[24.27cqw] group-aria-pressed:bg-[linear-gradient(180deg,#A90303,#770202)] @max-[480px]/strip:rounded-[10.87cqw]";

// Setiap baris teks diposisikan di titik tengah vertikalnya (dari Figma), jadi ukuran minimum
// yang membesar tetap seimbang ke atas dan ke bawah.
const CARD_LINE =
  "absolute inset-x-0 -translate-y-1/2 overflow-hidden whitespace-nowrap text-center leading-none text-white";

function DayCard({
  day,
  selected,
  onClick,
  registerRef,
  canHover,
  reduceMotion,
}: {
  day: MatchDay;
  selected: boolean;
  onClick: () => void;
  registerRef: (element: HTMLButtonElement | null) => void;
  canHover: boolean;
  reduceMotion: boolean;
}) {
  const count = day.matches.length;

  return (
    <motion.button
      ref={registerRef}
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${formatMatchDay(day)}, ${count} laga`}
      whileHover={canHover && !selected && !reduceMotion ? { y: -2 } : undefined}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={`${CARD_SHELL} cursor-pointer ${FOCUS_RING}`}
    >
      <span aria-hidden="true" className={CARD_WINDOW} />

      <span
        aria-hidden="true"
        className={`${CARD_LINE} top-[16.17%] pl-[0.15em] font-drowner text-[max(13.97cqw,0.625rem)] tracking-[0.15em] motion-safe:transition-[top,color] motion-safe:duration-200 group-aria-pressed:top-[13%] group-aria-pressed:text-[#7E0202]`}
      >
        <span className="@max-[346px]/strip:hidden">{WEEKDAYS_ID[day.weekday]}</span>
        <span className="hidden @max-[346px]/strip:inline">{WEEKDAYS_ID_SHORT[day.weekday]}</span>
      </span>

      <span
        aria-hidden="true"
        className={`${CARD_LINE} top-[49.58%] pl-[0.26em] font-crosner text-[41.9cqw] tracking-[0.26em]`}
      >
        {String(day.day).padStart(2, "0")}
      </span>

      <span
        aria-hidden="true"
        className={`${CARD_LINE} top-[70.88%] pl-[0.26em] font-drowner text-[max(10.47cqw,0.5625rem)] tracking-[0.26em]`}
      >
        <span className="hidden @min-[717px]/strip:inline">{MONTHS_ID[day.month - 1]}</span>
        <span className="hidden @min-[432px]/strip:@max-[717px]/strip:inline">
          {MONTHS_ID_SHORT[day.month - 1]}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`${CARD_LINE} top-[83.94%] pl-[0.26em] font-drowner text-[max(9.08cqw,0.5625rem)] tracking-[0.26em] @max-[346px]/strip:pl-[0.08em] @max-[346px]/strip:tracking-[0.08em]`}
      >
        {count >= 10 ? (
          <>
            <span className="@max-[346px]/strip:hidden">{count} laga</span>
            <span className="hidden @max-[346px]/strip:inline">{count}</span>
          </>
        ) : (
          `${count} laga`
        )}
      </span>
    </motion.button>
  );
}

function SkeletonCard() {
  return (
    <span aria-hidden="true" className={`${CARD_SHELL} motion-safe:animate-pulse`}>
      <span className={CARD_WINDOW} />
    </span>
  );
}

/** Untuk browser tanpa container query (iOS < 16): deretan tombol biasa, tetap bisa dipilih. */
function FallbackDayList({ days, selectedKey, onSelect }: Pick<CalendarStripProps, "days" | "selectedKey" | "onSelect">) {
  return (
    <div role="group" aria-label="Pilih hari pertandingan" className="flex flex-wrap justify-center gap-2 py-2">
      {days.map((day) => (
        <button
          key={day.dateKey}
          type="button"
          onClick={() => onSelect(day.dateKey)}
          aria-pressed={day.dateKey === selectedKey}
          className={`rounded-md border-2 border-black bg-[#7E0202] px-3 py-2 font-drowner text-sm tracking-[0.08em] text-white aria-pressed:bg-[#F5EAA5] aria-pressed:text-[#7E0202] ${FOCUS_RING}`}
        >
          {WEEKDAYS_ID[day.weekday]} {day.day} {MONTHS_ID_SHORT[day.month - 1]} · {day.matches.length} laga
        </button>
      ))}
    </div>
  );
}

export function CalendarStrip({ days, selectedKey, onSelect, status, onRetry }: CalendarStripProps) {
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduceMotion = useReducedMotion() ?? false;

  const pageCount = Math.max(1, Math.ceil(days.length / DAYS_PER_PAGE));
  const selectedIndex = days.findIndex((day) => day.dateKey === selectedKey);
  // null = halaman mengikuti hari terpilih; angka = user sudah menggeser dengan panah.
  const [pagedTo, setPagedTo] = useState<number | null>(null);
  const followPage = selectedIndex >= 0 ? Math.floor(selectedIndex / DAYS_PER_PAGE) : 0;
  const page = Math.min(pagedTo ?? followPage, pageCount - 1);
  const visible = days.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE);

  // Pindah hari dengan keyboard bisa berganti halaman, jadi fokus dipindah setelah render.
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusAfterRender = useRef<string | null>(null);
  useEffect(() => {
    if (!focusAfterRender.current) return;
    cardRefs.current.get(focusAfterRender.current)?.focus();
    focusAfterRender.current = null;
  });

  const select = (dateKey: string) => {
    setPagedTo(null);
    onSelect(dateKey);
  };

  const onRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = selectedIndex + (event.key === "ArrowRight" ? 1 : -1);
    if (selectedIndex < 0 || next < 0 || next >= days.length) return;
    event.preventDefault();
    focusAfterRender.current = days[next].dateKey;
    select(days[next].dateKey);
  };

  const ready = status === "ready" && days.length > 0;
  const message =
    status === "error" ? "Jadwal gagal dimuat" : status === "ready" && days.length === 0 ? "Jadwal belum tersedia" : null;

  return (
    <div className="@container/strip w-full">
      {ready && (
        <div className="supports-[container-type:inline-size]:hidden">
          <FallbackDayList days={days} selectedKey={selectedKey} onSelect={select} />
        </div>
      )}

      <div className="hidden supports-[container-type:inline-size]:block">
        {ready && (
          <p className="mb-1 hidden text-center font-drowner text-xs tracking-[0.15em] text-[#7E0202] @max-[432px]/strip:block">
            {captionFor(visible)}
          </p>
        )}

        <div className="relative aspect-[978/243] w-full">
          <Image
            src="/svg/figma/calendar-frame.svg"
            alt=""
            fill
            priority
            className="pointer-events-none select-none"
          />

          <ArrowButton
            direction="prev"
            disabled={!ready || page === 0}
            onClick={() => setPagedTo(page - 1)}
          />
          <ArrowButton
            direction="next"
            disabled={!ready || page >= pageCount - 1}
            onClick={() => setPagedTo(page + 1)}
          />

          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center gap-[1.15cqw] @max-[480px]/strip:gap-[0.7cqw]">
              {Array.from({ length: DAYS_PER_PAGE }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
              <span className="sr-only">Memuat jadwal…</span>
            </div>
          )}

          {message && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.5cqw] font-drowner text-[max(2.5cqw,0.875rem)] tracking-[0.15em] text-white">
              <p role="status">{message}</p>
              {status === "error" && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`cursor-pointer rounded-md bg-[#F5EAA5] px-3 py-1 text-[#7E0202] ${FOCUS_RING}`}
                >
                  Coba lagi
                </button>
              )}
            </div>
          )}

          {ready && (
            <div
              role="group"
              aria-label="Pilih hari pertandingan"
              onKeyDown={onRowKeyDown}
              className="absolute inset-0 flex items-center justify-center gap-[1.15cqw] @max-[480px]/strip:gap-[0.7cqw]"
            >
              {visible.map((day) => (
                <DayCard
                  key={day.dateKey}
                  day={day}
                  selected={day.dateKey === selectedKey}
                  onClick={() => select(day.dateKey)}
                  registerRef={(element) => {
                    if (element) cardRefs.current.set(day.dateKey, element);
                    else cardRefs.current.delete(day.dateKey);
                  }}
                  canHover={canHover}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

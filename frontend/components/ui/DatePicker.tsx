"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { formatDateField } from "@/lib/datetime";
import { OutlinedField } from "./OutlinedField";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Geser tanggal "YYYY-MM-DD" sebanyak `days` hari (pakai UTC supaya tidak terpengaruh zona waktu). */
function shiftDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return toKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function shiftMonths(key: string, months: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return toKey(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, last));
}

function todayKey(): string {
  const now = new Date();
  return toKey(now.getFullYear(), now.getMonth(), now.getDate());
}

interface DatePickerProps {
  id: string;
  /** Dengan label: kotak bergaris (form). Tanpa label: kotak kecil (filter). */
  label?: string;
  /** "YYYY-MM-DD" atau "". */
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  /** Nama aksesibel untuk varian tanpa label. */
  ariaLabel?: string;
}

/**
 * Pilih tanggal lewat kalender (desain "Schedule Result [Create] part 3").
 * Keyboard: panah = geser hari/minggu, PageUp/PageDown = bulan, Enter =
 * pilih, Escape = tutup.
 */
export const DatePicker = ({ id, label, value, onChange, error, ariaLabel }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [focusKey, setFocusKey] = useState(value || todayKey());
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [year, month] = focusKey.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  // Fokus mengikuti tanggal yang sedang disorot.
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusKey}"]`)?.focus();
  }, [open, focusKey]);

  // Klik di luar menutup kalender.
  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const openCalendar = () => {
    setFocusKey(value || todayKey());
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const pick = (key: string) => {
    onChange(key);
    close();
  };

  const handleDayKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => shiftDays(focusKey, -1),
      ArrowRight: () => shiftDays(focusKey, 1),
      ArrowUp: () => shiftDays(focusKey, -7),
      ArrowDown: () => shiftDays(focusKey, 7),
      PageUp: () => shiftMonths(focusKey, -1),
      PageDown: () => shiftMonths(focusKey, 1),
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setFocusKey(move());
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  const display = value ? formatDateField(value) : "mm/dd/yyyy";

  const trigger = label ? (
    <OutlinedField
      label={label}
      htmlFor={id}
      error={error}
      trailing={<Calendar aria-hidden="true" className="h-5 w-5 shrink-0 text-[#1c1b1f]" />}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        className="w-full text-left text-base text-[#1c1b1f] outline-none"
      >
        {display}
      </button>
    </OutlinedField>
  ) : (
    <button
      ref={triggerRef}
      id={id}
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => (open ? setOpen(false) : openCalendar())}
      className="h-9 min-w-[164px] rounded-[6px] border border-[#79747e] bg-white px-4 text-center text-[15px] font-medium tracking-wide text-[#1c1b1f] outline-none focus-visible:ring-2 focus-visible:ring-[#2f9b9a]"
    >
      {display}
    </button>
  );

  return (
    <div ref={containerRef} className="relative">
      {trigger}
      {open && (
        <div
          role="dialog"
          aria-label={`Pilih tanggal, ${MONTHS[month - 1]} ${year}`}
          className="absolute left-0 top-full z-30 mt-2 w-[320px] rounded-[12px] bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[15px] font-semibold text-[#1c1b1f]">
              {MONTHS[month - 1]} {year}
              <ChevronRight aria-hidden="true" className="h-4 w-4 text-red-700" />
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Bulan sebelumnya"
                onClick={() => setFocusKey(shiftMonths(focusKey, -1))}
                className="rounded-full p-1.5 text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Bulan berikutnya"
                onClick={() => setFocusKey(shiftMonths(focusKey, 1))}
                className="rounded-full p-1.5 text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-600" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div ref={gridRef} className="grid grid-cols-7 gap-y-1 text-center">
            {Array.from({ length: firstWeekday }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const key = toKey(year, month - 1, i + 1);
              const selected = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  data-date={key}
                  tabIndex={key === focusKey ? 0 : -1}
                  aria-pressed={selected}
                  aria-label={`${i + 1} ${MONTHS[month - 1]} ${year}`}
                  onClick={() => pick(key)}
                  onKeyDown={handleDayKey}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-700 ${
                    selected ? "bg-[#e5322d] font-semibold text-white" : "text-[#1c1b1f] hover:bg-red-50"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

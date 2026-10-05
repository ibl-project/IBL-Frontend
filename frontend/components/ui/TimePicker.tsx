"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { OutlinedField } from "./OutlinedField";

interface TimePickerProps {
  id: string;
  label: string;
  /** "HH:MM" 24 jam, atau "". */
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

function toTwelveHour(value: string) {
  // Jam belum diisi ("") menghasilkan h = 0 dan m = undefined; keduanya harus dianggap kosong.
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return { hour: "", minute: "00", period: "PM" as const };
  const h = Number(match[1]);
  const m = Number(match[2]);
  return {
    hour: String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0"),
    minute: String(m).padStart(2, "0"),
    period: h >= 12 ? ("PM" as const) : ("AM" as const),
  };
}

/**
 * Pilih jam (desain "Select time": kotak Hour, kotak Minute, AM/PM,
 * Cancel/OK). Nilai disimpan 24 jam, ditampilkan "HH : MM".
 */
export const TimePicker = ({ id, label, value, onChange, error }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("PM");
  const [problem, setProblem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) hourRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const openPicker = () => {
    const current = toTwelveHour(value);
    setHour(current.hour);
    setMinute(current.minute);
    setPeriod(current.period);
    setProblem(null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const confirm = () => {
    const h = Number(hour);
    const m = Number(minute);
    if (!hour || h < 1 || h > 12) {
      setProblem("Jam harus 1–12");
      return;
    }
    if (minute === "" || m < 0 || m > 59) {
      setProblem("Menit harus 00–59");
      return;
    }
    const h24 = (h % 12) + (period === "PM" ? 12 : 0);
    onChange(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    close();
  };

  const handleKeys = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Enter") {
      event.preventDefault();
      confirm();
    }
  };

  const digits = (text: string) => text.replace(/[^0-9]/g, "").slice(0, 2);
  const display = value ? value.replace(":", " : ") : "xx : xx";

  return (
    <div ref={containerRef} className="relative">
      <OutlinedField
        label={label}
        htmlFor={id}
        error={error}
        trailing={<Clock aria-hidden="true" className="h-5 w-5 shrink-0 text-[#1c1b1f]" />}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="w-full text-left text-base text-[#1c1b1f] outline-none"
        >
          {display}
        </button>
      </OutlinedField>

      {open && (
        <div
          role="dialog"
          aria-label="Pilih jam"
          onKeyDown={handleKeys}
          className="absolute right-0 top-full z-30 mt-2 w-[328px] rounded-[28px] bg-white px-6 pb-4 pt-5 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        >
          <p className="mb-4 text-xs font-medium text-[#1c1b1f]">Select time</p>
          <div className="flex items-start gap-2">
            <label className="flex flex-col gap-1.5 text-xs text-[#1c1b1f]">
              <input
                ref={hourRef}
                type="text"
                inputMode="numeric"
                aria-label="Hour"
                value={hour}
                onChange={(event) => setHour(digits(event.target.value))}
                className="h-[72px] w-[88px] rounded-[8px] border-2 border-transparent bg-[#efe6e7] text-center text-[44px] leading-none text-[#1c1b1f] outline-none focus:border-[#7d2a3a] focus:bg-white"
              />
              Hour
            </label>
            <span aria-hidden="true" className="pt-3 text-[44px] leading-none text-[#1c1b1f]">
              :
            </span>
            <label className="flex flex-col gap-1.5 text-xs text-[#1c1b1f]">
              <input
                type="text"
                inputMode="numeric"
                aria-label="Minute"
                value={minute}
                onChange={(event) => setMinute(digits(event.target.value))}
                className="h-[72px] w-[88px] rounded-[8px] border-2 border-transparent bg-[#efe6e7] text-center text-[44px] leading-none text-[#1c1b1f] outline-none focus:border-[#7d2a3a] focus:bg-white"
              />
              Minute
            </label>
            <div role="group" aria-label="AM atau PM" className="ml-auto flex flex-col overflow-hidden rounded-[8px] border border-[#79747e]">
              {(["AM", "PM"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={period === option}
                  onClick={() => setPeriod(option)}
                  className={`h-9 w-[52px] text-sm font-medium outline-none first:border-b first:border-[#79747e] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7d2a3a] ${
                    period === option ? "bg-[#ffdcc4] text-[#2e1500]" : "bg-white text-[#1c1b1f]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <p aria-live="polite" className="mt-2 min-h-4 text-xs font-medium text-red-700">
            {problem}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <Clock aria-hidden="true" className="h-5 w-5 text-[#1c1b1f]" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-full px-3 py-2 text-sm font-medium text-[#7d2a3a] hover:bg-[#f5e9ea] focus-visible:outline-2 focus-visible:outline-[#7d2a3a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                className="rounded-full px-3 py-2 text-sm font-medium text-[#7d2a3a] hover:bg-[#f5e9ea] focus-visible:outline-2 focus-visible:outline-[#7d2a3a]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

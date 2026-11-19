"use client";

import React, { useRef, useState } from "react";

import { LOGO_ACCEPT, validateLogoFile } from "@/lib/teamsApi";

import { TeamLogo } from "./TeamLogo";

interface TeamLogoFieldProps {
  inputId: string;
  /** Logo yang sedang tampil: pratinjau file (blob:) atau logo tim. */
  previewSrc: string | null;
  /** Tombol "Hapus logo" hanya muncul kalau ada logo selain logo IBL. */
  canRemove: boolean;
  busy?: boolean;
  /** Pesan dari luar, mis. upload ditolak server. */
  error?: string | null;
  statusText?: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

/**
 * Pemilih logo tim: pratinjau + tombol pilih/hapus.
 *
 * Input file disembunyikan dengan opacity, bukan display:none: WebKit di iOS
 * menolak membuka pemilih file dari input yang tidak dirender (AGENTS.md).
 */
export const TeamLogoField = ({
  inputId,
  previewSrc,
  canRemove,
  busy = false,
  error,
  statusText,
  onSelect,
  onRemove,
}: TeamLogoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const message = validationError ?? error ?? null;
  const hintId = `${inputId}-hint`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset supaya memilih file yang sama lagi tetap memicu onChange.
    event.target.value = "";
    if (!file) return;

    const problem = validateLogoFile(file);
    setValidationError(problem);
    if (!problem) onSelect(file);
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold text-gray-700 uppercase">Logo Tim</span>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1.5">
          <div className="relative h-full w-full">
            <TeamLogo src={previewSrc} alt="Pratinjau logo tim" sizes="64px" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              aria-describedby={hintId}
              className="cursor-pointer rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {canRemove ? "Ganti Logo" : "Pilih Gambar"}
            </button>
            {canRemove && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setValidationError(null);
                  onRemove();
                }}
                className="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hapus Logo
              </button>
            )}
          </div>
          <p id={hintId} className="text-[11px] leading-snug text-gray-600">
            PNG, JPG, atau WebP, maks 5 MB. Diperkecil otomatis ke 512 px.
          </p>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={LOGO_ACCEPT}
          onChange={handleChange}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      </div>

      <div aria-live="polite" className="mt-1.5 min-h-4">
        {message ? (
          <p role="alert" className="text-xs font-medium text-red-700">
            {message}
          </p>
        ) : statusText ? (
          <p className="text-xs font-medium text-teal-800">{statusText}</p>
        ) : null}
      </div>
    </div>
  );
};

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
      <span className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Logo Tim</span>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1.5">
          <div className="relative w-full h-full">
            <TeamLogo src={previewSrc} alt="Pratinjau logo tim" sizes="64px" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              aria-describedby={hintId}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="px-3 py-2 rounded-full text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
          className="absolute pointer-events-none opacity-0 w-px h-px"
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

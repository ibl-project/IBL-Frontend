import React from "react";

interface OutlinedFieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  /** Ikon di kanan (cari, kalender, jam). */
  trailing?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Kotak input bergaris dengan label di garis atas, seperti field "Team 1",
 * "Tanggal", "Jam", dan "Tempat" di desain Schedule Result.
 */
export const OutlinedField = ({ label, htmlFor, error, trailing, className = "", children }: OutlinedFieldProps) => {
  return (
    <div className={className}>
      <div className="relative">
        <div
          className={`flex h-12 items-center gap-2 rounded-[4px] border bg-white px-4 transition-colors focus-within:border-[#2f9b9a] focus-within:ring-1 focus-within:ring-[#2f9b9a] ${
            error ? "border-red-700" : "border-[#79747e]"
          }`}
        >
          <div className="relative flex min-w-0 flex-1 items-center">{children}</div>
          {trailing}
        </div>
        <label
          htmlFor={htmlFor}
          className="pointer-events-none absolute -top-2.5 left-3 bg-white px-1 text-[13px] leading-5 text-[#313131]"
        >
          {label}
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

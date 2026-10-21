import React from "react";

import { assetUrl } from "@/lib/apiClient";
import type { ResultFile } from "@/lib/matchesApi";

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/**
 * Kotak "Detailed Result": nama & ukuran PDF (bisa diklik untuk mengunduh),
 * atau "Belum ada data".
 */
export const ResultFileCard = ({ file }: { file: ResultFile | null }) => {
  const box = "mx-auto flex h-[70px] w-full max-w-[282px] items-center rounded-[12px] border-2 border-[#d9b48f] bg-white";

  if (!file) {
    return (
      <div className={`${box} justify-center`}>
        <span className="text-sm text-[#202224]">Belum ada data</span>
      </div>
    );
  }

  return (
    <a
      href={assetUrl(file.url)}
      download={file.name}
      className={`${box} gap-4 px-5 transition-colors hover:bg-[#fbf6f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9b48f]`}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-8 shrink-0 items-end justify-center rounded-[4px] bg-[#e5322d] pb-1 text-[8px] font-bold text-white"
      >
        PDF
      </span>
      <span className="flex min-w-0 flex-col text-left">
        <span className="truncate text-sm text-[#202224]">{file.name}</span>
        <span className="text-xs text-gray-600">{formatBytes(file.byteSize)} - uploaded</span>
      </span>
    </a>
  );
};

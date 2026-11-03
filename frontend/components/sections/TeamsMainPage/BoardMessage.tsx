import React from "react";

import { ARTBOARD, TEAMS_COLORS, type ArtboardVariant } from "./teamsMainTheme";

interface BoardMessageProps {
  variant: ArtboardVariant;
  children: React.ReactNode;
  onRetry?: () => void;
}

/** Pesan di atas papan selama data dimuat, gagal, atau masih kosong. */
export function BoardMessage({ variant, children, onRetry }: BoardMessageProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-16 text-center font-bold"
      style={{ fontFamily: "var(--font-poppins)", fontSize: ARTBOARD[variant].message, color: TEAMS_COLORS.ink }}
    >
      <p>{children}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-full border-2 border-[#799BA7] px-5 py-1.5 uppercase transition-colors hover:bg-[#799BA7] hover:text-white"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

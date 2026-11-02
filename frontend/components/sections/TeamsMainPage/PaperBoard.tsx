import React from "react";

import { ARTBOARD, TEAMS_ASSETS, type ArtboardVariant } from "./teamsMainTheme";

interface PaperBoardProps {
  variant: ArtboardVariant;
  overlap: number;
  children: React.ReactNode;
}

/** Papan kayu miring dengan kertas di atasnya; konten mengalir di dalam dan papan ikut memanjang. */
export function PaperBoard({ variant, overlap, children }: PaperBoardProps) {
  const { width, board } = ARTBOARD[variant];

  return (
    <div className="relative" style={{ marginTop: -overlap, minHeight: board.minHeight, paddingBottom: board.paddingBottom }}>
      <div aria-hidden className="pointer-events-none absolute" style={{ inset: `0 -${width}px`, transform: "rotate(0.81deg)" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #F9E8BD 0%, #EDCEAA 100%)",
            boxShadow: "-12.36px 11.06px 6.77px rgba(0, 0, 0, 0.28)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16] mix-blend-multiply"
          style={{ backgroundImage: `url('${TEAMS_ASSETS.boardTexture}')`, backgroundSize: "280px auto" }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            top: board.paperInset,
            bottom: board.paperInset,
            background: "linear-gradient(226.86deg, #F8F8F8 40.12%, #B0A889 114.62%)",
            boxShadow: "-5.2px 5.2px 2.6px rgba(0, 0, 0, 0.25)",
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

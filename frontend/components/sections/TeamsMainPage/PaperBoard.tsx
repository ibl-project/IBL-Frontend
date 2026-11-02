import React from "react";

import { ARTBOARD, PAGE_BACKGROUND, TEAMS_ASSETS, type ArtboardVariant, type TeamsPage } from "./teamsMainTheme";
import { CheckerBand } from "./CheckerBand";
import { PaperCard } from "./PaperCard";

interface PaperBoardProps {
  variant: ArtboardVariant;
  page: TeamsPage;
  overlap: number;
  children: React.ReactNode;
}

/**
 * Papan dengan kertas di atasnya (grup Figma `paper-board`); konten mengalir di dalam dan papan ikut memanjang.
 * Papan berhenti di ujung komposisi Figma, jadi di layar lebar ujung kertas dan lipatannya terlihat.
 * Papan tidak dimiringkan: semua garis (navbar, checker, papan, kertas, konten) sejajar. Lihat PAGE_BACKGROUND.
 */
export function PaperBoard({ variant, page, overlap, children }: PaperBoardProps) {
  const { board, checker, width } = ARTBOARD[variant];
  const bg = PAGE_BACKGROUND[page][variant];
  const shadow = bg.board.shadowScale;

  return (
    <div className="relative" style={{ marginTop: -overlap, minHeight: board.minHeight, paddingBottom: board.paddingBottom }}>
      {/* Pita checker bawah, di belakang papan; di Figma sebagian tertutup papan dan footer. */}
      <CheckerBand
        tile={checker}
        centerX={width / 2}
        left={bg.board.left}
        width={bg.board.width}
        top={`calc(100% - ${bg.checkerBottom.aboveBoardBottom}px)`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0"
        style={{ left: bg.board.left, width: bg.board.width }}
      >
        {/* Papan (Vector 2577): gradasi Figma 180deg pada layer yang diputar -90 derajat = kiri ke kanan di layar. */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #F9E8BD 0%, #EDCEAA 100%)",
            boxShadow: `${-12.36 * shadow}px ${11.06 * shadow}px ${6.77 * shadow}px rgba(0, 0, 0, 0.28)`,
          }}
        >
          {/*
            Serat papan (image 2): opacity 60% di dalam mask berlayer 16%, jadi ~10% di layar.
            multiply + opacity pada gambar hitam-putih = titik hitam transparan dengan opacity yang sama.
          */}
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ opacity: 0.1, backgroundImage: `url('${TEAMS_ASSETS.grain}')`, backgroundSize: `${bg.grainWidth}px auto` }}
          />
        </div>
        <PaperCard
          left={bg.paper.left}
          width={bg.paper.width}
          top={bg.paper.top}
          bottom={bg.paper.bottom}
          shadowScale={shadow}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

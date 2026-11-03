"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

import { useArtboard } from "./useArtboard";
import {
  ARTBOARD,
  HALFTONE_ASPECT,
  PAGE_BACKGROUND,
  TEAMS_ASSETS,
  type ArtboardVariant,
  type TeamsPage,
} from "./teamsMainTheme";
import { CheckerBand } from "./CheckerBand";

interface TeamsArtboardProps {
  page: TeamsPage;
  children: (variant: ArtboardVariant) => React.ReactNode;
}

/**
 * Lapisan latar di belakang konten, dalam koordinat artboard (ikut diskalakan):
 * satu layer halftone (Figma `image 4`/`image 5`, 30%) dan pita checker atas. Pita bawah ada di PaperBoard
 * karena menempel ke tepi bawah papan.
 */
function TeamsBackdrop({ page, variant }: { page: TeamsPage; variant: ArtboardVariant }) {
  const bg = PAGE_BACKGROUND[page][variant];
  const { halftone } = bg;
  return (
    <>
      {/* multiply + opacity pada gambar hitam-putih = titik hitam transparan dengan opacity yang sama (Figma: normal 30%). */}
      <div
        aria-hidden
        className="pointer-events-none absolute mix-blend-multiply"
        style={{
          left: halftone.left,
          top: halftone.top,
          width: halftone.width,
          height: halftone.width * HALFTONE_ASPECT,
          opacity: 0.3,
          backgroundImage: `url('${TEAMS_ASSETS.halftone}')`,
          backgroundSize: "100% 100%",
        }}
      />
      {/* Pita checker adalah latar halaman: jauh lebih lebar dari layar mana pun (dipotong section), bukan selebar papan. */}
      <CheckerBand
        tile={ARTBOARD[variant].checker}
        centerX={ARTBOARD[variant].width / 2}
        left={-ARTBOARD[variant].width * 4}
        width={ARTBOARD[variant].width * 9}
        top={bg.checkerTop.top}
      />
    </>
  );
}

/** Latar putih selebar layar, ditambah artboard berukuran Figma yang diskalakan ke lebar kontainer. */
export function TeamsArtboard({ page, children }: TeamsArtboardProps) {
  const { ref, metrics } = useArtboard<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    // offsetHeight tidak terpengaruh transform, jadi ini tinggi dalam piksel desain.
    const update = () => setContentHeight(element.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [metrics?.variant]);

  const variant = metrics?.variant ?? "desktop";
  const scale = metrics?.scale ?? 1;
  const { width } = ARTBOARD[variant];

  // Tanpa min-h-screen: footer selalu tepat setelah baris checker bawah, tanpa celah putih.
  return (
    <section className="relative w-full overflow-hidden bg-white pt-[var(--navbar-height)]">
      <div ref={ref} className="relative w-full">
        <div
          className="relative mx-auto"
          style={{ width: width * scale, height: contentHeight * scale, visibility: metrics ? "visible" : "hidden" }}
        >
          <div ref={contentRef} className="relative flow-root" style={{ width, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <TeamsBackdrop page={page} variant={variant} />
            {children(variant)}
          </div>
        </div>
      </div>
    </section>
  );
}

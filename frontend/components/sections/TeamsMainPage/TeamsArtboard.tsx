"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

import { useArtboard } from "./useArtboard";
import { ARTBOARD, TEAMS_ASSETS, TEAMS_COLORS, type ArtboardVariant } from "./teamsMainTheme";

const CHECKER_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E" +
  "%3Crect width='1' height='1' fill='%237E0202'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%237E0202'/%3E%3C/svg%3E\")";

interface TeamsArtboardProps {
  children: (variant: ArtboardVariant) => React.ReactNode;
}

/** Latar halaman selebar layar, ditambah artboard berukuran Figma yang diskalakan ke lebar kontainer. */
export function TeamsArtboard({ children }: TeamsArtboardProps) {
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
  const { width, checker } = ARTBOARD[variant];

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden pt-[var(--navbar-height)]"
      style={{
        backgroundColor: TEAMS_COLORS.orange,
        backgroundImage: CHECKER_SVG,
        backgroundSize: `${checker * scale}px ${checker * scale}px`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
        style={{ backgroundImage: `url('${TEAMS_ASSETS.bgTexture}')` }}
      />
      <div ref={ref} className="relative w-full">
        <div
          className="relative mx-auto"
          style={{ width: width * scale, height: contentHeight * scale, visibility: metrics ? "visible" : "hidden" }}
        >
          <div ref={contentRef} style={{ width, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            {children(variant)}
          </div>
        </div>
      </div>
    </section>
  );
}

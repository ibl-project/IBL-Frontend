import React, { type CSSProperties } from "react";

/** Satu ulangan papan catur: dua kotak oranye diagonal di atas putih. */
const CHECKER_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E" +
  "%3Crect width='1' height='1' fill='%23EC5D12'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23EC5D12'/%3E%3C/svg%3E\")";

interface CheckerBandProps {
  /** Lebar satu ulangan (2 kotak), piksel desain. */
  tile: number;
  /** Titik (koordinat artboard) yang menjadi batas kotak: tengah artboard, supaya tepi kiri dan kanan layar simetris. */
  centerX: number;
  left: number;
  width: number;
  /** Posisi vertikal (top atau calc). */
  top: CSSProperties["top"];
}

/** Pita papan catur 3 baris, seperti dua pita di desain Figma (bukan pola seluruh halaman). */
export function CheckerBand({ tile, centerX, left, width, top }: CheckerBandProps) {
  // Geser pola supaya sebuah kotak berawal tepat di centerX, diukur dari tepi kiri pita.
  const phase = (((centerX - left) % tile) + tile) % tile;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        top,
        left,
        width,
        height: tile * 1.5,
        backgroundImage: CHECKER_SVG,
        backgroundSize: `${tile}px ${tile}px`,
        backgroundPosition: `${phase}px 0`,
      }}
    />
  );
}

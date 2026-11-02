import React, { type CSSProperties } from "react";

interface RibbonPlateProps {
  /** Kedalaman takik V di ujung kiri dan kanan, dalam piksel desain. */
  notchLeft: number;
  notchRight: number;
  border: number;
  borderColor: string;
  /** Latar isi pita (warna atau gradasi CSS). */
  background: string;
  /** Kelas posisi pembungkus; bawaan "relative". */
  className?: string;
  /** Posisi, ukuran, dan transform pita. */
  style?: CSSProperties;
  children?: React.ReactNode;
}

function ribbonShape(notchLeft: number, notchRight: number): string {
  return `polygon(0 0, 100% 0, calc(100% - ${notchRight}px) 50%, 100% 100%, 0 100%, ${notchLeft}px 50%)`;
}

/**
 * Plat pita dengan takik V di kedua ujung (judul "TEAMS" dan banner tim). Lebarnya boleh berubah:
 * bentuknya memakai clip-path, garis tepi dibuat dari lapisan luar berwarna tepi dan lapisan isi
 * yang menjorok sebesar tebal tepi.
 */
export function RibbonPlate({ notchLeft, notchRight, border, borderColor, background, className = "relative", style, children }: RibbonPlateProps) {
  return (
    <div
      className={className}
      style={{ ...style, filter: `drop-shadow(0 ${border}px ${border}px rgba(0, 0, 0, 0.25))` }}
    >
      <div aria-hidden className="absolute inset-0" style={{ background: borderColor, clipPath: ribbonShape(notchLeft, notchRight) }} />
      <div
        aria-hidden
        className="absolute"
        style={{ inset: border, background, clipPath: ribbonShape(notchLeft - border, notchRight - border) }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

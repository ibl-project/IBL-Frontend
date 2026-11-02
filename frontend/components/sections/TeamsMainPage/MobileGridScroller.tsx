import React, { type CSSProperties } from "react";

interface MobileGridScrollerProps {
  /** Tinggi area gulir, dalam piksel desain. */
  height: number;
  /** Jarak kiri area gulir (posisi scrollbar Figma), dalam piksel desain. */
  left: number;
  /** Lebar scrollbar. */
  trackWidth: number;
  /** Jarak atas/bawah track scrollbar di dalam area gulir. */
  trackMargin: number;
  children: React.ReactNode;
}

/**
 * Area gulir tinggi tetap dengan scrollbar di kiri, seperti frame mobile Figma.
 * `direction: rtl` memindahkan scrollbar bawaan ke kiri; isinya dikembalikan ke `ltr`.
 * Gaya scrollbar memakai ::-webkit-scrollbar (Chrome, Safari, Edge); Firefox memakai scrollbar bawaan.
 */
export function MobileGridScroller({ height, left, trackWidth, trackMargin, children }: MobileGridScrollerProps) {
  return (
    <div
      className={[
        "overflow-y-auto overscroll-contain [direction:rtl]",
        "[&::-webkit-scrollbar]:w-[var(--track-width)]",
        "[&::-webkit-scrollbar-track]:my-[var(--track-margin)] [&::-webkit-scrollbar-track]:rounded-[8px]",
        "[&::-webkit-scrollbar-track]:bg-[rgba(121,155,167,0.17)]",
        "[&::-webkit-scrollbar-thumb]:rounded-[8px] [&::-webkit-scrollbar-thumb]:bg-[#D9D9D9]",
      ].join(" ")}
      style={
        {
          height,
          marginLeft: left,
          marginRight: left,
          "--track-width": `${trackWidth}px`,
          "--track-margin": `${trackMargin}px`,
        } as CSSProperties
      }
    >
      <div className="[direction:ltr]">{children}</div>
    </div>
  );
}

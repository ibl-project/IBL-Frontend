"use client";

import React, { useId } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { popSpringVariants } from "@/lib/animations";
import { ARTBOARD, TEAMS_COLORS, type ArtboardVariant } from "./teamsMainTheme";

/** Judul "TEAMS" (huruf Hollywood Capital, SVG) di atas plat pita slate yang bertakik di kedua ujung. */
export function TeamsTitle({ variant }: { variant: ArtboardVariant }) {
  const title = ARTBOARD[variant].title;
  const gradientId = useId();
  const { plateW: w, plateH: h, plateNotch: notch, plateBorder: border } = title;
  const inset = border / 2;
  const points = [
    [inset, inset],
    [w - inset, inset],
    [w - notch, h / 2],
    [w - inset, h - inset],
    [inset, h - inset],
    [notch, h / 2],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={popSpringVariants}
      custom={0}
      className="relative z-10 mx-auto"
      style={{ marginTop: title.top, width: title.groupW, height: title.height }}
    >
      <svg
        aria-hidden
        className="absolute overflow-visible"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{
          left: title.plateLeft,
          top: title.plateTop,
          transform: `rotate(${title.plateTilt}deg)`,
          transformOrigin: "0 0",
          filter: `drop-shadow(0 ${border}px ${border}px rgba(0, 0, 0, 0.25))`,
        }}
      >
        <defs>
          {/* 282.45deg di CSS: gelap di kiri, terang di kanan. */}
          <linearGradient id={gradientId} x1="1" y1="0.4" x2="0" y2="0.6">
            <stop offset="0.442" stopColor="#799BA7" />
            <stop offset="0.8992" stopColor="#2F3C41" />
          </linearGradient>
        </defs>
        <polygon
          points={points}
          fill={`url(#${gradientId})`}
          stroke={TEAMS_COLORS.ivory}
          strokeWidth={border}
          strokeLinejoin="miter"
        />
      </svg>
      <h1 className="absolute inset-x-0 flex justify-center" style={{ top: title.artTop }}>
        <Image src="/svg/figma/teams-title.svg" alt="Teams" width={title.artW} height={title.artH} priority />
      </h1>
    </motion.div>
  );
}

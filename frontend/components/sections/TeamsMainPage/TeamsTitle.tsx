"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { popSpringVariants } from "@/lib/animations";
import { ARTBOARD, TEAMS_COLORS, type ArtboardVariant } from "./teamsMainTheme";
import { RibbonPlate } from "./RibbonPlate";

/** Judul "TEAMS" (huruf Hollywood Capital, SVG) di atas plat pita slate. */
export function TeamsTitle({ variant }: { variant: ArtboardVariant }) {
  const title = ARTBOARD[variant].title;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={popSpringVariants}
      custom={0}
      className="relative z-10 mx-auto"
      style={{ marginTop: title.top, width: title.groupW, height: title.height }}
    >
      <RibbonPlate
        notchLeft={title.plateNotchLeft}
        notchRight={title.plateNotchRight}
        border={title.plateBorder}
        borderColor={TEAMS_COLORS.ivory}
        background="linear-gradient(282.45deg, #799BA7 44.2%, #2F3C41 89.92%)"
        className="absolute"
        style={{
          left: title.plateLeft,
          top: title.plateTop,
          width: title.plateW,
          height: title.plateH,
          transform: `rotate(${title.plateTilt}deg)`,
          transformOrigin: "0 0",
        }}
      />
      <h1 className="absolute inset-x-0 flex justify-center" style={{ top: title.artTop }}>
        <Image src="/svg/figma/teams-title.svg" alt="Teams" width={title.artW} height={title.artH} priority />
      </h1>
    </motion.div>
  );
}

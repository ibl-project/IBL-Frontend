"use client";

import React from "react";
import { motion } from "framer-motion";

import { popSpringVariants } from "@/lib/animations";
import { ARTBOARD, TEAMS_COLORS, TEXT_FILLS, textShadow, type ArtboardVariant } from "./teamsMainTheme";
import { OutlinedText } from "./OutlinedText";

export function TeamsTitle({ variant }: { variant: ArtboardVariant }) {
  const title = ARTBOARD[variant].title;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={popSpringVariants}
      custom={0}
      className="relative z-10 flex items-center justify-center"
      style={{ marginTop: title.top, height: title.plateH }}
    >
      <div
        aria-hidden
        className="absolute"
        style={{
          width: title.plateW,
          height: title.plateH,
          transform: "rotate(-2.91deg)",
          background: "linear-gradient(282.45deg, #799BA7 44.2%, #2F3C41 89.92%)",
          border: `${title.plateBorder}px solid ${TEAMS_COLORS.ivory}`,
          boxShadow: `0 ${title.plateBorder}px ${title.plateBorder}px rgba(0, 0, 0, 0.25)`,
        }}
      />
      <OutlinedText
        as="h1"
        outline={title.stroke}
        outlineColor={TEAMS_COLORS.ivory}
        fill={TEXT_FILLS.teal}
        shadow={textShadow(title.shadow)}
        className="select-none text-center uppercase"
        style={{ fontFamily: "var(--font-hollywood)", fontSize: title.font, lineHeight: `${title.line}px`, letterSpacing: "-0.02em" }}
      >
        Teams
      </OutlinedText>
    </motion.div>
  );
}

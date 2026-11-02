import React from "react";

import { ARTBOARD, TEAMS_COLORS, goldTealText, type ArtboardVariant } from "./teamsMainTheme";

interface SectionBarProps {
  variant: ArtboardVariant;
  label: string;
  caption?: string;
}

export function SectionBar({ variant, label, caption }: SectionBarProps) {
  const bar = ARTBOARD[variant].bar;
  const showCaption = Boolean(caption) && bar.caption > 0;

  return (
    <div
      className="relative mx-auto"
      style={{
        marginTop: bar.offset,
        width: bar.width,
        height: bar.height,
        background: TEAMS_COLORS.teal,
        border: `${bar.border}px solid #000`,
        borderRadius: bar.radius,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #CB0404 -1.23%, #650202 98.77%)", borderRadius: bar.innerRadius }}
      />
      <h2
        className="absolute uppercase"
        style={{ left: bar.labelLeft, top: bar.labelTop, fontSize: bar.label, letterSpacing: "0.17em", ...goldTealText(bar.labelStroke) }}
      >
        {label}
      </h2>
      <div
        className="absolute flex items-center"
        style={{
          left: bar.stripLeft,
          top: bar.stripTop,
          width: bar.stripW,
          height: bar.stripH,
          borderRadius: bar.stripRadius,
          background: "linear-gradient(176.22deg, #F8F8F8 42.4%, #FFE27D 154.64%)",
          boxShadow: "inset 2.49px 3.32px 8.06px rgba(0, 0, 0, 0.35)",
        }}
      >
        {showCaption && (
          <p
            style={{
              paddingLeft: bar.captionLeft,
              fontFamily: "var(--font-drowner)",
              fontSize: bar.caption,
              letterSpacing: "0.15em",
              color: "#000",
            }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

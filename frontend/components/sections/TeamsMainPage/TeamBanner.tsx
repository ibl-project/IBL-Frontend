import React from "react";

import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import type { Team } from "@/lib/teamsApi";
import { ARTBOARD, TEAMS_COLORS, TEXT_FILLS, textShadow, type ArtboardVariant } from "./teamsMainTheme";
import { OutlinedText } from "./OutlinedText";

interface TeamBannerProps {
  team: Pick<Team, "name" | "logo">;
  variant: ArtboardVariant;
}

/** Logo tim yang menumpuk ujung kiri plat, dengan nama tim di dalam plat. */
export function TeamBanner({ team, variant }: TeamBannerProps) {
  const banner = ARTBOARD[variant].banner;
  const logoOverlap = banner.logoW / 3;

  return (
    <div className="relative z-10 flex items-center" style={{ marginTop: banner.top, marginLeft: banner.left, height: banner.logoH }}>
      <div className="relative z-10 shrink-0" style={{ width: banner.logoW, height: banner.logoH }}>
        <TeamLogo src={team.logo} alt={`Logo ${team.name}`} sizes={`${banner.logoW * 2}px`} />
      </div>
      <div
        className="relative flex items-center"
        style={{
          marginLeft: -logoOverlap,
          minWidth: banner.plateW,
          maxWidth: banner.nameMaxW,
          height: banner.plateH,
          paddingLeft: logoOverlap + banner.namePadX,
          paddingRight: banner.namePadX,
          background: "linear-gradient(280.37deg, #2F3C41 -19.97%, #799BA7 55.9%)",
          border: `${banner.plateBorder}px solid ${TEAMS_COLORS.ivory}`,
          boxShadow: `0 ${banner.plateBorder}px ${banner.plateBorder}px rgba(0, 0, 0, 0.25)`,
          transform: "matrix(1, -0.01, 0.02, 1, 0, 0)",
        }}
      >
        <OutlinedText
          as="h1"
          title={team.name}
          outline={banner.stroke}
          outlineColor={TEAMS_COLORS.ivory}
          fill={TEXT_FILLS.teal}
          shadow={textShadow(banner.shadow)}
          className="w-full min-w-0 text-center uppercase"
          textClassName="truncate"
          style={{ fontFamily: "var(--font-hollywood)", fontSize: banner.font, lineHeight: `${banner.line}px`, letterSpacing: "-0.02em" }}
        >
          {team.name}
        </OutlinedText>
      </div>
    </div>
  );
}

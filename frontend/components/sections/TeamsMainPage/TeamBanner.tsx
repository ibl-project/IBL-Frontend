import React from "react";

import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import type { Team } from "@/lib/teamsApi";
import { ARTBOARD, TEAMS_COLORS, TEXT_FILLS, textShadow, type ArtboardVariant } from "./teamsMainTheme";
import { OutlinedText } from "./OutlinedText";
import { RibbonPlate } from "./RibbonPlate";

interface TeamBannerProps {
  team: Pick<Team, "name" | "logo">;
  variant: ArtboardVariant;
}

/** Plat pita slate dengan logo tim berdiri di bagian kirinya dan nama tim rata kiri di sebelahnya. */
export function TeamBanner({ team, variant }: TeamBannerProps) {
  const banner = ARTBOARD[variant].banner;

  return (
    <div className="relative z-10" style={{ marginTop: banner.top, height: banner.logoH }}>
      <RibbonPlate
        notchLeft={banner.plateNotchLeft}
        notchRight={banner.plateNotchRight}
        border={banner.plateBorder}
        borderColor={TEAMS_COLORS.ivory}
        background="linear-gradient(280.37deg, #2F3C41 -19.97%, #799BA7 55.9%)"
        className="absolute"
        style={{
          left: banner.plateLeft,
          top: banner.plateTop,
          minWidth: banner.plateW,
          maxWidth: banner.nameMaxW,
          height: banner.plateH,
          transform: `rotate(${banner.plateTilt}deg)`,
          transformOrigin: "0 0",
        }}
      >
        <div
          className="flex h-full items-center"
          style={{ paddingLeft: banner.nameAreaLeft, paddingRight: banner.plateNotchRight + banner.namePadX }}
        >
          <OutlinedText
            as="h1"
            title={team.name}
            outline={banner.stroke}
            outlineColor={TEAMS_COLORS.ivory}
            fill={TEXT_FILLS.teal}
            shadow={textShadow(banner.shadow)}
            className="min-w-0 uppercase"
            textClassName="truncate"
            style={{ fontFamily: "var(--font-hollywood)", fontSize: banner.font, lineHeight: `${banner.line}px`, letterSpacing: "-0.02em" }}
          >
            {team.name}
          </OutlinedText>
        </div>
      </RibbonPlate>
      <div
        className="absolute z-10"
        style={{ left: banner.plateLeft + banner.logoInset, top: 0, width: banner.logoW, height: banner.logoH }}
      >
        <TeamLogo src={team.logo} alt={`Logo ${team.name}`} sizes={`${Math.ceil(banner.logoW * 2)}px`} />
      </div>
    </div>
  );
}

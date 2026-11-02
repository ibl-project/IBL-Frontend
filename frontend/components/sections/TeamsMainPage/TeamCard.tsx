import React from "react";
import Link from "next/link";

import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import type { Team } from "@/lib/teamsApi";
import { ARTBOARD, goldTealText, teamDetailHref, type ArtboardVariant } from "./teamsMainTheme";

interface TeamCardProps {
  team: Pick<Team, "id" | "name" | "logo">;
  variant: ArtboardVariant;
}

export function TeamCard({ team, variant }: TeamCardProps) {
  const grid = ARTBOARD[variant].grid;

  return (
    <Link
      href={teamDetailHref(team.id)}
      aria-label={`Lihat detail tim ${team.name}`}
      className="group flex flex-col items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#44D1D1]"
      style={{ width: grid.pitch }}
    >
      <div
        className="relative transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105"
        style={{ width: grid.logo, height: grid.logo }}
      >
        <div
          aria-hidden
          className="absolute -inset-[10%] rounded-full"
          style={{ background: "rgba(235, 223, 188, 0.7)", filter: `blur(${grid.logo / 4}px)` }}
        />
        <div className="absolute inset-0" style={{ filter: `drop-shadow(0 0 ${grid.logo / 3}px #FFFFFF)` }}>
          <TeamLogo src={team.logo} sizes={`${grid.logo * 2}px`} />
        </div>
      </div>
      <p
        title={team.name}
        className="line-clamp-2 w-full break-words text-center uppercase"
        style={{
          marginTop: grid.logoGap,
          fontSize: grid.name,
          lineHeight: `${grid.nameLine}px`,
          letterSpacing: "0.12em",
          ...goldTealText(1),
        }}
      >
        {team.name}
      </p>
    </Link>
  );
}

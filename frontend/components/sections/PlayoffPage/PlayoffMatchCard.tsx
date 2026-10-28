"use client";

import React from "react";
import Image from "next/image";
import { assetUrl } from "@/lib/apiClient";
import type { PlayoffMatch, PlayoffSlot } from "@/lib/standingsApi";
import type { PlayoffRound } from "@/lib/matchesApi";
import { DEFAULT_TEAM_LOGO } from "@/lib/teamsApi";

interface PlayoffMatchCardProps {
  round: PlayoffRound;
  position: number;
  slot?: PlayoffSlot | null;
  onEdit: (round: PlayoffRound, position: number, match: PlayoffMatch | null) => void;
  className?: string;
}

export const PlayoffMatchCard: React.FC<PlayoffMatchCardProps> = ({
  round,
  position,
  slot,
  onEdit,
  className = "",
}) => {
  const match = slot?.match ?? null;
  const team1 = match?.team1;
  const team2 = match?.team2;
  const hasStartedOrFinished = match?.status === "LIVE" || match?.status === "FINISHED";

  const renderTeamRow = (team?: typeof team1, defaultName = "TBD") => {
    const name = team?.name || defaultName;
    const rawLogo = team?.logo;
    const logoSrc = rawLogo ? assetUrl(rawLogo) : DEFAULT_TEAM_LOGO;
    const score = hasStartedOrFinished && typeof team?.score === "number" ? team.score : null;

    return (
      <div className="flex items-center justify-between gap-2 min-w-0 w-full py-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative size-5 shrink-0 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <Image
              src={logoSrc}
              alt={name}
              fill
              className="object-contain p-0.5"
              sizes="20px"
              unoptimized={logoSrc.startsWith("data:")}
            />
          </div>
          <span
            className="text-xs font-semibold text-slate-800 truncate"
            title={name}
          >
            {name}
          </span>
        </div>
        {score !== null && (
          <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
            {score}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`w-[160px] bg-white rounded-xl p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      <div className="flex flex-col items-center w-full">
        {renderTeamRow(team1, "Team 1")}
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider my-0.5">
          vs
        </div>
        {renderTeamRow(team2, "Team 2")}
      </div>

      <button
        type="button"
        onClick={() => onEdit(round, position, match)}
        className="mt-2 w-full h-7 rounded-lg bg-[#FF5A1F] hover:bg-[#E04D18] active:scale-[0.98] text-white text-xs font-medium tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-sm"
      >
        Edit
      </button>
    </div>
  );
};

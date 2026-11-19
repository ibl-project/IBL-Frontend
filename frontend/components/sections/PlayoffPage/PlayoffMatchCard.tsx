"use client";

import React from "react";

import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import { isLiveNow, type PlayoffRound } from "@/lib/matchesApi";
import type { PlayoffMatch, PlayoffSlot } from "@/lib/standingsApi";

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
  const hasStartedOrFinished = !!match && (isLiveNow(match) || match.status === "FINISHED");

  const renderTeamRow = (team?: typeof team1, defaultName = "TBD") => {
    const name = team?.name || defaultName;
    const score = hasStartedOrFinished && typeof team?.score === "number" ? team.score : null;

    return (
      <div className="flex w-full min-w-0 items-center justify-between gap-2 py-1">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative size-5 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <TeamLogo src={team?.logo} alt={name} sizes="20px" className="object-contain p-0.5" />
          </div>
          <span className="truncate text-xs font-semibold text-slate-800" title={name}>
            {name}
          </span>
        </div>
        {score !== null && <span className="shrink-0 text-xs font-bold text-slate-900 tabular-nums">{score}</span>}
      </div>
    );
  };

  return (
    <div
      className={`flex w-[160px] flex-col justify-between rounded-xl border border-slate-100 bg-white p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all hover:shadow-md ${className}`}
    >
      <div className="flex w-full flex-col items-center">
        {renderTeamRow(team1, "Team 1")}
        <div className="my-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">vs</div>
        {renderTeamRow(team2, "Team 2")}
      </div>

      <button
        type="button"
        onClick={() => onEdit(round, position, match)}
        className="mt-2 flex h-7 w-full cursor-pointer items-center justify-center rounded-lg bg-[#FF5A1F] text-xs font-medium tracking-wide text-white shadow-sm transition-all hover:bg-[#E04D18] active:scale-[0.98]"
      >
        Edit
      </button>
    </div>
  );
};

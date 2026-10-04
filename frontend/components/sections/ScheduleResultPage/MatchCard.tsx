import React from "react";

import { formatWib } from "@/lib/datetime";
import type { MatchListItem, MatchTeamSide } from "@/lib/matchesApi";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";

interface MatchCardProps {
  match: MatchListItem;
  /** Teks tombol oranye: "Detail" di Schedule Result, "Choose" di Scoring. */
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  /** Keterangan kecil di bawah tombol, mis. "Dipakai Scorekeeper 1". */
  note?: string | null;
}

const TeamBlock = ({ team }: { team: MatchTeamSide }) => {
  const name = team.name ?? team.placeholder ?? "TBD";
  return (
    <div className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
      <div className="relative h-10 w-10">
        <TeamLogo src={team.logo} sizes="40px" />
      </div>
      <span className="max-w-full truncate text-center text-base font-bold text-[#202224]" title={name}>
        {name}
      </span>
    </div>
  );
};

/** Kartu satu jadwal pertandingan (desain "Schedule Result [Display]"). */
export const MatchCard = ({ match, actionLabel, onAction, disabled = false, note }: MatchCardProps) => {
  const teams = `${match.team1.name ?? "TBD"} vs ${match.team2.name ?? "TBD"}`;
  return (
    <article
      aria-label={teams}
      className="flex items-center justify-between gap-2 rounded-[24px] bg-white px-4 py-7 shadow-[6px_6px_54px_rgba(0,0,0,0.05)] sm:px-6"
    >
      <TeamBlock team={match.team1} />

      <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
        <p className="w-full truncate text-sm text-[#202224]" title={match.venue ?? undefined}>
          {match.venue ?? "Tempat belum diatur"}
        </p>
        <p className="whitespace-nowrap text-sm font-medium text-red-700">{formatWib(match.scheduledAt)}</p>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          aria-label={`${actionLabel} ${teams}`}
          className="mt-1 min-w-[76px] rounded-full bg-[#f26722] px-5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#d8581a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26722] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {actionLabel}
        </button>
        {note && <p className="text-[11px] font-medium text-gray-600">{note}</p>}
      </div>

      <TeamBlock team={match.team2} />
    </article>
  );
};

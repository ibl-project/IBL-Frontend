import React from "react";

import { formatWib } from "@/lib/datetime";
import { type MatchListItem, type MatchTeamSide, stageLabel } from "@/lib/matchesApi";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";

interface MatchCardProps {
  match: MatchListItem;
  /** Teks tombol oranye: "Detail" di Schedule Result, "Score" di Scoring. */
  actionLabel: string;
  /** Ditambahkan ke label tombol untuk pembaca layar, mis. "Match 3". */
  actionContext?: string;
  onAction: () => void;
  disabled?: boolean;
  /** Baris kecil di atas label jenis, mis. "Match 3 · Berlangsung" di halaman Scoring. */
  meta?: React.ReactNode;
  /** Keterangan kecil di bawah tombol, mis. "Dipakai Scorekeeper 1". */
  note?: string | null;
  /** Tombol kecil di pojok kanan atas kartu, mis. sampah di halaman Scoring. */
  corner?: React.ReactNode;
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
export const MatchCard = ({
  match,
  actionLabel,
  actionContext,
  onAction,
  disabled = false,
  meta,
  note,
  corner,
}: MatchCardProps) => {
  const teams = `${match.team1.name ?? "TBD"} vs ${match.team2.name ?? "TBD"}`;
  return (
    <article
      aria-label={teams}
      className="relative flex items-center justify-between gap-2 rounded-[24px] bg-white px-4 py-7 shadow-[6px_6px_54px_rgba(0,0,0,0.05)] sm:px-6"
    >
      {corner && <div className="absolute top-3 right-3">{corner}</div>}
      <TeamBlock team={match.team1} />

      <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
        {meta}
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
            match.stage === "PLAYOFF"
              ? "border border-amber-200 bg-amber-50 text-amber-700"
              : "border border-teal-200 bg-teal-50 text-teal-700"
          }`}
        >
          {stageLabel(match)}
        </span>
        <p className="w-full truncate text-sm text-[#202224]" title={match.venue ?? undefined}>
          {match.venue ?? "Tempat belum diatur"}
        </p>
        <p className="whitespace-nowrap text-sm font-medium text-red-700">{formatWib(match.scheduledAt)}</p>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          aria-label={`${actionLabel} ${actionContext ? `${actionContext}, ` : ""}${teams}`}
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

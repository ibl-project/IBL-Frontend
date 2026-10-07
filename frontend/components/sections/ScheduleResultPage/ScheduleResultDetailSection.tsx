"use client";

import React, { useCallback, useState } from "react";

import { formatWib } from "@/lib/datetime";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import {
  type MatchSide,
  type MatchSnapshot,
  REGULATION_QUARTERS,
  deleteSchedule,
  getMatch,
  periodColumnLabel,
  stageLabel,
} from "@/lib/matchesApi";
import { errorMessage } from "@/lib/teamsApi";
import { Modal } from "@/components/ui/Modal";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import { ResultFileCard } from "./ResultFileCard";

interface ScheduleResultDetailSectionProps {
  matchId: string | null;
  canEdit: boolean;
  onClose: () => void;
  onEdit: (matchId: string) => void;
  onDeleted: (message: string) => void;
}

const ratio = (made: number, attempted: number, percentage: number) =>
  `${made}/${attempted} (${Number.isInteger(percentage) ? percentage : percentage.toFixed(1)}%)`;

const SUMMARY_ROWS: Array<{ label: string; value: (side: MatchSide) => string }> = [
  {
    label: "Field Goals",
    value: ({ summary: s }) => ratio(s.fieldGoalsMade, s.fieldGoalsAttempted, s.fieldGoalPercentage),
  },
  { label: "2 Points", value: ({ summary: s }) => ratio(s.twoPointMade, s.twoPointAttempted, s.twoPointPercentage) },
  {
    label: "3 Points",
    value: ({ summary: s }) => ratio(s.threePointMade, s.threePointAttempted, s.threePointPercentage),
  },
  {
    label: "Free Throws",
    value: ({ summary: s }) => ratio(s.freeThrowsMade, s.freeThrowsAttempted, s.freeThrowPercentage),
  },
  { label: "Rebounds (O/D)", value: ({ summary: s }) => `${s.reboundOff}/${s.reboundDef}` },
  { label: "Assist", value: ({ summary: s }) => String(s.assist) },
];

const cell = "border border-gray-400 px-2 py-1.5";

const DetailBody = ({ match }: { match: MatchSnapshot }) => {
  const name1 = match.team1.name ?? "Team 1";
  const name2 = match.team2.name ?? "Team 2";
  const started = match.status !== "SCHEDULED";
  // Kolom OT (jumlah semua overtime) hanya muncul kalau match ini punya OT.
  const periodCount = Math.max(REGULATION_QUARTERS, match.team1.quarterScores.length, match.team2.quarterScores.length);
  const overtimes = periodCount - REGULATION_QUARTERS;
  const quarterCell = (side: MatchSide, quarter: number) => (started ? (side.quarterScores[quarter - 1] ?? 0) : "-");
  const overtimeCell = (side: MatchSide) =>
    started ? side.quarterScores.slice(REGULATION_QUARTERS).reduce((sum, points) => sum + points, 0) : "-";

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        {[match.team1, null, match.team2].map((side, index) =>
          side ? (
            <div key={index} className="flex w-24 shrink-0 flex-col items-center gap-2">
              <div className="relative h-10 w-10">
                <TeamLogo src={side.logo} sizes="40px" />
              </div>
              <span className="max-w-full truncate text-center text-base font-bold text-[#202224]">{side.name}</span>
            </div>
          ) : (
            <div key="center" className="flex min-w-0 flex-1 flex-col items-center gap-1 pt-2 text-center">
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                  match.stage === "PLAYOFF"
                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                    : "border border-teal-200 bg-teal-50 text-teal-700"
                }`}
              >
                {stageLabel(match)}
              </span>
              <p className="text-sm text-[#202224]">{match.venue ?? "Tempat belum diatur"}</p>
              <p className="text-sm font-medium text-red-700">{formatWib(match.scheduledAt)}</p>
            </div>
          ),
        )}
      </div>

      <section aria-labelledby="detail-result" className="mt-4 flex flex-col items-center gap-1.5">
        <h3 id="detail-result" className="text-[15px] font-medium text-[#f99f1b]">
          Result
        </h3>
        <table
          className={`w-full table-fixed border-collapse font-mono text-xs font-bold text-[#202224] ${
            overtimes > 0 ? "max-w-[340px]" : "max-w-[300px]"
          }`}
        >
          <thead>
            <tr>
              <th scope="col" className={`${cell} w-[84px] text-left`}>
                Team
              </th>
              {[1, 2, 3, 4].map((quarter) => (
                <th key={quarter} scope="col" className={`${cell} text-center`}>
                  {periodColumnLabel(quarter)}
                </th>
              ))}
              {overtimes > 0 && (
                <th scope="col" className={`${cell} text-center`} title={`${overtimes} kali overtime`}>
                  OT
                </th>
              )}
              <th scope="col" className={`${cell} w-[52px] text-center`}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {[match.team1, match.team2].map((side, index) => (
              <tr key={index}>
                <th scope="row" className={`${cell} truncate text-left`} title={side.name ?? undefined}>
                  {side.name}
                </th>
                {[1, 2, 3, 4].map((quarter) => (
                  <td key={quarter} className={`${cell} text-center`}>
                    {quarterCell(side, quarter)}
                  </td>
                ))}
                {overtimes > 0 && <td className={`${cell} text-center`}>{overtimeCell(side)}</td>}
                <td className={`${cell} text-center`}>{started ? side.score : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="detail-summary" className="mt-6 flex flex-col items-center gap-1.5">
        <h3 id="detail-summary" className="text-[15px] font-medium text-[#f99f1b]">
          Summary
        </h3>
        <table className="border-collapse text-center font-mono text-[11px] text-[#202224] [&_td]:whitespace-nowrap">
          <thead>
            <tr className="font-bold">
              <th scope="col" className={cell}>
                {name1}
              </th>
              <th scope="col" className={cell}>
                <span className="sr-only">Statistik</span>
              </th>
              <th scope="col" className={cell}>
                {name2}
              </th>
            </tr>
          </thead>
          <tbody>
            {SUMMARY_ROWS.map((row) => (
              <tr key={row.label}>
                <td className={cell}>{row.value(match.team1)}</td>
                <th scope="row" className={`${cell} font-bold whitespace-nowrap`}>
                  {row.label}
                </th>
                <td className={cell}>{row.value(match.team2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="detail-file" className="mt-6 flex flex-col gap-1.5">
        <h3 id="detail-file" className="text-center text-[15px] font-medium text-[#f99f1b]">
          Detailed Result
        </h3>
        <ResultFileCard file={match.resultFile} />
      </section>
    </>
  );
};

/** Modal "Detail" satu jadwal (desain "Schedule Result [Detail]" / "[Filled]"). */
export const ScheduleResultDetailSection = ({
  matchId,
  canEdit,
  onClose,
  onEdit,
  onDeleted,
}: ScheduleResultDetailSectionProps) => {
  return (
    <Modal open={matchId !== null} onClose={onClose} labelledBy="schedule-detail-title" className="max-w-[518px]">
      {matchId && (
        <DetailContent matchId={matchId} canEdit={canEdit} onClose={onClose} onEdit={onEdit} onDeleted={onDeleted} />
      )}
    </Modal>
  );
};

const DetailContent = ({
  matchId,
  canEdit,
  onClose,
  onEdit,
  onDeleted,
}: Omit<ScheduleResultDetailSectionProps, "matchId"> & { matchId: string }) => {
  const load = useCallback(() => getMatch(matchId), [matchId]);
  const { state, reload } = useAsyncData(load);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const match = state.status === "ready" ? state.data : null;
  const deletable = match?.status === "SCHEDULED";

  const handleDelete = async () => {
    if (!match) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSchedule(match.id);
      setConfirming(false);
      onDeleted(`Jadwal ${match.team1.name} vs ${match.team2.name} dihapus.`);
    } catch (error) {
      setDeleteError(errorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[24px] bg-white px-6 py-6 sm:px-8">
      <h2 id="schedule-detail-title" className="sr-only">
        Detail jadwal {match ? `${match.team1.name} vs ${match.team2.name}` : ""}
      </h2>

      {state.status === "loading" && (
        <p role="status" className="py-16 text-center text-sm text-gray-600">
          Memuat detail pertandingan...
        </p>
      )}
      {state.status === "error" && (
        <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm font-medium text-red-700">Detail gagal dimuat: {state.message}</p>
          <button
            type="button"
            onClick={reload}
            className="rounded-full bg-[#2f9b9a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#257f7e]"
          >
            Coba Lagi
          </button>
        </div>
      )}
      {match && <DetailBody match={match} />}

      {deleteError && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
          {deleteError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {canEdit && match && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={!deletable}
              title={
                deletable ? undefined : "Match yang sudah dimulai dikosongkan dulu lewat Hapus match di halaman Scoring (admin)"
              }
              className="h-9 min-w-[76px] rounded-full bg-[#7a0000] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#5c0000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a0000] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-9 min-w-[76px] rounded-full bg-[#2f9b9a] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#257f7e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9b9a]"
          >
            Back
          </button>
        </div>
        {canEdit && match && (
          <button
            type="button"
            onClick={() => onEdit(match.id)}
            className="h-9 rounded-full bg-[#f99f1b] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#d98b16] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f99f1b]"
          >
            Edit Result
          </button>
        )}
      </div>

      <Modal open={confirming} onClose={() => setConfirming(false)} labelledBy="schedule-delete-title" className="max-w-sm">
        <div className="rounded-3xl bg-white p-6 text-center">
          <h3 id="schedule-delete-title" className="text-lg font-bold text-gray-900">
            Hapus jadwal ini?
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {match?.team1.name} vs {match?.team2.name} akan dihapus dari Schedule Result.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="flex-1 rounded-full bg-gray-100 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-full bg-red-700 py-2.5 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-70"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

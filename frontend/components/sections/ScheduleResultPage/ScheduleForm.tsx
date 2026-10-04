"use client";

import React, { useCallback, useMemo, useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { fromWibFields, toWibFields } from "@/lib/datetime";
import {
  type CreateScheduleInput,
  type MatchListItem,
  PLAYOFF_ROUNDS,
  PLAYOFF_ROUND_LABEL,
  type PlayoffRound,
} from "@/lib/matchesApi";
import { errorMessage, type Team } from "@/lib/teamsApi";
import { DatePicker } from "@/components/ui/DatePicker";
import { OutlinedField } from "@/components/ui/OutlinedField";
import { TeamCombobox, type TeamOption } from "@/components/ui/TeamCombobox";
import { TimePicker } from "@/components/ui/TimePicker";

type FieldErrors = Partial<Record<"team1" | "team2" | "stage" | "playoffRound" | "date" | "time" | "venue", string>>;

interface ScheduleFormProps {
  /** Prefix id elemen supaya dua form tidak bentrok. */
  idPrefix: string;
  teams: Team[];
  /** Data lama untuk form Edit. */
  initial?: MatchListItem | null;
  /** Tim tidak bisa diganti setelah scoring dimulai. */
  teamsLocked?: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (input: CreateScheduleInput) => Promise<void>;
  /** Isi tambahan di bawah field (mis. upload PDF di form Edit). */
  extra?: React.ReactNode;
}

/**
 * Field Jenis Pertandingan, Babak, Team 1 vs Team 2, Tanggal, Jam, dan Tempat.
 * - Fase grup: kedua tim wajib satu grup.
 * - Playoff: bebas mempertemukan tim dari grup mana saja per babak.
 */
export const ScheduleForm = ({
  idPrefix,
  teams,
  initial,
  teamsLocked = false,
  submitLabel,
  onCancel,
  onSubmit,
  extra,
}: ScheduleFormProps) => {
  const isEdit = initial !== undefined && initial !== null;
  const start = toWibFields(initial?.scheduledAt ?? null);
  const [stage, setStage] = useState<"GROUP" | "PLAYOFF">(initial?.stage === "PLAYOFF" ? "PLAYOFF" : "GROUP");
  const [playoffRound, setPlayoffRound] = useState<PlayoffRound>(initial?.playoffRound ?? "ROUND_OF_16");
  const [team1Id, setTeam1Id] = useState<string | null>(initial?.team1.id ?? null);
  const [team2Id, setTeam2Id] = useState<string | null>(initial?.team2.id ?? null);
  const [date, setDate] = useState(start.date);
  const [time, setTime] = useState(start.time);
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => teams.filter((team) => team.groupId), [teams]);
  const groupOf = useCallback(
    (id: string | null) => teams.find((team) => team.id === id)?.groupId ?? null,
    [teams],
  );
  const toOption = (team: Team): TeamOption => ({ id: team.id, name: team.name, group: team.group });

  const team1Options = useMemo(() => {
    if (stage === "PLAYOFF") {
      return teams.filter((team) => team.id !== team2Id).map(toOption);
    }
    return grouped
      .filter((team) => team.id !== team2Id && (!team2Id || team.groupId === groupOf(team2Id)))
      .map(toOption);
  }, [stage, teams, grouped, team2Id, groupOf]);

  const team2Options = useMemo(() => {
    if (stage === "PLAYOFF") {
      return teams.filter((team) => team.id !== team1Id).map(toOption);
    }
    return grouped
      .filter((team) => team.id !== team1Id && (!team1Id || team.groupId === groupOf(team1Id)))
      .map(toOption);
  }, [stage, teams, grouped, team1Id, groupOf]);

  const clear = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleStageChange = (newStage: "GROUP" | "PLAYOFF") => {
    if (newStage === stage || isEdit) return;
    setStage(newStage);
    clear("stage");
    clear("playoffRound");
    if (newStage === "GROUP") {
      if (team1Id && team2Id) {
        const g1 = groupOf(team1Id);
        const g2 = groupOf(team2Id);
        if (!g1 || !g2 || g1 !== g2) {
          setTeam2Id(null);
        }
      } else if (team1Id && !groupOf(team1Id)) {
        setTeam1Id(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!team1Id) next.team1 = "Pilih Team 1";
    if (!team2Id) next.team2 = "Pilih Team 2";
    if (stage === "PLAYOFF" && !playoffRound) next.playoffRound = "Pilih babak playoff";
    if (!date) next.date = "Pilih tanggal";
    if (!time) next.time = "Pilih jam";
    if (!venue.trim()) next.venue = "Isi tempat pertandingan";
    setErrors(next);
    if (Object.keys(next).length > 0 || !team1Id || !team2Id) return;

    setSaving(true);
    setFormError(null);
    try {
      await onSubmit({
        team1Id,
        team2Id,
        scheduledAt: fromWibFields(date, time),
        venue: venue.trim(),
        stage,
        ...(stage === "PLAYOFF" ? { playoffRound } : {}),
      });
    } catch (error) {
      const details = error instanceof ApiError ? error.details : undefined;
      if (details?.team2Id || details?.team1Id || details?.playoffRound) {
        setErrors({
          team1: details.team1Id,
          team2: details.team2Id,
          playoffRound: details.playoffRound,
        });
        setFormError(error instanceof ApiError ? error.message : null);
      } else {
        setFormError(errorMessage(error));
      }
      setSaving(false);
    }
  };

  const ungrouped = teams.length - grouped.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
      {/* Pilihan Jenis Pertandingan */}
      {!isEdit ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Jenis Pertandingan
          </span>
          <div className="inline-flex w-full rounded-xl bg-gray-100 p-1 sm:w-auto sm:self-start">
            <button
              type="button"
              onClick={() => handleStageChange("GROUP")}
              className={`flex-1 rounded-lg px-5 py-2 text-xs font-semibold transition-all sm:flex-initial ${
                stage === "GROUP"
                  ? "bg-[#2f9b9a] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Fase Grup
            </button>
            <button
              type="button"
              onClick={() => handleStageChange("PLAYOFF")}
              className={`flex-1 rounded-lg px-5 py-2 text-xs font-semibold transition-all sm:flex-initial ${
                stage === "PLAYOFF"
                  ? "bg-[#2f9b9a] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Playoff (Lintas Grup)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">Jenis:</span>
          <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 text-xs font-medium text-teal-800">
            {stage === "PLAYOFF" ? (playoffRound ? PLAYOFF_ROUND_LABEL[playoffRound] : "Playoff") : "Fase Grup"}
          </span>
          <span className="text-[11px] text-gray-500">(Jenis pertandingan tidak dapat diubah)</span>
        </div>
      )}

      {/* Pilihan Babak (Khusus Playoff) */}
      {stage === "PLAYOFF" && (
        <OutlinedField
          label="Babak Playoff"
          htmlFor={`${idPrefix}-playoff-round`}
          error={errors.playoffRound}
          className="sm:max-w-md"
        >
          <select
            id={`${idPrefix}-playoff-round`}
            value={playoffRound}
            disabled={isEdit}
            onChange={(event) => {
              setPlayoffRound(event.target.value as PlayoffRound);
              clear("playoffRound");
            }}
            className="w-full cursor-pointer bg-transparent text-sm text-[#1c1b1f] outline-none disabled:cursor-not-allowed"
          >
            {PLAYOFF_ROUNDS.map((round) => (
              <option key={round} value={round}>
                {PLAYOFF_ROUND_LABEL[round]}
              </option>
            ))}
          </select>
        </OutlinedField>
      )}

      <div className="grid grid-cols-1 items-start gap-x-6 gap-y-7 sm:grid-cols-[1fr_auto_1fr]">
        <TeamCombobox
          id={`${idPrefix}-team1`}
          label="Team 1"
          options={team1Options}
          value={team1Id}
          onChange={(id) => {
            setTeam1Id(id);
            clear("team1");
          }}
          disabled={teamsLocked}
          error={errors.team1}
        />
        <span aria-hidden="true" className="hidden pt-2 text-[26px] font-extrabold text-[#202224] sm:block">
          vs
        </span>
        <TeamCombobox
          id={`${idPrefix}-team2`}
          label="Team 2"
          options={team2Options}
          value={team2Id}
          onChange={(id) => {
            setTeam2Id(id);
            clear("team2");
          }}
          disabled={teamsLocked}
          error={errors.team2}
          emptyText={stage === "PLAYOFF" ? "Tidak ada tim lain" : "Tidak ada tim lain di grup yang sama"}
        />

        <DatePicker
          id={`${idPrefix}-date`}
          label="Tanggal"
          value={date}
          onChange={(value) => {
            setDate(value);
            clear("date");
          }}
          error={errors.date}
        />
        <span className="hidden sm:block" />
        <TimePicker
          id={`${idPrefix}-time`}
          label="Jam"
          value={time}
          onChange={(value) => {
            setTime(value);
            clear("time");
          }}
          error={errors.time}
        />

        <OutlinedField
          label="Tempat"
          htmlFor={`${idPrefix}-venue`}
          error={errors.venue}
          className="sm:col-span-3"
        >
          <input
            id={`${idPrefix}-venue`}
            type="text"
            value={venue}
            maxLength={200}
            placeholder="Lapangan Basket"
            onChange={(event) => {
              setVenue(event.target.value);
              clear("venue");
            }}
            className="w-full bg-transparent text-base text-[#1c1b1f] outline-none placeholder:text-gray-600"
          />
        </OutlinedField>
      </div>

      {teamsLocked && (
        <p className="-mt-3 text-xs text-gray-600">Tim tidak bisa diganti karena scoring pertandingan ini sudah dimulai.</p>
      )}
      {!teamsLocked && stage === "GROUP" && ungrouped > 0 && (
        <p className="-mt-3 text-xs text-gray-600">
          {ungrouped} tim belum masuk grup sehingga tidak muncul di pilihan fase grup. Atur grupnya di halaman Teams, atau pilih jenis Playoff.
        </p>
      )}
      {!teamsLocked && stage === "PLAYOFF" && (
        <p className="-mt-3 text-xs text-gray-600">
          Pertandingan playoff mempertemukan tim dari grup mana saja. Setiap tim hanya dapat bertanding 1 kali di babak yang sama.
        </p>
      )}

      {extra}

      {formError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-9 min-w-[77px] rounded-full bg-[#f26722] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#d8581a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26722] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-9 min-w-[77px] rounded-full bg-[#f99f1b] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#d98b16] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f99f1b] disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

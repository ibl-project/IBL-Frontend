"use client";

import React, { useMemo, useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { fromWibFields, toWibFields } from "@/lib/datetime";
import type { MatchListItem, ScheduleInput } from "@/lib/matchesApi";
import { errorMessage, type Team } from "@/lib/teamsApi";
import { DatePicker } from "@/components/ui/DatePicker";
import { OutlinedField } from "@/components/ui/OutlinedField";
import { TeamCombobox, type TeamOption } from "@/components/ui/TeamCombobox";
import { TimePicker } from "@/components/ui/TimePicker";

type FieldErrors = Partial<Record<"team1" | "team2" | "date" | "time" | "venue", string>>;

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
  onSubmit: (input: ScheduleInput) => Promise<void>;
  /** Isi tambahan di bawah field (mis. upload PDF di form Edit). */
  extra?: React.ReactNode;
}

/**
 * Field Team 1 vs Team 2, Tanggal, Jam, dan Tempat (desain "Schedule Result
 * [Create]"). Jadwal hanya untuk fase grup, jadi pilihan tim lawan dibatasi
 * ke grup yang sama.
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
  const start = toWibFields(initial?.scheduledAt ?? null);
  const [team1Id, setTeam1Id] = useState<string | null>(initial?.team1.id ?? null);
  const [team2Id, setTeam2Id] = useState<string | null>(initial?.team2.id ?? null);
  const [date, setDate] = useState(start.date);
  const [time, setTime] = useState(start.time);
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => teams.filter((team) => team.groupId), [teams]);
  const groupOf = (id: string | null) => teams.find((team) => team.id === id)?.groupId ?? null;
  const toOption = (team: Team): TeamOption => ({ id: team.id, name: team.name, group: team.group });

  const team1Options = grouped
    .filter((team) => team.id !== team2Id && (!team2Id || team.groupId === groupOf(team2Id)))
    .map(toOption);
  const team2Options = grouped
    .filter((team) => team.id !== team1Id && (!team1Id || team.groupId === groupOf(team1Id)))
    .map(toOption);

  const clear = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!team1Id) next.team1 = "Pilih Team 1";
    if (!team2Id) next.team2 = "Pilih Team 2";
    if (!date) next.date = "Pilih tanggal";
    if (!time) next.time = "Pilih jam";
    if (!venue.trim()) next.venue = "Isi tempat pertandingan";
    setErrors(next);
    if (Object.keys(next).length > 0 || !team1Id || !team2Id) return;

    setSaving(true);
    setFormError(null);
    try {
      await onSubmit({ team1Id, team2Id, scheduledAt: fromWibFields(date, time), venue: venue.trim() });
    } catch (error) {
      const details = error instanceof ApiError ? error.details : undefined;
      if (details?.team2Id || details?.team1Id) {
        setErrors({ team1: details.team1Id, team2: details.team2Id });
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
          emptyText="Tidak ada tim lain di grup yang sama"
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
      {!teamsLocked && ungrouped > 0 && (
        <p className="-mt-3 text-xs text-gray-600">
          {ungrouped} tim belum masuk grup sehingga tidak muncul di pilihan. Atur grupnya di halaman Teams.
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

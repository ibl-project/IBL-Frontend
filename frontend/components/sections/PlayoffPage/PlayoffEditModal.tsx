"use client";

import React, { useId, useMemo, useState } from "react";
import { createSchedule, updateSchedule, type PlayoffRound } from "@/lib/matchesApi";
import type { PlayoffMatch } from "@/lib/standingsApi";
import type { Team } from "@/lib/teamsApi";
import { Modal } from "@/components/ui/Modal";
import { TeamCombobox, type TeamOption } from "@/components/ui/TeamCombobox";
import { OutlinedField } from "@/components/ui/OutlinedField";

interface PlayoffEditModalProps {
  open: boolean;
  round: PlayoffRound;
  position: number;
  match: PlayoffMatch | null;
  teams: Team[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

export const PlayoffEditModal: React.FC<PlayoffEditModalProps> = ({
  open,
  round,
  position,
  match,
  teams,
  onClose,
  onSaved,
}) => {
  const titleId = useId();

  const [team1Id, setTeam1Id] = useState<string | null>(match?.team1.id ?? null);
  const [team2Id, setTeam2Id] = useState<string | null>(match?.team2.id ?? null);
  const [score1, setScore1] = useState<string>(
    typeof match?.team1.score === "number" ? String(match.team1.score) : ""
  );
  const [score2, setScore2] = useState<string>(
    typeof match?.team2.score === "number" ? String(match.team2.score) : ""
  );
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Teams options
  const toOption = (team: Team): TeamOption => ({
    id: team.id,
    name: team.name,
    group: team.group,
  });

  const team1Options = useMemo(
    () => teams.filter((t) => t.id !== team2Id).map(toOption),
    [teams, team2Id]
  );

  const team2Options = useMemo(
    () => teams.filter((t) => t.id !== team1Id).map(toOption),
    [teams, team1Id]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);

    try {
      if (match?.id) {
        await updateSchedule(match.id, {
          ...(team1Id ? { team1Id } : {}),
          ...(team2Id ? { team2Id } : {}),
        });
      } else {
        if (!team1Id || !team2Id) {
          setErrorMsg("Pilih kedua tim terlebih dahulu.");
          setBusy(false);
          return;
        }
        await createSchedule({
          stage: "PLAYOFF",
          playoffRound: round,
          bracketPosition: position,
          team1Id,
          team2Id,
          scheduledAt: new Date().toISOString(),
          venue: "GOR",
        });
      }
      onSaved("Data playoff berhasil disimpan.");
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan ke server.");
    } finally {
      setBusy(false);
    }
  };

  const getRoundChar = (r: PlayoffRound) => {
    switch (r) {
      case "ROUND_OF_16":
        return "A";
      case "QUARTERFINAL":
        return "B";
      case "SEMIFINAL":
        return "C";
      default:
        return "F";
    }
  };

  const modalTitle = `Bracket ${getRoundChar(round)}${position}`;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <div className="relative mx-auto w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 font-poppins">
        {/* Title */}
        <h2
          id={titleId}
          className="text-center text-sm font-semibold text-slate-800 mb-8"
        >
          {modalTitle}
        </h2>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Baris 1: Team 1 vs Team 2 */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
              <TeamCombobox
                id="playoff-team-1"
                label="Team 1"
                options={team1Options}
                value={team1Id}
                onChange={setTeam1Id}
                disabled={busy}
              />
            </div>

            <div className="text-base font-extrabold text-slate-800 uppercase select-none px-1">
              VS
            </div>

            <div className="w-full sm:flex-1">
              <TeamCombobox
                id="playoff-team-2"
                label="Team 2"
                options={team2Options}
                value={team2Id}
                onChange={setTeam2Id}
                disabled={busy}
              />
            </div>
          </div>

          {/* Baris 2: Skor Team 1 & Skor Team 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10">
            <div>
              <OutlinedField label="Skor Team 1" htmlFor="skor-team-1">
                <input
                  id="skor-team-1"
                  type="number"
                  min="0"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </OutlinedField>
            </div>

            <div>
              <OutlinedField label="Skor Team 2" htmlFor="skor-team-2">
                <input
                  id="skor-team-2"
                  type="number"
                  min="0"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </OutlinedField>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="h-10 px-7 rounded-full bg-[#E54D2E] hover:bg-[#D43D1E] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-7 rounded-full bg-[#FF9A00] hover:bg-[#E68A00] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {busy ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

"use client";

import React, { useCallback, useMemo, useState } from "react";

import { Pencil, X } from "lucide-react";

import { errorMessage } from "@/lib/errors";
import { useAsyncData, type AsyncState } from "@/lib/hooks/useAsyncData";
import { listGroups, updateTeam, type Group, type Team } from "@/lib/teamsApi";

type EditableTeam = {
  id: string;
  name: string;
  groupId?: string | null;
  group?: string | null;
};

interface TeamEditInfoModalProps {
  open: boolean;
  team: EditableTeam;
  onClose: () => void;
  onSuccess: (updatedTeam: Team) => void;
}

/** Grup awal: team.groupId, kalau tidak ada cocokkan nama team.group, kalau tidak "" (tanpa grup). */
function deriveGroupId(team: EditableTeam, groups: Group[]): string {
  if (team.groupId) return team.groupId;
  if (!team.group) return "";
  const groupName = team.group.toLowerCase();
  return groups.find((g) => g.name.toLowerCase() === groupName)?.id ?? "";
}

export const TeamEditInfoModal = ({ open, team, onClose, onSuccess }: TeamEditInfoModalProps) => {
  // Grup dimuat sekali per halaman, bukan setiap kali modal dibuka.
  const loadGroups = useCallback(() => listGroups(), []);
  const { state: groupsState } = useAsyncData(loadGroups);

  if (!open) return null;

  // Form dipasang ulang setiap modal dibuka (atau tim berganti), jadi isinya selalu mulai dari data tim.
  return (
    <TeamEditInfoForm key={team.id} team={team} groupsState={groupsState} onClose={onClose} onSuccess={onSuccess} />
  );
};

interface TeamEditInfoFormProps extends Omit<TeamEditInfoModalProps, "open"> {
  groupsState: AsyncState<Group[]>;
}

function TeamEditInfoForm({ team, groupsState, onClose, onSuccess }: TeamEditInfoFormProps) {
  const groups: Group[] = useMemo(() => (groupsState.status === "ready" ? groupsState.data : []), [groupsState]);

  const conferences = useMemo(
    () => [...new Map(groups.map((g) => [g.conference.id, g.conference.name])).entries()],
    [groups],
  );

  const [name, setName] = useState(team.name);
  // null = belum dipilih user; selama itu grup mengikuti data tim (termasuk saat daftar grup baru selesai dimuat).
  const [pickedGroupId, setPickedGroupId] = useState<string | null>(null);
  const groupId = pickedGroupId ?? deriveGroupId(team, groups);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Nama tim minimal 2 karakter.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateTeam(team.id, {
        name: trimmedName,
        group: groupId, // string kosong ("") akan mengeluarkan dari grup
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-team-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins backdrop-blur-xs duration-200"
    >
      <div className="animate-in zoom-in-95 relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl duration-150">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          disabled={isSaving}
          className="absolute top-5 right-5 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <h3 id="edit-team-title" className="text-lg font-bold text-gray-900">
              Edit Tim
            </h3>
            <p className="text-xs text-gray-500">Ubah nama tim dan grup pertandingan IBL 2K26</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="edit-team-name" className="mb-1 block text-xs font-bold text-gray-700 uppercase">
              Nama Tim <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-team-name"
              type="text"
              placeholder="Contoh: HMD 19 / Teknik Mesin"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              maxLength={100}
              required
              disabled={isSaving}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-team-group" className="mb-1 block text-xs font-bold text-gray-700 uppercase">
              Grup Pertandingan
            </label>
            <select
              id="edit-team-group"
              value={groupId}
              onChange={(e) => setPickedGroupId(e.target.value)}
              disabled={isSaving || groupsState.status !== "ready"}
              className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:cursor-wait"
            >
              {groupsState.status === "loading" && <option value="">Memuat grup...</option>}
              {conferences.map(([conferenceId, conferenceName]) => (
                <optgroup key={conferenceId} label={conferenceName}>
                  {groups
                    .filter((group) => group.conference.id === conferenceId)
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </optgroup>
              ))}
              <option value="">Tanpa grup (belum diundi)</option>
            </select>
            {groupsState.status === "error" && (
              <span className="mt-1 block text-[11px] text-red-700">
                Daftar grup gagal dimuat; tim bisa disimpan tanpa grup dan diatur nanti.
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer rounded-full bg-[#389F9D] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2C7D7B] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

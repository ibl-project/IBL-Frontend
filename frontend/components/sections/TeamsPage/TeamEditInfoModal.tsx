"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { type Group, type Team, errorMessage, listGroups, updateTeam } from "@/lib/teamsApi";

interface TeamEditInfoModalProps {
  open: boolean;
  team: {
    id: string;
    name: string;
    groupId?: string | null;
    group?: string | null;
  };
  onClose: () => void;
  onSuccess: (updatedTeam: Team) => void;
}

export const TeamEditInfoModal = ({ open, team, onClose, onSuccess }: TeamEditInfoModalProps) => {
  const loadGroups = useCallback(() => listGroups(), []);
  const { state: groupsState } = useAsyncData(loadGroups);
  const groups: Group[] = useMemo(
    () => (groupsState.status === "ready" ? groupsState.data : []),
    [groupsState],
  );

  const conferences = useMemo(
    () => [...new Map(groups.map((g) => [g.conference.id, g.conference.name])).entries()],
    [groups],
  );

  const [name, setName] = useState(team.name);
  const [groupId, setGroupId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or team changes
  useEffect(() => {
    if (open) {
      setName(team.name);
      setError(null);
      // Temukan groupId berdasarkan team.groupId atau nama team.group
      if (team.groupId) {
        setGroupId(team.groupId);
      } else if (team.group && groups.length > 0) {
        const found = groups.find((g) => g.name.toLowerCase() === team.group?.toLowerCase());
        setGroupId(found?.id ?? "");
      } else {
        setGroupId("");
      }
    }
  }, [open, team, groups]);

  if (!open) return null;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-poppins animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[calc(100vh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          disabled={isSaving}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
            <Pencil className="w-5 h-5" />
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
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="edit-team-name" className="block text-xs font-bold text-gray-700 uppercase mb-1">
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm transition-all"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-team-group" className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Grup Pertandingan
            </label>
            <select
              id="edit-team-group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={isSaving || groupsState.status !== "ready"}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm bg-white cursor-pointer disabled:cursor-wait transition-all"
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
              <span className="text-[11px] text-red-700 mt-1 block">
                Daftar grup gagal dimuat; tim bisa disimpan tanpa grup dan diatur nanti.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-full text-sm font-bold bg-[#389F9D] hover:bg-[#2C7D7B] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

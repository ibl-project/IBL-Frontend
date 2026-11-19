"use client";

import React, { useCallback, useState } from "react";

import { Pencil } from "lucide-react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import { getTeam } from "@/lib/teamsApi";

import { TeamEditInfoModal } from "./TeamEditInfoModal";
import { TeamLogo } from "./TeamLogo";

interface TeamDetailSectionProps {
  teamId?: string;
  teamName?: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export const TeamDetailSection = ({ teamId, teamName = "NAMA HMD", onBack, onEdit }: TeamDetailSectionProps) => {
  const canEdit = canEditData(useAuthStore((state) => state.user?.role));
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const lookup = teamId ?? teamName;
  const loadTeam = useCallback(() => getTeam(lookup), [lookup]);
  const { state, reload } = useAsyncData(loadTeam);
  const team = state.status === "ready" ? state.data : null;

  const displayTeamName = team?.name || teamName;
  const displayGroup = team ? (team.group ?? "Belum masuk grup") : "";
  const teamStats = team?.teamStats || {
    G: "-",
    W: "-",
    L: "-",
    PM: "-",
    PA: "-",
    PD: "-",
    PTS: "-",
  };
  const players = team?.players || [];

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 pt-6 pb-12">
      <h1 className="mb-2 text-4xl font-bold text-[#2d3748]">Teams</h1>

      {/* Main White Card Container */}
      <div className="w-full rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        {/* Card Header: Logo, Team Name, Group, and Edit Button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <TeamLogo
                src={team?.logo}
                alt={`Logo ${displayTeamName}`}
                sizes="64px"
                className="object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-wide text-[#2d3748] uppercase">{displayTeamName}</h2>
              <p className="font-medium text-gray-500">{displayGroup}</p>
            </div>
          </div>

          {canEdit && team && (
            <button
              type="button"
              onClick={() => setIsEditInfoOpen(true)}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800"
            >
              <Pencil className="h-3.5 w-3.5 text-teal-600" />
              <span>Edit Nama & Grup</span>
            </button>
          )}
        </div>

        {team && (
          <TeamEditInfoModal
            open={isEditInfoOpen}
            team={team}
            onClose={() => setIsEditInfoOpen(false)}
            onSuccess={() => {
              reload();
            }}
          />
        )}

        <hr className="mb-8 border-t border-[#94B8BC] opacity-50" />

        {state.status === "loading" && (
          <div className="flex items-center justify-center gap-3 py-10 text-gray-600" role="status">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
            <span>Memuat data tim...</span>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center" role="alert">
            <p className="font-medium text-red-700">Data tim gagal dimuat: {state.message}</p>
            <button
              type="button"
              onClick={reload}
              className="cursor-pointer rounded-full bg-[#389F9D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2C7D7B]"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {team && (
          <>
            {/* 1. Team Statistic Table */}
            <div className="mb-10">
              <h3 className="mb-3 text-base font-extrabold text-[#2d3748]">Team Statistic</h3>
              <div className="max-w-2xl overflow-hidden overflow-x-auto rounded-lg border border-gray-200/80">
                <table className="w-full text-center text-sm">
                  <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                    <tr>
                      <th className="w-1/4 border-r border-white/50 bg-white p-3"></th>
                      <th className="border-b border-white/50 p-3">G</th>
                      <th className="border-b border-white/50 p-3">W</th>
                      <th className="border-b border-white/50 p-3">L</th>
                      <th className="border-b border-white/50 p-3">PM</th>
                      <th className="border-b border-white/50 p-3">PA</th>
                      <th className="border-b border-white/50 p-3">PD</th>
                      <th className="border-b border-white/50 p-3">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-white/50 bg-[#D9CDBF] p-3 font-bold text-[#2d3748]">Value</td>
                      <td className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                        {teamStats.G || "-"}
                      </td>
                      <td className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                        {teamStats.W || "-"}
                      </td>
                      <td className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                        {teamStats.L || "-"}
                      </td>
                      <td className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                        {teamStats.PM || "-"}
                      </td>
                      <td className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                        {teamStats.PA || "-"}
                      </td>
                      <td className="border-r border-gray-200 bg-white p-3 font-medium text-gray-700">
                        {teamStats.PD || "-"}
                      </td>
                      <td className="bg-white p-3 font-medium text-gray-700">{teamStats.PTS || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Player Total Statistic Table */}
            <div className="mb-10">
              <h3 className="mb-3 text-base font-extrabold text-[#2d3748]">Player Total Statistic</h3>
              <div className="overflow-hidden overflow-x-auto rounded-lg border border-gray-200/80">
                <table className="w-full border-collapse text-center text-sm">
                  <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                    <tr>
                      <th className="border-r border-b border-white/50 p-3">NAME</th>
                      <th className="border-r border-b border-white/50 p-3">GAME</th>
                      <th className="border-r border-b border-white/50 p-3">POINT</th>
                      <th className="border-r border-b border-white/50 p-3">ASSIST</th>
                      <th className="border-b p-3">REBOUND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, idx) => (
                      <tr key={player.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}>
                        <td className="border-r border-gray-200 p-3 font-medium text-gray-700">{player.name}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.game || "-"}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.point || "-"}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.assist || "-"}</td>
                        <td className="p-3 text-gray-600">{player.stats?.rebound || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Player Average Statistic Table */}
            <div className="mb-12">
              <h3 className="mb-3 text-base font-extrabold text-[#2d3748]">Player Average Statistic</h3>
              <div className="overflow-hidden overflow-x-auto rounded-lg border border-gray-200/80">
                <table className="w-full border-collapse text-center text-sm">
                  <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                    <tr>
                      <th className="border-r border-b border-white/50 p-3">NAME</th>
                      <th className="border-r border-b border-white/50 p-3">PPG</th>
                      <th className="border-r border-b border-white/50 p-3">APG</th>
                      <th className="border-r border-b border-white/50 p-3">RPG</th>
                      <th className="border-r border-b border-white/50 p-3">FG%</th>
                      <th className="border-r border-b border-white/50 p-3">3P%</th>
                      <th className="border-r border-b border-white/50 p-3">2P%</th>
                      <th className="border-b p-3">FT%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, idx) => (
                      <tr key={player.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}>
                        <td className="border-r border-gray-200 p-3 font-medium text-gray-700">{player.name}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.ppg || "-"}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.apg || "-"}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.rpg || "-"}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">{player.stats?.fgPercent || "-"}</td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">
                          {player.stats?.threePPercent || "-"}
                        </td>
                        <td className="border-r border-gray-200 p-3 text-gray-600">
                          {player.stats?.twoPPercent || "-"}
                        </td>
                        <td className="p-3 text-gray-600">{player.stats?.ftPercent || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="cursor-pointer rounded-full bg-[#389F9D] px-8 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#2C7D7B]"
          >
            Back
          </button>
          {canEdit && team && (
            <button
              type="button"
              onClick={() => onEdit?.()}
              className="cursor-pointer rounded-full bg-[#F59E0B] px-8 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#D97706]"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

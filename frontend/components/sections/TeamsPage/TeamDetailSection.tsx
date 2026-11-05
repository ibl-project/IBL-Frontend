"use client";

import React, { useCallback, useState } from "react";
import { Pencil } from "lucide-react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import { getTeam } from "@/lib/teamsApi";
import { TeamLogo } from "./TeamLogo";
import { TeamEditInfoModal } from "./TeamEditInfoModal";

interface TeamDetailSectionProps {
  teamId?: string;
  teamName?: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export const TeamDetailSection = ({
  teamId,
  teamName = "NAMA HMD",
  onBack,
  onEdit,
}: TeamDetailSectionProps) => {
  const canEdit = canEditData(useAuthStore((state) => state.user?.role));
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const lookup = teamId ?? teamName;
  const loadTeam = useCallback(() => getTeam(lookup), [lookup]);
  const { state, reload } = useAsyncData(loadTeam);
  const team = state.status === "ready" ? state.data : null;

  const displayTeamName = team?.name || teamName;
  const displayGroup = team ? team.group ?? "Belum masuk grup" : "";
  const teamStats = team?.teamStats || {
    G: "0",
    W: "0",
    L: "0",
    PM: "0",
    PA: "0",
    PD: "0",
    PTS: "0",
  };
  const players = team?.players || [];

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6 pb-12 pt-6">
      <h1 className="text-4xl font-bold text-[#2d3748] mb-2">Teams</h1>

      {/* Main White Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full">
        {/* Card Header: Logo, Team Name, Group, and Edit Button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <TeamLogo
                src={team?.logo}
                alt={`Logo ${displayTeamName}`}
                sizes="64px"
                className="object-contain drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-[#2d3748] tracking-wide uppercase">
                {displayTeamName}
              </h2>
              <p className="text-gray-500 font-medium">{displayGroup}</p>
            </div>
          </div>

          {canEdit && team && (
            <button
              type="button"
              onClick={() => setIsEditInfoOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-teal-600 bg-white hover:bg-teal-50 text-xs font-semibold text-gray-700 hover:text-teal-800 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <Pencil className="w-3.5 h-3.5 text-teal-600" />
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

        <hr className="border-t border-[#94B8BC] opacity-50 mb-8" />

        {state.status === "loading" && (
          <div className="flex items-center gap-3 py-10 justify-center text-gray-600" role="status">
            <div className="w-6 h-6 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat data tim...</span>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center" role="alert">
            <p className="text-red-700 font-medium">Data tim gagal dimuat: {state.message}</p>
            <button
              type="button"
              onClick={reload}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[#389F9D] hover:bg-[#2C7D7B] text-white transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {team && (
          <>
            {/* 1. Team Statistic Table */}
            <div className="mb-10">
              <h3 className="text-base font-extrabold text-[#2d3748] mb-3">Team Statistic</h3>
              <div className="overflow-x-auto rounded-lg overflow-hidden border border-gray-200/80 max-w-2xl">
                <table className="w-full text-center text-sm">
                  <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                    <tr>
                      <th className="p-3 w-1/4 border-r border-white/50 bg-white"></th>
                      <th className="p-3 border-b border-white/50">G</th>
                      <th className="p-3 border-b border-white/50">W</th>
                      <th className="p-3 border-b border-white/50">L</th>
                      <th className="p-3 border-b border-white/50">PM</th>
                      <th className="p-3 border-b border-white/50">PA</th>
                      <th className="p-3 border-b border-white/50">PD</th>
                      <th className="p-3 border-b border-white/50">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-bold bg-[#D9CDBF] border-r border-white/50 text-[#2d3748]">
                        Value
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                        {teamStats.G || "0"}
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                        {teamStats.W || "0"}
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                        {teamStats.L || "0"}
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                        {teamStats.PM || "0"}
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                        {teamStats.PA || "0"}
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                        {teamStats.PD || "0"}
                      </td>
                      <td className="p-3 bg-white text-gray-700 font-medium">
                        {teamStats.PTS || "0"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Player Total Statistic Table */}
            <div className="mb-10">
              <h3 className="text-base font-extrabold text-[#2d3748] mb-3">
                Player Total Statistic
              </h3>
              <div className="overflow-x-auto rounded-lg overflow-hidden border border-gray-200/80">
                <table className="w-full text-center text-sm border-collapse">
                  <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                    <tr>
                      <th className="p-3 border-b border-r border-white/50">NAME</th>
                      <th className="p-3 border-b border-r border-white/50">GAME</th>
                      <th className="p-3 border-b border-r border-white/50">POINT</th>
                      <th className="p-3 border-b border-r border-white/50">ASSIST</th>
                      <th className="p-3 border-b">REBOUND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, idx) => (
                      <tr
                        key={player.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}
                      >
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700">
                          {player.name}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.game || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.point || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.assist || "0"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {player.stats?.rebound || "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Player Average Statistic Table */}
            <div className="mb-12">
              <h3 className="text-base font-extrabold text-[#2d3748] mb-3">
                Player Average Statistic
              </h3>
              <div className="overflow-x-auto rounded-lg overflow-hidden border border-gray-200/80">
                <table className="w-full text-center text-sm border-collapse">
                  <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                    <tr>
                      <th className="p-3 border-b border-r border-white/50">NAME</th>
                      <th className="p-3 border-b border-r border-white/50">PPG</th>
                      <th className="p-3 border-b border-r border-white/50">APG</th>
                      <th className="p-3 border-b border-r border-white/50">RPG</th>
                      <th className="p-3 border-b border-r border-white/50">FG%</th>
                      <th className="p-3 border-b border-r border-white/50">3P%</th>
                      <th className="p-3 border-b border-r border-white/50">2P%</th>
                      <th className="p-3 border-b">FT%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, idx) => (
                      <tr
                        key={player.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}
                      >
                        <td className="p-3 border-r border-gray-200 font-medium text-gray-700">
                          {player.name}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.ppg || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.apg || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.rpg || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.fgPercent || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.threePPercent || "0"}
                        </td>
                        <td className="p-3 border-r border-gray-200 text-gray-600">
                          {player.stats?.twoPPercent || "0"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {player.stats?.ftPercent || "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="bg-[#389F9D] hover:bg-[#2C7D7B] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Back
          </button>
          {canEdit && team && (
            <button
              type="button"
              onClick={() => onEdit?.()}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

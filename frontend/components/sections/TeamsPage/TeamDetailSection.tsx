import React from "react";
import Image from "next/image";
import { useTeamStore } from "@/lib/store/useTeamStore";

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
  const team = useTeamStore((state) =>
    state.teams.find(
      (t) =>
        (teamId && t.id === teamId) ||
        t.name.toLowerCase() === teamName.toLowerCase()
    )
  );

  const displayTeamName = team?.name || teamName;
  const displayGroup = team?.group || "Group A";
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
    <div className="w-full max-w-6xl flex flex-col gap-6 pb-12 pt-6">
      <h1 className="text-4xl font-bold text-[#2d3748] mb-2">Teams</h1>

      {/* Main White Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full">
        {/* Card Header: Logo & Team Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16">
            <Image
              src="/images/LOGO_1.svg"
              alt="Team Logo"
              fill
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

        <hr className="border-t border-[#94B8BC] opacity-50 mb-8" />

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
                    {teamStats.G || "-"}
                  </td>
                  <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                    {teamStats.W || "-"}
                  </td>
                  <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                    {teamStats.L || "-"}
                  </td>
                  <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                    {teamStats.PM || "-"}
                  </td>
                  <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                    {teamStats.PA || "-"}
                  </td>
                  <td className="p-3 bg-white text-gray-700 font-medium border-r border-gray-200">
                    {teamStats.PD || "-"}
                  </td>
                  <td className="p-3 bg-white text-gray-700 font-medium">
                    {teamStats.PTS || "-"}
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
                    key={player.id || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}
                  >
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-700">
                      {player.name}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.game || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.point || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.assist || "-"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {player.stats?.rebound || "-"}
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
                    key={player.id || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}
                  >
                    <td className="p-3 border-r border-gray-200 font-medium text-gray-700">
                      {player.name}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.ppg || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.apg || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.rpg || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.fgPercent || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.threePPercent || "-"}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">
                      {player.stats?.twoPPercent || "-"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {player.stats?.ftPercent || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={onBack}
            className="bg-[#389F9D] hover:bg-[#2C7D7B] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={onEdit}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

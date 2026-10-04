"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import {
  useTeamStore,
  TeamStats,
  PlayerStats,
  Player,
  createDefaultPlayerStats,
} from "@/lib/store/useTeamStore";

interface TeamEditSectionProps {
  teamId?: string;
  teamName?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSave?: (updatedTeamName?: string) => void;
}

interface StatInputProps {
  value: string;
  onChange: (val: string) => void;
  allowDecimal?: boolean;
}

const StatInput = ({ value, onChange, allowDecimal = false }: StatInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let sanitized = e.target.value;
    if (allowDecimal) {
      sanitized = sanitized.replace(/[^0-9.]/g, "");
    } else {
      sanitized = sanitized.replace(/[^0-9]/g, "");
    }
    onChange(sanitized);
  };

  const handleFocus = () => {
    if (value === "-") {
      onChange("");
    }
  };

  const handleBlur = () => {
    if (value.trim() === "") {
      onChange("-");
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="w-full h-full min-w-[36px] py-1 px-1 text-center bg-transparent border border-transparent hover:border-gray-300 focus:border-[#1E88E5] focus:bg-blue-50/60 rounded text-gray-700 font-medium transition-colors outline-none"
    />
  );
};

const NameInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Nama Pemain"
      className="w-full h-full py-1 px-2 text-center bg-transparent border border-transparent hover:border-gray-300 focus:border-[#1E88E5] focus:bg-blue-50/60 rounded font-medium text-gray-700 transition-colors outline-none"
    />
  );
};

export const TeamEditSection = ({
  teamId,
  teamName = "NAMA HMD",
  onBack,
  onCancel,
  onSave,
}: TeamEditSectionProps) => {
  const { teams, updateTeam } = useTeamStore();

  const currentTeam = teams.find(
    (t) =>
      (teamId && t.id === teamId) ||
      t.name.toLowerCase() === teamName.toLowerCase()
  );

  const [teamStats, setTeamStats] = useState<TeamStats>(
    currentTeam?.teamStats || {
      G: "-",
      W: "-",
      L: "-",
      PM: "-",
      PA: "-",
      PD: "-",
      PTS: "-",
    }
  );
  const [players, setPlayers] = useState<Player[]>(currentTeam?.players || []);

  useEffect(() => {
    if (currentTeam) {
      setTeamStats(currentTeam.teamStats);
      setPlayers(currentTeam.players);
    }
  }, [currentTeam]);

  const handlePlayerNameChange = (idx: number, newName: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], name: newName };
      return updated;
    });
  };

  const handlePlayerStatChange = (
    idx: number,
    field: keyof PlayerStats,
    val: string
  ) => {
    setPlayers((prev) => {
      const updated = [...prev];
      const currentStats = updated[idx].stats || {
        game: "-",
        point: "-",
        assist: "-",
        rebound: "-",
        ppg: "-",
        apg: "-",
        rpg: "-",
        fgPercent: "-",
        threePPercent: "-",
        twoPPercent: "-",
        ftPercent: "-",
      };
      updated[idx] = {
        ...updated[idx],
        stats: {
          ...currentStats,
          [field]: val,
        },
      };
      return updated;
    });
  };

  const handleTeamStatChange = (field: keyof TeamStats, val: string) => {
    setTeamStats((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleAddPlayer = () => {
    const maxId = players.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newPlayer: Player = {
      id: maxId + 1,
      name: `Pemain ${players.length + 1}`,
      nopung: String(players.length + 1),
      isCaptain: players.length === 0,
      stats: createDefaultPlayerStats(),
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const handleDeletePlayer = (idx: number) => {
    if (players.length <= 1) {
      alert("Tim harus memiliki minimal 1 pemain.");
      return;
    }
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const targetId = currentTeam?.id || teamId || "1";

    updateTeam(targetId, {
      teamStats,
      players,
    });

    onSave?.();
  };

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6 pb-12 pt-6">
      <h1 className="text-4xl font-bold text-[#2d3748] mb-2">Teams</h1>

      {/* Main White Card Container (With Blue Border as in design) */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#1E88E5] p-8 w-full">
        {/* Card Header: Logo & Team Name (Hardcoded / Read-only) */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src="/images/LOGO_1.svg"
              alt="Team Logo"
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#2d3748] tracking-wide uppercase">
              {currentTeam?.name || teamName}
            </h2>
            <p className="text-gray-500 font-medium">
              {currentTeam?.group || "Group A"}
            </p>
          </div>
        </div>

        <hr className="border-t border-[#94B8BC] opacity-50 mb-8" />

        {/* 1. Team Statistic Table */}
        <div className="mb-10">
          <h3 className="text-base font-extrabold text-[#2d3748] mb-3">
            Team Statistic
          </h3>
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
                  <td className="p-1 bg-white border-r border-gray-200">
                    <StatInput
                      value={teamStats.G}
                      onChange={(v) => handleTeamStatChange("G", v)}
                    />
                  </td>
                  <td className="p-1 bg-white border-r border-gray-200">
                    <StatInput
                      value={teamStats.W}
                      onChange={(v) => handleTeamStatChange("W", v)}
                    />
                  </td>
                  <td className="p-1 bg-white border-r border-gray-200">
                    <StatInput
                      value={teamStats.L}
                      onChange={(v) => handleTeamStatChange("L", v)}
                    />
                  </td>
                  <td className="p-1 bg-white border-r border-gray-200">
                    <StatInput
                      value={teamStats.PM}
                      onChange={(v) => handleTeamStatChange("PM", v)}
                    />
                  </td>
                  <td className="p-1 bg-white border-r border-gray-200">
                    <StatInput
                      value={teamStats.PA}
                      onChange={(v) => handleTeamStatChange("PA", v)}
                    />
                  </td>
                  <td className="p-1 bg-white border-r border-gray-200">
                    <StatInput
                      value={teamStats.PD}
                      onChange={(v) => handleTeamStatChange("PD", v)}
                    />
                  </td>
                  <td className="p-1 bg-white">
                    <StatInput
                      value={teamStats.PTS}
                      onChange={(v) => handleTeamStatChange("PTS", v)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Player Total Statistic Table */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-[#2d3748]">
              Player Total Statistic ({players.length} Pemain)
            </h3>
            <button
              type="button"
              onClick={handleAddPlayer}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pemain</span>
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg overflow-hidden border border-gray-200/80">
            <table className="w-full text-center text-sm border-collapse">
              <thead className="bg-[#D9CDBF] font-bold text-[#2d3748]">
                <tr>
                  <th className="p-3 border-b border-r border-white/50">NAME</th>
                  <th className="p-3 border-b border-r border-white/50">GAME</th>
                  <th className="p-3 border-b border-r border-white/50">POINT</th>
                  <th className="p-3 border-b border-r border-white/50">ASSIST</th>
                  <th className="p-3 border-b border-r border-white/50">REBOUND</th>
                  <th className="p-3 border-b w-[50px]">HAPUS</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr
                    key={player.id || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE9]"}
                  >
                    <td className="p-1 border-r border-gray-200 font-medium text-gray-700">
                      <NameInput
                        value={player.name}
                        onChange={(newName) =>
                          handlePlayerNameChange(idx, newName)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        value={player.stats?.game || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "game", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        value={player.stats?.point || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "point", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        value={player.stats?.assist || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "assist", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        value={player.stats?.rebound || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "rebound", v)
                        }
                      />
                    </td>
                    <td className="p-1 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleDeletePlayer(idx)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Hapus pemain"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
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
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        allowDecimal
                        value={player.stats?.ppg || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "ppg", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        allowDecimal
                        value={player.stats?.apg || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "apg", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        allowDecimal
                        value={player.stats?.rpg || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "rpg", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        allowDecimal
                        value={player.stats?.fgPercent || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "fgPercent", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        allowDecimal
                        value={player.stats?.threePPercent || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "threePPercent", v)
                        }
                      />
                    </td>
                    <td className="p-1 border-r border-gray-200">
                      <StatInput
                        allowDecimal
                        value={player.stats?.twoPPercent || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "twoPPercent", v)
                        }
                      />
                    </td>
                    <td className="p-1">
                      <StatInput
                        allowDecimal
                        value={player.stats?.ftPercent || "-"}
                        onChange={(v) =>
                          handlePlayerStatChange(idx, "ftPercent", v)
                        }
                      />
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

          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


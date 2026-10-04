"use client";

import React, { useState, useEffect, useMemo, KeyboardEvent } from "react";
import { useTeamStore } from "@/lib/store/useTeamStore";

export interface MatchInfo {
  id: number;
}

interface ScoringSearchTeamSectionProps {
  matches: MatchInfo[];
  activeMatchId: number | null;
  onAddScoring: () => void;
  onRemoveMatch: (id: number) => void;
  onSelectMatch: (id: number) => void;
  onCreate?: (team1: string, team2: string, players1: any[], players2: any[]) => void;
  onBack?: () => void;
}

const sortPlayersByNopung = <T extends { nopung?: string | number }>(list: T[]): T[] => {
  return [...(list || [])].sort((a, b) => {
    const rawA = String(a.nopung ?? "").trim();
    const rawB = String(b.nopung ?? "").trim();
    const numA = parseInt(rawA, 10);
    const numB = parseInt(rawB, 10);
    const isNumA = !isNaN(numA);
    const isNumB = !isNaN(numB);

    if (isNumA && isNumB) {
      return numA - numB;
    }
    if (isNumA) return -1;
    if (isNumB) return 1;
    return rawA.localeCompare(rawB, undefined, { numeric: true });
  });
};

const generatePlayers = (teamName: string) => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Pemain ${i + 1}`,
    nopung: `${i + 1}`,
    isCaptain: i === 0,
  }));
};

/**
 * ScoringSearchTeamSection
 *
 * Tampilan pencarian tim lawan (Team 1 vs Team 2) untuk match scoring.
 * Fitur yang disempurnakan:
 * 1. Filter dropdown otomatis mengecualikan tim yang sudah dipilih pada sisi lawan.
 * 2. Radio button untuk pemilihan Kapten (karena 1 tim hanya memiliki 1 kapten).
 * 3. Validasi real-time jika tim yang dipilih sama atau ada duplikasi nomor punggung.
 * 4. Integrasi pop-up konfirmasi hapus match.
 */
export const ScoringSearchTeamSection = ({
  matches,
  activeMatchId,
  onAddScoring,
  onRemoveMatch,
  onSelectMatch,
  onCreate,
  onBack,
}: ScoringSearchTeamSectionProps) => {
  const teams = useTeamStore((state) => state.teams);

  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [players1, setPlayers1] = useState<any[]>([]);
  const [players2, setPlayers2] = useState<any[]>([]);

  // Daftar nama seluruh tim dari Zustand store
  const allTeamNames = useMemo(() => teams.map((t) => t.name), [teams]);

  // Filtering teams based on search input & EXCLUDING opposing team
  const filteredTeams1 = useMemo(() => {
    return allTeamNames.filter(
      (t) =>
        t.toLowerCase().includes(search1.toLowerCase()) &&
        t.toLowerCase() !== t2.trim().toLowerCase()
    );
  }, [allTeamNames, search1, t2]);

  const filteredTeams2 = useMemo(() => {
    return allTeamNames.filter(
      (t) =>
        t.toLowerCase().includes(search2.toLowerCase()) &&
        t.toLowerCase() !== t1.trim().toLowerCase()
    );
  }, [allTeamNames, search2, t1]);

  // Check if both teams are identical
  const isDuplicateTeam = Boolean(
    t1.trim() &&
    t2.trim() &&
    t1.trim().toLowerCase() === t2.trim().toLowerCase()
  );

  const handleSelectTeam1 = (teamName: string) => {
    if (t2 && teamName.toLowerCase() === t2.toLowerCase()) {
      alert("Team 1 tidak boleh sama dengan Team 2!");
      return;
    }
    setT1(teamName);
    setSearch1(teamName);
    setShowDropdown1(false);

    // Ambil data tim dari store untuk template awal nama pemain
    const foundTeam = teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (foundTeam && foundTeam.players && foundTeam.players.length > 0) {
      setPlayers1(
        sortPlayersByNopung(
          foundTeam.players.map((p, i) => ({
            id: p.id || i + 1,
            name: p.name || `Pemain ${i + 1}`,
            nopung: p.nopung || `${i + 1}`,
            isCaptain: p.isCaptain ?? i === 0,
          }))
        )
      );
    } else {
      setPlayers1(generatePlayers(teamName));
    }
  };

  const handleSelectTeam2 = (teamName: string) => {
    if (t1 && teamName.toLowerCase() === t1.toLowerCase()) {
      alert("Team 2 tidak boleh sama dengan Team 1!");
      return;
    }
    setT2(teamName);
    setSearch2(teamName);
    setShowDropdown2(false);

    // Ambil data tim dari store untuk template awal nama pemain
    const foundTeam = teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (foundTeam && foundTeam.players && foundTeam.players.length > 0) {
      setPlayers2(
        sortPlayersByNopung(
          foundTeam.players.map((p, i) => ({
            id: p.id || i + 1,
            name: p.name || `Pemain ${i + 1}`,
            nopung: p.nopung || `${i + 1}`,
            isCaptain: p.isCaptain ?? i === 0,
          }))
        )
      );
    } else {
      setPlayers2(generatePlayers(teamName));
    }
  };

  const handleKeyDown1 = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Tab" || e.key === "Enter") && filteredTeams1.length > 0) {
      e.preventDefault();
      handleSelectTeam1(filteredTeams1[0]);
    }
  };

  const handleKeyDown2 = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Tab" || e.key === "Enter") && filteredTeams2.length > 0) {
      e.preventDefault();
      handleSelectTeam2(filteredTeams2[0]);
    }
  };

  const updatePlayerName = (teamIdx: 1 | 2, playerId: number, value: string) => {
    if (teamIdx === 1) {
      setPlayers1(players1.map((p) => (p.id === playerId ? { ...p, name: value } : p)));
    } else {
      setPlayers2(players2.map((p) => (p.id === playerId ? { ...p, name: value } : p)));
    }
  };

  const updatePlayerNopung = (teamIdx: 1 | 2, playerId: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    if (teamIdx === 1) {
      setPlayers1(players1.map((p) => (p.id === playerId ? { ...p, nopung: numericValue } : p)));
    } else {
      setPlayers2(players2.map((p) => (p.id === playerId ? { ...p, nopung: numericValue } : p)));
    }
  };

  // Radio button logic: exactly 1 captain per team
  const updatePlayerCaptain = (teamIdx: 1 | 2, playerId: number) => {
    if (teamIdx === 1) {
      setPlayers1(players1.map((p) => ({ ...p, isCaptain: p.id === playerId })));
    } else {
      setPlayers2(players2.map((p) => ({ ...p, isCaptain: p.id === playerId })));
    }
  };

  const handleNopungKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    teamIdx: 1 | 2,
    index: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = document.getElementById(`nopung-${teamIdx}-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevInput = document.getElementById(`nopung-${teamIdx}-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Check for duplicate nopung numbers within a team
  const getDuplicateNopungs = (players: any[]) => {
    const counts: { [nopung: string]: number } = {};
    players.forEach((p) => {
      const val = (p.nopung || "").trim();
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    const dupes = new Set<string>();
    Object.entries(counts).forEach(([val, count]) => {
      if (count > 1) {
        dupes.add(val);
      }
    });
    return dupes;
  };

  const duplicateNopungs1 = useMemo(() => getDuplicateNopungs(players1), [players1]);
  const duplicateNopungs2 = useMemo(() => getDuplicateNopungs(players2), [players2]);
  const hasDuplicates = duplicateNopungs1.size > 0 || duplicateNopungs2.size > 0;

  return (
    <div className="flex flex-col w-full h-full pt-6 font-poppins">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-[#202224] tracking-tight">
          Scoring
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          Total {matches.length} Pertandingan Terdaftar dalam IBL 2K26
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white flex items-center justify-between px-6 py-4 rounded-[12px] mb-8 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2">
          {matches.map((match, index) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className={`flex items-center h-[36px] px-4 rounded-full cursor-pointer transition-colors border ${
                activeMatchId === match.id
                  ? "bg-[#e2e8f0] border-transparent text-black"
                  : "bg-white border-gray-300 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <span className="font-semibold text-[12px]">
                Match {index + 1}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMatch(match.id);
                }}
                className="flex items-center justify-center ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                title={`Hapus Match ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddScoring}
          className="bg-[#7a9ba8] hover:bg-[#688591] transition-colors flex items-center justify-center px-6 py-2.5 rounded-full h-[36px] shrink-0 ml-4 cursor-pointer"
        >
          <span className="font-semibold text-[12px] text-white">
            + Add Scoring
          </span>
        </button>
      </div>

      {/* Main Card */}
      <div className="relative bg-white rounded-[12px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] w-full py-8 px-6 lg:px-[70px] flex flex-col items-center">
        {/* Search Inputs Row */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          {/* Team 1 */}
          <div className="relative w-full max-w-[380px]">
            <div className="relative border border-[#79747e] rounded-[4px] bg-white flex items-center h-[56px] px-4">
              <div className="absolute -top-3 left-3 bg-white px-1">
                <span className="text-[14px] text-[#313131]">Team 1</span>
              </div>
              <input
                type="text"
                placeholder="Pilih atau cari Team 1"
                value={search1}
                onChange={(e) => {
                  setSearch1(e.target.value);
                  setT1(e.target.value);
                  setShowDropdown1(true);
                }}
                onFocus={() => setShowDropdown1(true)}
                onBlur={() => setTimeout(() => setShowDropdown1(false), 200)}
                onKeyDown={handleKeyDown1}
                className="w-full outline-none text-[16px] text-[#1c1b1f] bg-transparent"
              />
            </div>
            {showDropdown1 && filteredTeams1.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-[#ececec] rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto z-50">
                {filteredTeams1.map((team, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectTeam1(team);
                    }}
                    className="px-5 py-3 cursor-pointer hover:bg-gray-300 transition-colors border-b border-gray-300 last:border-0"
                  >
                    <span className="text-[16px] text-black font-medium">
                      {team}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-[22px] text-[#202224] font-extrabold my-2 lg:my-0 select-none">
            VS
          </span>

          {/* Team 2 */}
          <div className="relative w-full max-w-[380px]">
            <div className="relative border border-[#79747e] rounded-[4px] bg-white flex items-center h-[56px] px-4">
              <div className="absolute -top-3 left-3 bg-white px-1">
                <span className="text-[14px] text-[#313131]">Team 2</span>
              </div>
              <input
                type="text"
                placeholder="Pilih atau cari Team 2"
                value={search2}
                onChange={(e) => {
                  setSearch2(e.target.value);
                  setT2(e.target.value);
                  setShowDropdown2(true);
                }}
                onFocus={() => setShowDropdown2(true)}
                onBlur={() => setTimeout(() => setShowDropdown2(false), 200)}
                onKeyDown={handleKeyDown2}
                className="w-full outline-none text-[16px] text-[#1c1b1f] bg-transparent"
              />
            </div>
            {showDropdown2 && filteredTeams2.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-[#ececec] rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto z-50">
                {filteredTeams2.map((team, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectTeam2(team);
                    }}
                    className="px-5 py-3 cursor-pointer hover:bg-gray-300 transition-colors border-b border-gray-300 last:border-0"
                  >
                    <span className="text-[16px] text-black font-medium">
                      {team}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Warning jika Team 1 dan Team 2 sama */}
        {isDuplicateTeam && (
          <div className="mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            ⚠️ Team 1 dan Team 2 tidak boleh memilih tim yang sama!
          </div>
        )}

        {/* Players Tables - Tampil ketika kedua tim sudah dipilih */}
        {players1.length > 0 && players2.length > 0 && !isDuplicateTeam && (
          <div className="w-full mt-12">
            <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-20">
              {/* Team 1 Table */}
              <div className="w-full max-w-[380px] flex flex-col z-10">
                <div className="text-center font-bold text-sm text-teal-800 bg-teal-50 py-1.5 rounded-t-lg border-b border-teal-200 uppercase tracking-wide">
                  {t1 || "Team 1"}
                </div>
                <div className="flex border-b border-[#b9b9b9] h-[31px] items-end pb-1 bg-gray-50">
                  <div className="w-[60px] flex items-center justify-center font-bold text-[10px]">
                    KAPTEN
                  </div>
                  <div className="flex-1 flex items-center justify-center font-bold text-[12px]">
                    NAMA
                  </div>
                  <div className="w-[60px] flex items-center justify-center font-bold text-[12px]">
                    NOPUNG
                  </div>
                </div>
                {players1.map((p, idx) => {
                  const isDuplicate = Boolean(
                    p.nopung && duplicateNopungs1.has(p.nopung.trim())
                  );
                  return (
                    <div
                      key={p.id}
                      className="flex border-b border-[#b9b9b9] h-[33px] items-center hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Radio button untuk Kapten Team 1 */}
                      <div className="w-[60px] flex items-center justify-center">
                        <input
                          type="radio"
                          name="captain-team-1"
                          checked={p.isCaptain}
                          onChange={() => updatePlayerCaptain(1, p.id)}
                          className="w-4 h-4 accent-teal-600 cursor-pointer transition-transform hover:scale-110"
                          title="Pilih sebagai Kapten Team 1"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-center px-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            updatePlayerName(1, p.id, e.target.value)
                          }
                          placeholder="Nama Pemain"
                          className="w-full text-center outline-none text-[12px] text-[#313131] bg-transparent hover:bg-black/5 focus:bg-white focus:ring-1 focus:ring-black/20 rounded px-1 py-0.5 transition-colors"
                        />
                      </div>
                      <div className="w-[60px] flex items-center justify-center px-1">
                        <input
                          id={`nopung-1-${idx}`}
                          type="text"
                          value={p.nopung}
                          onChange={(e) =>
                            updatePlayerNopung(1, p.id, e.target.value)
                          }
                          onKeyDown={(e) => handleNopungKeyDown(e, 1, idx)}
                          placeholder="-"
                          className={`w-full h-full text-center outline-none text-[12px] rounded transition-colors ${
                            isDuplicate
                              ? "bg-red-50 text-red-600 font-bold border border-red-500 shadow-xs"
                              : "bg-transparent text-[#313131] placeholder-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
                {duplicateNopungs1.size > 0 && (
                  <p className="text-[11px] text-red-500 font-medium mt-2 text-center">
                    ⚠️ Nomor punggung tidak boleh sama (
                    {Array.from(duplicateNopungs1).join(", ")})
                  </p>
                )}
              </div>

              {/* Team 2 Table */}
              <div className="w-full max-w-[380px] flex flex-col z-10">
                <div className="text-center font-bold text-sm text-teal-800 bg-teal-50 py-1.5 rounded-t-lg border-b border-teal-200 uppercase tracking-wide">
                  {t2 || "Team 2"}
                </div>
                <div className="flex border-b border-[#b9b9b9] h-[31px] items-end pb-1 bg-gray-50">
                  <div className="w-[60px] flex items-center justify-center font-bold text-[10px]">
                    KAPTEN
                  </div>
                  <div className="flex-1 flex items-center justify-center font-bold text-[12px]">
                    NAMA
                  </div>
                  <div className="w-[60px] flex items-center justify-center font-bold text-[12px]">
                    NOPUNG
                  </div>
                </div>
                {players2.map((p, idx) => {
                  const isDuplicate = Boolean(
                    p.nopung && duplicateNopungs2.has(p.nopung.trim())
                  );
                  return (
                    <div
                      key={p.id}
                      className="flex border-b border-[#b9b9b9] h-[33px] items-center hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Radio button untuk Kapten Team 2 */}
                      <div className="w-[60px] flex items-center justify-center">
                        <input
                          type="radio"
                          name="captain-team-2"
                          checked={p.isCaptain}
                          onChange={() => updatePlayerCaptain(2, p.id)}
                          className="w-4 h-4 accent-teal-600 cursor-pointer transition-transform hover:scale-110"
                          title="Pilih sebagai Kapten Team 2"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-center px-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            updatePlayerName(2, p.id, e.target.value)
                          }
                          placeholder="Nama Pemain"
                          className="w-full text-center outline-none text-[12px] text-[#313131] bg-transparent hover:bg-black/5 focus:bg-white focus:ring-1 focus:ring-black/20 rounded px-1 py-0.5 transition-colors"
                        />
                      </div>
                      <div className="w-[60px] flex items-center justify-center px-1">
                        <input
                          id={`nopung-2-${idx}`}
                          type="text"
                          value={p.nopung}
                          onChange={(e) =>
                            updatePlayerNopung(2, p.id, e.target.value)
                          }
                          onKeyDown={(e) => handleNopungKeyDown(e, 2, idx)}
                          placeholder="-"
                          className={`w-full h-full text-center outline-none text-[12px] rounded transition-colors ${
                            isDuplicate
                              ? "bg-red-50 text-red-600 font-bold border border-red-500 shadow-xs"
                              : "bg-transparent text-[#313131] placeholder-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
                {duplicateNopungs2.size > 0 && (
                  <p className="text-[11px] text-red-500 font-medium mt-2 text-center">
                    ⚠️ Nomor punggung tidak boleh sama (
                    {Array.from(duplicateNopungs2).join(", ")})
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex justify-between items-center mt-[60px]">
              <button
                type="button"
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else if (activeMatchId) {
                    onRemoveMatch(activeMatchId);
                  }
                }}
                className="bg-[#f26722] hover:bg-[#d8581a] transition-colors rounded-[50px] px-[24px] py-[10px] h-[36px] flex items-center justify-center min-w-[100px] cursor-pointer"
              >
                <span className="font-bold text-[14px] text-white">Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (hasDuplicates) {
                    alert("Nomor punggung dalam satu tim tidak boleh sama!");
                    return;
                  }
                  if (isDuplicateTeam) {
                    alert("Team 1 dan Team 2 tidak boleh sama!");
                    return;
                  }
                  onCreate?.(
                    t1,
                    t2,
                    sortPlayersByNopung(players1),
                    sortPlayersByNopung(players2)
                  );
                }}
                disabled={hasDuplicates || isDuplicateTeam}
                className={`transition-colors rounded-[50px] px-[24px] py-[10px] h-[36px] flex items-center justify-center min-w-[100px] ${
                  hasDuplicates || isDuplicateTeam
                    ? "bg-gray-400 cursor-not-allowed opacity-60 text-white"
                    : "bg-[#f99f1b] hover:bg-[#d98b16] text-white cursor-pointer shadow-md"
                }`}
              >
                <span className="font-bold text-[14px]">Create Match</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

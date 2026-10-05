import { useState, useMemo, KeyboardEvent } from "react";
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
}

const generatePlayers = (teamName: string) => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Aditya Reza`,
    nopung: `${i + 1}`,
    isCaptain: i === 0,
  }));
};

/**
 * ScoringSearchTeamSection (Photo 5)
 *
 * Catatan untuk staff:
 * - Bagian ini muncul ketika tombol "+ Add Scoring" ditekan dari Photo 4.
 * - Berisi:
 *   1. Tab navigasi match (misal: Match 1 [x]) dan tombol + Add Scoring
 *   2. Input pencarian "Team 1"
 *   3. Label "VS"
 *   4. Input pencarian "Team 2"
 * - Ketika pasangan tim sudah dipilih, alur berpindah ke tampilan Box Score (Photo 2).
 */
export const ScoringSearchTeamSection = ({
  matches,
  activeMatchId,
  onAddScoring,
  onRemoveMatch,
  onSelectMatch,
  onCreate
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

  // Daftar nama seluruh 18 tim dari Zustand store
  const allTeamNames = useMemo(() => teams.map((t) => t.name), [teams]);

  // Filtering teams based on search input & mutually exclusive selection
  // Tim yang sudah dipilih di Tim 1 tidak bisa dipilih di Tim 2, begitu juga sebaliknya
  const filteredTeams1 = useMemo(() => {
    return allTeamNames.filter((t) => {
      const matchesSearch = t.toLowerCase().includes(search1.toLowerCase());
      const isSelectedInT2 = Boolean(t2 && t.toLowerCase() === t2.trim().toLowerCase());
      return matchesSearch && !isSelectedInT2;
    });
  }, [allTeamNames, search1, t2]);

  const filteredTeams2 = useMemo(() => {
    return allTeamNames.filter((t) => {
      const matchesSearch = t.toLowerCase().includes(search2.toLowerCase());
      const isSelectedInT1 = Boolean(t1 && t.toLowerCase() === t1.trim().toLowerCase());
      return matchesSearch && !isSelectedInT1;
    });
  }, [allTeamNames, search2, t1]);

  const handleSelectTeam1 = (teamName: string) => {
    setT1(teamName);
    setSearch1(teamName);
    setShowDropdown1(false);

    // Jika tim ini sebelumnya terpilih di Team 2, bersihkan Team 2
    if (t2 && t2.toLowerCase() === teamName.toLowerCase()) {
      setT2("");
      setSearch2("");
      setPlayers2([]);
    }

    // Ambil data tim dari store untuk template awal nama pemain
    const foundTeam = teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (foundTeam && foundTeam.players && foundTeam.players.length > 0) {
      setPlayers1(
        foundTeam.players.map((p, i) => ({
          id: p.id || i + 1,
          name: p.name || `Pemain ${i + 1}`,
          nopung: p.nopung || `${i + 1}`,
          isCaptain: p.isCaptain ?? i === 0,
        }))
      );
    } else {
      setPlayers1(generatePlayers(teamName));
    }
  };

  const handleSelectTeam2 = (teamName: string) => {
    setT2(teamName);
    setSearch2(teamName);
    setShowDropdown2(false);

    // Jika tim ini sebelumnya terpilih di Team 1, bersihkan Team 1
    if (t1 && t1.toLowerCase() === teamName.toLowerCase()) {
      setT1("");
      setSearch1("");
      setPlayers1([]);
    }

    // Ambil data tim dari store untuk template awal nama pemain
    const foundTeam = teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (foundTeam && foundTeam.players && foundTeam.players.length > 0) {
      setPlayers2(
        foundTeam.players.map((p, i) => ({
          id: p.id || i + 1,
          name: p.name || `Pemain ${i + 1}`,
          nopung: p.nopung || `${i + 1}`,
          isCaptain: p.isCaptain ?? i === 0,
        }))
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
      setPlayers1(players1.map(p => p.id === playerId ? { ...p, name: value } : p));
    } else {
      setPlayers2(players2.map(p => p.id === playerId ? { ...p, name: value } : p));
    }
  };

  const updatePlayerNopung = (teamIdx: 1 | 2, playerId: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    if (teamIdx === 1) {
      setPlayers1(players1.map(p => p.id === playerId ? { ...p, nopung: numericValue } : p));
    } else {
      setPlayers2(players2.map(p => p.id === playerId ? { ...p, nopung: numericValue } : p));
    }
  };

  const updatePlayerCaptain = (teamIdx: 1 | 2, playerId: number) => {
    if (teamIdx === 1) {
      setPlayers1(players1.map(p => ({ ...p, isCaptain: p.id === playerId })));
    } else {
      setPlayers2(players2.map(p => ({ ...p, isCaptain: p.id === playerId })));
    }
  };

  const handleNopungKeyDown = (e: KeyboardEvent<HTMLInputElement>, teamIdx: 1 | 2, index: number) => {
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
  const isSameTeam = Boolean(
    t1 && t2 && t1.trim().toLowerCase() === t2.trim().toLowerCase()
  );
  const isCreateDisabled = hasDuplicates || isSameTeam || !t1 || !t2;

  return (
    <div className="flex flex-col w-full h-full pt-6">
      <h1 className="text-[32px] font-bold text-[#202224] font-poppins tracking-[-0.11px] mb-6">
        Scoring
      </h1>

      {/* Tabs */}
      <div className="bg-white flex items-center justify-between px-6 py-4 rounded-[12px] mb-8 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-2">
          {matches.map((match, index) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className={`flex items-center h-[36px] px-4 rounded-full cursor-pointer transition-colors border ${
                activeMatchId === match.id
                  ? "bg-[#e2e8f0] border-transparent"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span
                className={`font-semibold text-[12px] font-poppins ${
                  activeMatchId === match.id ? "text-black" : "text-gray-600"
                }`}
              >
                Match {index + 1}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMatch(match.id);
                }}
                className={`flex items-center justify-center ml-2 ${
                  activeMatchId === match.id
                    ? "text-black hover:text-gray-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={onAddScoring}
          className="bg-[#7a9ba8] hover:bg-[#688591] transition-colors flex items-center justify-center px-[24px] py-[10px] rounded-full h-[36px] shrink-0 ml-4"
        >
          <span className="font-semibold text-[12px] text-white font-poppins">
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
                <span className="text-[14px] text-[#313131] font-poppins">Team 1</span>
              </div>
              <input
                type="text"
                placeholder="Team 1"
                value={search1}
                onChange={(e) => {
                  setSearch1(e.target.value);
                  if (t1 && e.target.value !== t1) {
                    setT1("");
                    setPlayers1([]);
                  }
                  setShowDropdown1(true);
                }}
                onFocus={() => setShowDropdown1(true)}
                onBlur={() => setTimeout(() => setShowDropdown1(false), 200)}
                onKeyDown={handleKeyDown1}
                className="w-full outline-none text-[16px] text-[#1c1b1f] font-poppins bg-transparent"
              />
            </div>
            {showDropdown1 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-[#ececec] rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto z-50">
                {filteredTeams1.length > 0 ? (
                  filteredTeams1.map((team, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectTeam1(team);
                      }}
                      className="px-5 py-3 cursor-pointer hover:bg-gray-300 transition-colors border-b border-gray-300 last:border-0"
                    >
                      <span className="text-[17px] text-black font-poppins">
                        {team}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-3 text-gray-500 text-[14px] font-poppins">
                    {t2 && search1 && search1.trim().toLowerCase() === t2.trim().toLowerCase()
                      ? `Tim "${t2}" sudah dipilih sebagai Tim 2`
                      : "Tim tidak ditemukan"}
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="text-[22px] text-[#202224] font-poppins font-extrabold my-2 lg:my-0">
            VS
          </span>

          {/* Team 2 */}
          <div className="relative w-full max-w-[380px]">
            <div className="relative border border-[#79747e] rounded-[4px] bg-white flex items-center h-[56px] px-4">
              <div className="absolute -top-3 left-3 bg-white px-1">
                <span className="text-[14px] text-[#313131] font-poppins">Team 2</span>
              </div>
              <input
                type="text"
                placeholder="Team 2"
                value={search2}
                onChange={(e) => {
                  setSearch2(e.target.value);
                  if (t2 && e.target.value !== t2) {
                    setT2("");
                    setPlayers2([]);
                  }
                  setShowDropdown2(true);
                }}
                onFocus={() => setShowDropdown2(true)}
                onBlur={() => setTimeout(() => setShowDropdown2(false), 200)}
                onKeyDown={handleKeyDown2}
                className="w-full outline-none text-[16px] text-[#1c1b1f] font-poppins bg-transparent"
              />
            </div>
            {showDropdown2 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-[#ececec] rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto z-50">
                {filteredTeams2.length > 0 ? (
                  filteredTeams2.map((team, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectTeam2(team);
                      }}
                      className="px-5 py-3 cursor-pointer hover:bg-gray-300 transition-colors border-b border-gray-300 last:border-0"
                    >
                      <span className="text-[17px] text-black font-poppins">
                        {team}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-3 text-gray-500 text-[14px] font-poppins">
                    {t1 && search2 && search2.trim().toLowerCase() === t1.trim().toLowerCase()
                      ? `Tim "${t1}" sudah dipilih sebagai Tim 1`
                      : "Tim tidak ditemukan"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Same team alert banner */}
        {isSameTeam && (
          <div className="w-full max-w-[800px] mt-6 p-3 bg-red-50 border border-red-200 rounded-[10px] text-center text-red-600 text-[13px] font-poppins font-medium">
            ⚠️ Tim 1 dan Tim 2 tidak boleh sama! Silakan pilih tim lawan yang berbeda.
          </div>
        )}

        {/* Players Tables - Only show if both teams are selected */}
        {players1.length > 0 && players2.length > 0 && !isSameTeam && (
          <div className="w-full mt-12">
            <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-20">
              
              {/* Team 1 Table */}
              <div className="w-full max-w-[380px] flex flex-col z-10">
                <div className="flex border-b border-[#b9b9b9] h-[31px] items-end pb-1">
                  <div className="w-[60px] flex items-center justify-center font-bold text-[10px] font-poppins">KAPTEN</div>
                  <div className="flex-1 flex items-center justify-center font-bold text-[12px] font-poppins">NAMA</div>
                  <div className="w-[60px] flex items-center justify-center font-bold text-[12px] font-poppins">NOPUNG</div>
                </div>
                {players1.map((p, idx) => {
                  const isDuplicate = Boolean(p.nopung && duplicateNopungs1.has(p.nopung.trim()));
                  return (
                    <div key={p.id} className="flex border-b border-[#b9b9b9] h-[31px] items-center">
                      <div className="w-[60px] flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={p.isCaptain}
                          onChange={() => updatePlayerCaptain(1, p.id)}
                          className="w-3 h-3 accent-blue-600 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-center px-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePlayerName(1, p.id, e.target.value)}
                          placeholder="Nama Pemain"
                          className="w-full text-center outline-none text-[12px] font-poppins text-[#313131] bg-transparent hover:bg-black/5 focus:bg-white focus:ring-1 focus:ring-black/20 rounded px-1 py-0.5 transition-colors"
                        />
                      </div>
                      <div className="w-[60px] flex items-center justify-center px-1">
                        <input 
                          id={`nopung-1-${idx}`}
                          type="text"
                          value={p.nopung}
                          onChange={(e) => updatePlayerNopung(1, p.id, e.target.value)}
                          onKeyDown={(e) => handleNopungKeyDown(e, 1, idx)}
                          placeholder="-"
                          className={`w-full h-full text-center outline-none text-[12px] font-poppins rounded transition-colors ${
                            isDuplicate
                              ? "bg-red-50 text-red-600 font-bold border border-red-500 shadow-sm"
                              : "bg-transparent text-[#313131] placeholder-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
                {duplicateNopungs1.size > 0 && (
                  <p className="text-[11px] text-red-500 font-poppins font-medium mt-2 text-center">
                    ⚠️ Nomor punggung tidak boleh sama ({Array.from(duplicateNopungs1).join(", ")})
                  </p>
                )}
              </div>

              {/* Team 2 Table */}
              <div className="w-full max-w-[380px] flex flex-col z-10">
                <div className="flex border-b border-[#b9b9b9] h-[31px] items-end pb-1">
                  <div className="w-[60px] flex items-center justify-center font-bold text-[10px] font-poppins">KAPTEN</div>
                  <div className="flex-1 flex items-center justify-center font-bold text-[12px] font-poppins">NAMA</div>
                  <div className="w-[60px] flex items-center justify-center font-bold text-[12px] font-poppins">NOPUNG</div>
                </div>
                {players2.map((p, idx) => {
                  const isDuplicate = Boolean(p.nopung && duplicateNopungs2.has(p.nopung.trim()));
                  return (
                    <div key={p.id} className="flex border-b border-[#b9b9b9] h-[31px] items-center">
                      <div className="w-[60px] flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={p.isCaptain}
                          onChange={() => updatePlayerCaptain(2, p.id)}
                          className="w-3 h-3 accent-blue-600 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-center px-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePlayerName(2, p.id, e.target.value)}
                          placeholder="Nama Pemain"
                          className="w-full text-center outline-none text-[12px] font-poppins text-[#313131] bg-transparent hover:bg-black/5 focus:bg-white focus:ring-1 focus:ring-black/20 rounded px-1 py-0.5 transition-colors"
                        />
                      </div>
                      <div className="w-[60px] flex items-center justify-center px-1">
                        <input 
                          id={`nopung-2-${idx}`}
                          type="text"
                          value={p.nopung}
                          onChange={(e) => updatePlayerNopung(2, p.id, e.target.value)}
                          onKeyDown={(e) => handleNopungKeyDown(e, 2, idx)}
                          placeholder="-"
                          className={`w-full h-full text-center outline-none text-[12px] font-poppins rounded transition-colors ${
                            isDuplicate
                              ? "bg-red-50 text-red-600 font-bold border border-red-500 shadow-sm"
                              : "bg-transparent text-[#313131] placeholder-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
                {duplicateNopungs2.size > 0 && (
                  <p className="text-[11px] text-red-500 font-poppins font-medium mt-2 text-center">
                    ⚠️ Nomor punggung tidak boleh sama ({Array.from(duplicateNopungs2).join(", ")})
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex justify-between items-center mt-[60px]">
              <button className="bg-[#f26722] hover:bg-[#d8581a] transition-colors rounded-[50px] px-[24px] py-[10px] h-[36px] flex items-center justify-center min-w-[100px]">
                <span className="font-bold text-[14px] text-white font-poppins">Back</span>
              </button>
              <button 
                onClick={() => {
                  if (hasDuplicates) {
                    alert("Nomor punggung dalam satu tim tidak boleh sama!");
                    return;
                  }
                  if (isSameTeam) {
                    alert("Tim 1 dan Tim 2 tidak boleh sama!");
                    return;
                  }
                  onCreate?.(t1, t2, players1, players2);
                }}
                disabled={isCreateDisabled}
                className={`transition-colors rounded-[50px] px-[24px] py-[10px] h-[36px] flex items-center justify-center min-w-[100px] ${
                  isCreateDisabled
                    ? "bg-gray-400 cursor-not-allowed opacity-60 text-white"
                    : "bg-[#f99f1b] hover:bg-[#d98b16] text-white cursor-pointer"
                }`}
              >
                <span className="font-bold text-[14px] font-poppins">Create</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { useTeamStore } from "@/lib/store/useTeamStore";

/**
 * TeamsLandingSection (Photo 1)
 *
 * Catatan untuk staff:
 * - Bagian ini menampilkan landing page Teams.
 * - Berisi:
 *   1. Judul "Teams"
 *   2. Search bar untuk mencari tim
 *   3. Grid daftar tim (logo tim & nama tim)
 */
interface TeamsLandingSectionProps {
  onTeamClick?: (teamId: string, teamName: string) => void;
}

export const TeamsLandingSection = ({ onTeamClick }: TeamsLandingSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const teams = useTeamStore((state) => state.teams);

  useEffect(() => {
    useTeamStore.getState().syncWithBackend();
  }, []);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-6 pt-6">
      {/* 1. Header & Title */}
      <div>
        <h1 className="text-4xl font-bold text-[#2d3748] mb-6">Teams</h1>
        
        {/* 2. Search Bar */}
        <div className="relative w-full max-w-4xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white border-none rounded-full shadow-sm focus:ring-2 focus:ring-[#389F9D] focus:outline-none sm:text-sm transition-shadow"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Teams Grid */}
      <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-x-6 gap-y-12">
        {filteredTeams.map((team, index) => (
          <div 
            key={team.id} 
            className="flex flex-col items-center justify-center cursor-pointer group"
            onClick={() => onTeamClick?.(team.id, team.name)}
          >
            <div className="relative w-24 h-24 mb-3 transition-transform duration-300 group-hover:scale-110">
              <Image 
                src={team.logo} 
                alt={team.name}
                fill
                className="object-contain drop-shadow-md"
              />
            </div>
            <span className="text-[#2d3748] font-bold text-lg">{team.name}</span>
          </div>
        ))}
      </div>
      
      {filteredTeams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No teams found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { TeamsLandingSection } from "@/components/sections/TeamsPage/TeamsLandingSection";
import { TeamDetailSection } from "@/components/sections/TeamsPage/TeamDetailSection";
import { TeamEditSection } from "@/components/sections/TeamsPage/TeamEditSection";

export default function TeamsPage() {
  const [currentView, setCurrentView] = useState<"landing" | "detail" | "edit">("landing");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);

  const handleTeamClick = (teamId: string, teamName?: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName || null);
    setCurrentView("detail");
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setSelectedTeamId(null);
    setSelectedTeamName(null);
  };

  const handleGoToEdit = () => {
    setCurrentView("edit");
  };

  const handleBackToDetail = (updatedTeamName?: string) => {
    if (updatedTeamName) {
      setSelectedTeamName(updatedTeamName);
    }
    setCurrentView("detail");
  };

  return (
    <div className="bg-[#e1e7ea] min-h-screen w-full px-6 py-6 md:px-[46px]">
      {currentView === "landing" && (
        <TeamsLandingSection onTeamClick={handleTeamClick} />
      )}

      {currentView === "detail" && (selectedTeamId || selectedTeamName) && (
        <TeamDetailSection 
          teamId={selectedTeamId || undefined}
          teamName={selectedTeamName || undefined} 
          onBack={handleBackToLanding} 
          onEdit={handleGoToEdit} 
        />
      )}

      {currentView === "edit" && (selectedTeamId || selectedTeamName) && (
        <TeamEditSection 
          teamId={selectedTeamId || undefined}
          teamName={selectedTeamName || undefined} 
          onBack={handleBackToDetail} 
          onCancel={handleBackToDetail}
          onSave={handleBackToDetail}
        />
      )}
    </div>
  );
}

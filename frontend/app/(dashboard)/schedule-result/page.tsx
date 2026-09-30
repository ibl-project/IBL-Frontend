"use client";

import React, { useState } from "react";
import { ScheduleResultLandingSection } from "@/components/sections/ScheduleResultPage/ScheduleResultLandingSection";
import { ScheduleResultCreateSection } from "@/components/sections/ScheduleResultPage/ScheduleResultCreateSection";
import { ScheduleResultDetailSection } from "@/components/sections/ScheduleResultPage/ScheduleResultDetailSection";
import { ScheduleResultEditSection } from "@/components/sections/ScheduleResultPage/ScheduleResultEditSection";

export default function ScheduleResultPage() {
  const [currentView, setCurrentView] = useState<"landing" | "create" | "detail" | "edit">("landing");

  return (
    <div>
      {currentView === "landing" && <ScheduleResultLandingSection />}
      {currentView === "create" && <ScheduleResultCreateSection />}
      {currentView === "detail" && <ScheduleResultDetailSection />}
      {currentView === "edit" && <ScheduleResultEditSection />}
    </div>
  );
}

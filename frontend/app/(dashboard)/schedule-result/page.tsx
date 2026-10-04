"use client";

import React, { useState } from "react";
import { ScheduleResultLandingSection } from "@/components/sections/ScheduleResultPage/ScheduleResultLandingSection";
import { ScheduleResultCreateSection } from "@/components/sections/ScheduleResultPage/ScheduleResultCreateSection";
import { ScheduleResultDetailSection } from "@/components/sections/ScheduleResultPage/ScheduleResultDetailSection";
import { ScheduleResultEditSection } from "@/components/sections/ScheduleResultPage/ScheduleResultEditSection";

export default function ScheduleResultPage() {
  const [modalView, setModalView] = useState<"none" | "create" | "detail" | "edit">("none");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setModalView("create");
  };

  const handleOpenDetail = (id: string) => {
    setSelectedScheduleId(id);
    setModalView("detail");
  };

  const handleOpenEdit = () => {
    setModalView("edit");
  };

  const handleCloseModal = () => {
    setModalView("none");
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-slate-50">
      {/* 1. Base Landing / List View */}
      <ScheduleResultLandingSection
        onOpenCreate={handleOpenCreate}
        onOpenDetail={handleOpenDetail}
      />

      {/* 2. Create Modal */}
      {modalView === "create" && (
        <ScheduleResultCreateSection
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      )}

      {/* 3. Detail Modal */}
      {modalView === "detail" && selectedScheduleId && (
        <ScheduleResultDetailSection
          scheduleId={selectedScheduleId}
          onClose={handleCloseModal}
          onEdit={handleOpenEdit}
        />
      )}

      {/* 4. Edit Modal */}
      {modalView === "edit" && selectedScheduleId && (
        <ScheduleResultEditSection
          scheduleId={selectedScheduleId}
          onClose={handleCloseModal}
          onSuccess={() => setModalView("detail")}
        />
      )}
    </div>
  );
}

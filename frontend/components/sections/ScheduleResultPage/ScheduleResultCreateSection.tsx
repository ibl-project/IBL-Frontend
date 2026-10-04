"use client";

import React from "react";

import { createSchedule } from "@/lib/matchesApi";
import type { Team } from "@/lib/teamsApi";
import { Modal } from "@/components/ui/Modal";
import { ScheduleForm } from "./ScheduleForm";

interface ScheduleResultCreateSectionProps {
  open: boolean;
  teams: Team[];
  onClose: () => void;
  onCreated: (message: string) => void;
}

/** Modal "+ Add Schedule" (desain "Schedule Result [Create]"). */
export const ScheduleResultCreateSection = ({ open, teams, onClose, onCreated }: ScheduleResultCreateSectionProps) => {
  return (
    <Modal open={open} onClose={onClose} labelledBy="schedule-create-title" className="max-w-[964px]">
      <div className="rounded-[24px] bg-white px-6 py-10 sm:px-14">
        <h2 id="schedule-create-title" className="sr-only">
          Tambah jadwal pertandingan
        </h2>
        <ScheduleForm
          idPrefix="schedule-create"
          teams={teams}
          submitLabel="Create"
          onCancel={onClose}
          onSubmit={async (input) => {
            const match = await createSchedule(input);
            onCreated(`Jadwal ${match.team1.name} vs ${match.team2.name} ditambahkan.`);
          }}
        />
      </div>
    </Modal>
  );
};

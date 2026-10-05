"use client";

import React, { useCallback, useState } from "react";
import { X } from "lucide-react";

import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { listMatches } from "@/lib/matchesApi";
import { canEditData, useAuthStore } from "@/lib/store/useAuthStore";
import { listTeams } from "@/lib/teamsApi";
import { ScheduleResultCreateSection } from "@/components/sections/ScheduleResultPage/ScheduleResultCreateSection";
import { ScheduleResultDetailSection } from "@/components/sections/ScheduleResultPage/ScheduleResultDetailSection";
import { ScheduleResultEditSection } from "@/components/sections/ScheduleResultPage/ScheduleResultEditSection";
import { ScheduleResultLandingSection } from "@/components/sections/ScheduleResultPage/ScheduleResultLandingSection";

type Dialog = { kind: "create" } | { kind: "detail"; id: string } | { kind: "edit"; id: string } | null;

export default function ScheduleResultPage() {
  const canEdit = canEditData(useAuthStore((state) => state.user?.role));
  const [dateFilter, setDateFilter] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadMatches = useCallback(() => listMatches(dateFilter || undefined), [dateFilter]);
  const { state: matches, reload } = useAsyncData(loadMatches);
  const loadTeams = useCallback(() => listTeams(), []);
  const { state: teamsState } = useAsyncData(loadTeams);
  const teams = teamsState.status === "ready" ? teamsState.data : [];

  const editing =
    dialog?.kind === "edit" && matches.status === "ready"
      ? (matches.data.find((match) => match.id === dialog.id) ?? null)
      : null;

  const finish = (message: string) => {
    setDialog(null);
    setNotice(message);
    reload();
  };

  const noticeBanner = notice && (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      <span>{notice}</span>
      <button
        type="button"
        aria-label="Tutup pesan"
        onClick={() => setNotice(null)}
        className="shrink-0 rounded-full p-1 hover:bg-black/5"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#e1e7ea] px-6 py-6 md:px-[46px]">
      <ScheduleResultLandingSection
        matches={matches}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onReload={reload}
        onAdd={canEdit ? () => setDialog({ kind: "create" }) : null}
        onDetail={(id) => setDialog({ kind: "detail", id })}
        notice={noticeBanner}
      />

      {canEdit && (
        <ScheduleResultCreateSection
          open={dialog?.kind === "create"}
          teams={teams}
          onClose={() => setDialog(null)}
          onCreated={finish}
        />
      )}

      <ScheduleResultDetailSection
        matchId={dialog?.kind === "detail" ? dialog.id : null}
        canEdit={canEdit}
        onClose={() => setDialog(null)}
        onEdit={(id) => setDialog({ kind: "edit", id })}
        onDeleted={finish}
      />

      {canEdit && (
        <ScheduleResultEditSection
          match={editing}
          teams={teams}
          onClose={() => setDialog(null)}
          onSaved={finish}
          onFileChanged={reload}
        />
      )}
    </div>
  );
}

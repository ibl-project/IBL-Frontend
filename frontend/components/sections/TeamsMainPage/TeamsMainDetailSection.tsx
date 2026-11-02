"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { getTeam } from "@/lib/teamsApi";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { ARTBOARD, TEAMS_COLORS } from "./teamsMainTheme";
import { TeamsArtboard } from "./TeamsArtboard";
import { PaperBoard } from "./PaperBoard";
import { TeamBanner } from "./TeamBanner";
import { PlayerStatsTable } from "./PlayerStatsTable";
import { AVERAGE_COLUMNS, PLAYER_COLUMN_WIDTH, TOTAL_COLUMNS } from "./playerStatsColumns";
import { BoardMessage } from "./BoardMessage";

const MISSING_ID_MESSAGE = "Tim tidak ditemukan.";

export function TeamsMainDetailSection() {
  const teamId = useSearchParams().get("id");
  const load = useCallback(() => (teamId ? getTeam(teamId) : Promise.reject(new Error(MISSING_ID_MESSAGE))), [teamId]);
  const { state, reload } = useAsyncData(load);

  return (
    <TeamsArtboard page="detail">
      {(variant) => {
        const { banner, detail, table, backLink } = ARTBOARD[variant];
        const team = state.status === "ready" ? state.data : null;
        return (
          <>
            <div className="relative">
              <Link
                href="/teams-main"
                className="absolute z-20 uppercase hover:underline"
                style={{
                  top: backLink.top,
                  right: backLink.right,
                  fontFamily: "var(--font-drowner)",
                  fontSize: backLink.font,
                  color: TEAMS_COLORS.ink,
                }}
              >
                ← Semua Tim
              </Link>
              {team ? <TeamBanner team={team} variant={variant} /> : <div style={{ height: banner.top }} />}
            </div>
            <PaperBoard variant={variant} page="detail" overlap={team ? banner.boardOverlap : 0}>
              <div style={{ paddingTop: detail.tablesOffset }}>
                {state.status === "loading" && <BoardMessage variant={variant}>Memuat data tim...</BoardMessage>}
                {state.status === "error" && (
                  <BoardMessage variant={variant} onRetry={teamId ? reload : undefined}>
                    {state.message}
                  </BoardMessage>
                )}
                {team && (
                  <div className="flex flex-col" style={{ gap: table.gap }}>
                    <PlayerStatsTable
                      variant={variant}
                      title="Totals"
                      columns={TOTAL_COLUMNS}
                      players={team.players}
                      playerColumnWidth={PLAYER_COLUMN_WIDTH.totals}
                      minWidth={table.minWidthTotals}
                    />
                    <PlayerStatsTable
                      variant={variant}
                      title="Average"
                      columns={AVERAGE_COLUMNS}
                      players={team.players}
                      playerColumnWidth={PLAYER_COLUMN_WIDTH.average}
                      minWidth={table.minWidthAverage}
                    />
                  </div>
                )}
              </div>
            </PaperBoard>
          </>
        );
      }}
    </TeamsArtboard>
  );
}

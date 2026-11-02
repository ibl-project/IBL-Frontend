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
import { AVERAGE_COLUMNS, TOTAL_COLUMNS } from "./playerStatsColumns";
import { BoardMessage } from "./BoardMessage";

const MISSING_ID_MESSAGE = "Tim tidak ditemukan.";

export function TeamsMainDetailSection() {
  const teamId = useSearchParams().get("id");
  const load = useCallback(() => (teamId ? getTeam(teamId) : Promise.reject(new Error(MISSING_ID_MESSAGE))), [teamId]);
  const { state, reload } = useAsyncData(load);

  return (
    <TeamsArtboard>
      {(variant) => {
        const { banner, detail, table, backLink } = ARTBOARD[variant];
        const team = state.status === "ready" ? state.data : null;
        return (
          <>
            <Link
              href="/teams-main"
              className="relative z-10 inline-block uppercase hover:underline"
              style={{
                marginLeft: banner.left,
                marginTop: banner.top,
                fontFamily: "var(--font-drowner)",
                fontSize: backLink,
                color: TEAMS_COLORS.ivory,
              }}
            >
              ← Semua Tim
            </Link>
            {team && <TeamBanner team={team} variant={variant} />}
            <PaperBoard variant={variant} overlap={team ? banner.boardOverlap : 0}>
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
                      playerColumnPercent={40}
                      minWidth={table.minWidthTotals}
                    />
                    <PlayerStatsTable
                      variant={variant}
                      title="Average"
                      columns={AVERAGE_COLUMNS}
                      players={team.players}
                      playerColumnPercent={30}
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

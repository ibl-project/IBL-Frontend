"use client";

import React from "react";

import { listTeams } from "@/lib/teamsApi";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { ARTBOARD } from "./teamsMainTheme";
import { TeamsArtboard } from "./TeamsArtboard";
import { TeamsTitle } from "./TeamsTitle";
import { PaperBoard } from "./PaperBoard";
import { SectionBar } from "./SectionBar";
import { TeamCard } from "./TeamCard";
import { BoardMessage } from "./BoardMessage";

export function TeamsMainLandingSection() {
  const { state, reload } = useAsyncData(listTeams);

  return (
    <TeamsArtboard>
      {(variant) => {
        const { board, grid } = ARTBOARD[variant];
        return (
          <>
            <TeamsTitle variant={variant} />
            <PaperBoard variant={variant} overlap={board.overlap}>
              <SectionBar variant={variant} label="All Teams" caption="Himpunan Mahasiswa" />
              <div style={{ marginTop: grid.offset }}>
                {state.status === "loading" && <BoardMessage variant={variant}>Memuat tim...</BoardMessage>}
                {state.status === "error" && (
                  <BoardMessage variant={variant} onRetry={reload}>
                    {state.message}
                  </BoardMessage>
                )}
                {state.status === "ready" && state.data.length === 0 && (
                  <BoardMessage variant={variant}>Belum ada tim terdaftar.</BoardMessage>
                )}
                {state.status === "ready" && state.data.length > 0 && (
                  <ul className="mx-auto flex flex-wrap justify-center" style={{ width: grid.pitch * grid.columns, rowGap: grid.rowGap }}>
                    {state.data.map((team) => (
                      <li key={team.id}>
                        <TeamCard team={team} variant={variant} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </PaperBoard>
          </>
        );
      }}
    </TeamsArtboard>
  );
}

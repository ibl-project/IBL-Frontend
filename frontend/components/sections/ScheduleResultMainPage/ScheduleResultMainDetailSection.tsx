"use client";

import React, { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";
import { ApiError } from "@/lib/apiClient";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { teamLabel } from "@/lib/matchDisplay";
import { type MatchSide, type MatchSnapshot, REGULATION_QUARTERS, getMatch } from "@/lib/matchesApi";
import { isDateKey } from "@/lib/scheduleDays";
import { MatchHeader } from "./MatchHeader";
import { SummaryTable } from "./SummaryTable";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIVE_REFRESH_MS = 60_000;

/** Match dari API; null kalau id tidak valid atau tidak ada (404/400). Error lain tetap dilempar. */
function loadMatch(id: string | null): Promise<MatchSnapshot | null> {
  if (!id || !UUID.test(id)) return Promise.resolve(null);
  return getMatch(id).catch((error: unknown) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  });
}

const QUARTER_CELL = "border-r border-[#7E0202]/50 px-0.5 py-0.5";

/** Tabel skor per kuarter (Q1–Q4, OT kalau ada, Total). "-" sebelum laga dimulai. */
function QuarterTable({ match }: { match: MatchSnapshot | null }) {
  const started = !!match && match.status !== "SCHEDULED";
  const periods = match
    ? Math.max(REGULATION_QUARTERS, match.team1.quarterScores.length, match.team2.quarterScores.length)
    : REGULATION_QUARTERS;
  const hasOvertime = periods > REGULATION_QUARTERS;
  const quarter = (side: MatchSide, index: number) => (started ? (side.quarterScores[index] ?? 0) : "-");
  const overtime = (side: MatchSide) =>
    started ? side.quarterScores.slice(REGULATION_QUARTERS).reduce((sum, points) => sum + points, 0) : "-";

  const rows: Array<{ side: MatchSide | null }> = [{ side: match?.team1 ?? null }, { side: match?.team2 ?? null }];
  const headers = ["1st", "2nd", "3rd", "4th", ...(hasOvertime ? ["OT"] : []), "Total"];

  return (
    <table className="h-full w-full table-fixed border-collapse text-center">
      <thead>
        <tr className="font-poppins text-[length:max(0.5625rem,1.92cqw)] font-black text-[#101010]">
          <th className="w-[28%] border-b border-r border-[#7E0202]/50 px-1 py-0.5">Team</th>
          {headers.map((label, index) => (
            <th
              key={label}
              className={`border-b border-[#7E0202]/50 px-0.5 py-0.5 ${index < headers.length - 1 ? "border-r" : ""}`}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="font-poppins text-[length:max(0.5625rem,1.84cqw)] font-bold text-[#101010]">
        {rows.map(({ side }, rowIndex) => {
          const name = side ? teamLabel(side) : "";
          const cells: Array<number | string> = side
            ? [0, 1, 2, 3].map((index) => quarter(side, index))
            : ["-", "-", "-", "-"];
          if (hasOvertime) cells.push(side ? overtime(side) : "-");
          cells.push(side && started ? side.score : "-");
          return (
            <tr key={rowIndex} className={rowIndex === 0 ? "border-b border-[#7E0202]/50" : ""}>
              <td
                title={name}
                className={`${QUARTER_CELL} overflow-hidden text-ellipsis whitespace-nowrap px-1 font-black text-[#7E0202]`}
              >
                {name}
              </td>
              {cells.map((value, index) => (
                <td key={index} className={index < cells.length - 1 ? QUARTER_CELL : "px-0.5 py-0.5"}>
                  {value}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function MessageCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div
      role="status"
      className="mt-6 flex w-full max-w-[560px] flex-col items-center gap-4 rounded-2xl border-2 border-[#760807] bg-[#fff5df] px-6 py-8 text-center font-poppins text-[#760807] shadow-[3px_3px_0_#380606]"
    >
      <p className="text-base font-bold sm:text-lg">{title}</p>
      {children}
    </div>
  );
}

export const ScheduleResultMainDetailSection: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const date = searchParams.get("date");
  const backHref = isDateKey(date) ? `/schedule-result-main?date=${date}` : "/schedule-result-main";

  const load = useCallback(() => loadMatch(id), [id]);
  const { state, reload, setState } = useAsyncData(load);
  const match = state.status === "ready" ? state.data : null;

  // Laga LIVE: perbarui diam-diam tiap 60 detik dan saat tab kembali aktif; gagal refresh
  // tidak mengganti tampilan dengan pesan error.
  const refreshSilently = useCallback(() => {
    loadMatch(id).then(
      (data) => {
        if (data) setState({ status: "ready", data });
      },
      () => {},
    );
  }, [id, setState]);

  const isLive = match?.status === "LIVE";
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(refreshSilently, LIVE_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSilently();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isLive, refreshSilently]);

  const notFound = state.status === "ready" && state.data === null;
  const loading = state.status === "loading";

  return (
    <section
      aria-label="Detail Game"
      className="relative isolate min-h-screen overflow-hidden bg-[#f3e6ce] pb-14 pt-[calc(var(--navbar-height)+12px)] sm:pb-20 md:pt-[calc(var(--navbar-height)+20px)]"
    >
      {/* Background Graphic Overlay from Figma */}
      <Image
        src="/images/BACKGROUND.png"
        alt=""
        fill
        priority
        className="pointer-events-none absolute inset-0 z-0 size-full object-cover object-top select-none"
      />

      {/* Floating Left Ticket Ornament - safely positioned inside viewport to prevent clipping */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="pointer-events-none absolute left-3 top-[20%] z-0 hidden w-[15vw] max-w-[240px] xl:block 2xl:left-8"
      >
        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [-1, 1, -1] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/svg/figma/ticketelemenkiri.svg"
            alt=""
            width={385}
            height={455}
            className="h-auto w-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)] select-none"
          />
        </motion.div>
      </motion.div>

      {/* Floating Right Ticket Ornament - safely positioned inside viewport to prevent clipping */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="pointer-events-none absolute right-3 top-[34%] z-0 hidden w-[15vw] max-w-[240px] xl:block 2xl:right-8"
      >
        <motion.div
          animate={{ y: [5, -5, 5], rotate: [1, -1, 1] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <Image
            src="/svg/figma/ticketelementkanan.svg"
            alt=""
            width={450}
            height={495}
            className="h-auto w-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)] select-none"
          />
        </motion.div>
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1128px] flex-col items-center px-3 sm:px-6">
        {/* Navigation & Back Action */}
        <div className="mb-2 flex w-full max-w-[1080px] justify-start sm:mb-4">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[#760807] bg-[#fff5df] px-3.5 py-1.5 font-poppins text-xs font-bold text-[#760807] shadow-[2px_2px_0_#380606] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[3px_3px_0_#380606] sm:text-sm"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 sm:size-4" />
            <span>Kembali ke Jadwal</span>
          </Link>
        </div>

        {notFound && (
          <MessageCard title="Pertandingan tidak ditemukan">
            <p className="text-sm">Tautan mungkin salah atau jadwalnya sudah dihapus.</p>
          </MessageCard>
        )}

        {state.status === "error" && (
          <MessageCard title="Detail pertandingan gagal dimuat">
            <button
              type="button"
              onClick={reload}
              className="rounded-full bg-[#760807] px-5 py-2 text-sm font-bold text-white hover:bg-[#8a0a09]"
            >
              Coba lagi
            </button>
          </MessageCard>
        )}

        {(loading || match) && (
          /* Unified Match Graphic (Backboard + Ring + Net + Red Summary Box + Table) */
          <motion.article
            initial="hidden"
            animate="visible"
            variants={popSpringVariants}
            custom={0}
            aria-busy={loading}
            className="relative z-20 w-full max-w-[1080px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
          >
            {/* Frame 1080 × 1280 (1 unit = 1 px Figma desktop); container "detail" untuk ukuran isinya. */}
            <div className="@container/detail relative w-full aspect-[1080/1280]">
              {/* Layer 1: Red Textbox Summary Box (Big full-width, under backboard rim) */}
              <div className="absolute left-0 top-[33.6%] z-10 w-full aspect-[1611/1223]">
                <Image
                  src="/images/textboxsummary.png"
                  alt=""
                  fill
                  priority
                  className="pointer-events-none object-contain select-none"
                />
              </div>

              {/* Layer 2: Basketball Backboard + Ring & Net (In front of Red Box, behind SUMMARY) */}
              <div className="absolute left-0 top-0 z-20 w-full aspect-[1080/761]">
                <Image
                  src="/images/ring.png"
                  alt=""
                  fill
                  priority
                  className="pointer-events-none relative z-10 object-contain select-none"
                />

                {/* Quarter Scores Table Box (tablebox ring.svg) */}
                <div className="@container/quarters absolute left-1/2 top-[36.5%] z-20 w-[67.6%] -translate-x-1/2 aspect-[730/233]">
                  <Image
                    src="/svg/figma/tablebox%20ring.svg"
                    alt=""
                    fill
                    priority
                    className="pointer-events-none object-contain select-none"
                  />
                  {match?.status === "LIVE" && (
                    <span className="absolute bottom-full left-1/2 mb-[1.5cqw] -translate-x-1/2 rounded-[4px] bg-[#c51610] px-[0.5em] py-[0.15em] font-poppins text-[length:max(0.5625rem,1.92cqw)] font-bold tracking-wider text-white">
                      LIVE
                    </span>
                  )}
                  <div className="absolute left-[3.5%] top-[8.5%] h-[72.5%] w-[93%] overflow-hidden">
                    <QuarterTable match={match} />
                  </div>
                </div>
              </div>

              {/* Header: logos, team names, venue, time (IMPLEMENTATION_DETAIL.md §3.2, §4) */}
              <div className="absolute left-[15.13%] top-[7%] z-[26] w-[68.52%] @max-[480px]/detail:left-[3.55%] @max-[480px]/detail:top-[5.2%] @max-[480px]/detail:w-[92.9%]">
                <MatchHeader
                  data={match ? { team1: match.team1, team2: match.team2, venue: match.venue, scheduledAt: match.scheduledAt } : null}
                />
              </div>

              {/* TEMPORARY alignment overlay (?overlay=1) — DO NOT COMMIT. Old images at 40% in their old slots. */}
              {searchParams.get("overlay") === "1" && (
                <>
                  <div className="pointer-events-none absolute left-0 top-0 z-[60] w-full aspect-[1080/761] opacity-40">
                    <div className="absolute left-1/2 top-[10.5%] w-[73.5%] -translate-x-1/2 aspect-[794/211]">
                      <Image src="/svg/figma/team12%20group.svg" alt="" fill className="object-contain" />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute left-1/2 top-[52%] z-[60] w-[70.4%] -translate-x-1/2 aspect-[760/390] opacity-40">
                    <Image src="/svg/figma/Tabel%20Summary.svg" alt="" fill className="object-contain" />
                  </div>
                </>
              )}

              {/* Layer 3: SUMMARY 3D Banner (Right in front of the basketball net) */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={popPunchVariants}
                custom={{ delay: 0.15, rotation: 0 }}
                className="absolute left-1/2 top-[43.8%] z-30 w-[44.5%] -translate-x-1/2 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
              >
                <Image
                  src="/svg/figma/summary.svg"
                  alt="SUMMARY"
                  width={432}
                  height={99}
                  className="h-auto w-full select-none"
                  priority
                />
              </motion.div>

              {/* Layer 4: Summary Table (Inside Red Box, beneath SUMMARY banner) */}
              <div className="absolute left-1/2 top-[52%] z-[25] w-[70.4%] -translate-x-1/2">
                <SummaryTable teams={match ? { team1: match.team1, team2: match.team2 } : null} />
              </div>
            </div>
          </motion.article>
        )}
      </div>
    </section>
  );
};

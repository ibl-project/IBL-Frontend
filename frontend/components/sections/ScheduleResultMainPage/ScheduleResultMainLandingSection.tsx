"use client";

import { type ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";
import { todayWib } from "@/lib/datetime";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { formatKickoff, teamLabel } from "@/lib/matchDisplay";
import { type MatchListItem, type MatchTeamSide, listMatches } from "@/lib/matchesApi";
import { formatMatchDay, groupMatchesByWibDay, pickDefaultDay } from "@/lib/scheduleDays";
import { TeamLogo } from "@/components/sections/TeamsPage/TeamLogo";
import { CalendarStrip } from "./CalendarStrip";

const CARD_FRAMES = ["/svg/figma/Box Tim 12.svg", "/svg/figma/Box Tim 34.svg"];

function MatchCard({ match, frame, dateKey }: { match: MatchListItem; frame: string; dateKey: string }) {
  const { team1, team2, status } = match;
  const showScore = status === "LIVE" || status === "FINISHED";
  // Nama tim yang kalah sedikit diredupkan setelah laga selesai.
  const dimmed = (side: MatchTeamSide) =>
    status === "FINISHED" && match.winnerTeamId && side.id !== match.winnerTeamId ? "opacity-60" : "";

  return (
    <motion.article
      aria-label={`${teamLabel(team1)} vs ${teamLabel(team2)}, ${formatKickoff(match.scheduledAt)}`}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="relative w-full"
    >
      <Image
        src={frame}
        alt=""
        width={1026}
        height={327}
        className="block h-auto w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        loading="eager"
      />
      <div className="absolute inset-0 text-center text-[#101010]">
        {[team1, team2].map((side, index) => (
          <div
            key={index}
            className={`absolute top-[22%] aspect-[73/77] h-[38%] ${index === 0 ? "left-[8%]" : "right-[8%]"}`}
          >
            <TeamLogo src={side.logo} alt={`Logo ${teamLabel(side)}`} sizes="80px" />
          </div>
        ))}

        <p className="absolute left-[28%] right-[28%] top-[29%] truncate font-hollywood text-[clamp(12px,1.65vw,24px)] leading-tight text-[#147f83] [text-shadow:1px_1px_0_#fff3d2]">
          {match.venue ?? "Lokasi belum diatur"}
        </p>
        <p className="absolute left-[25%] right-[25%] top-[40%] truncate font-poppins text-[clamp(10px,1.25vw,18px)] font-extrabold leading-tight">
          {formatKickoff(match.scheduledAt)}
        </p>
        <Link
          href={`/schedule-result-main/detail-game?id=${match.id}&date=${dateKey}`}
          className="absolute left-1/2 top-[51%] -translate-x-1/2 rounded-[7px] border border-[#f6c475] bg-gradient-to-b from-[#c51610] to-[#760807] px-[clamp(10px,1.6vw,22px)] py-[clamp(3px,0.4vw,6px)] font-poppins text-[clamp(9px,0.9vw,13px)] font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,.28)] transition-[transform,background-color] hover:scale-[1.07] hover:from-[#d6211b] hover:to-[#8a0a09] active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44D1D1]"
        >
          Game Detail
        </Link>

        {showScore && (
          <p className="absolute left-[30%] right-[30%] top-[64%] flex items-center justify-center gap-[0.5em] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#760807] [text-shadow:1px_1px_0_#fff3d2]">
            {status === "LIVE" && (
              <span className="rounded-[4px] bg-[#c51610] px-[0.4em] font-poppins text-[0.6em] font-bold tracking-wider text-white [text-shadow:none]">
                LIVE
              </span>
            )}
            <span>
              {team1.score} – {team2.score}
            </span>
          </p>
        )}

        <p className={`absolute left-[8%] top-[64%] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#45b3ac] [text-shadow:1px_1px_0_#123b3a] ${dimmed(team1)}`}>
          {teamLabel(team1)}
        </p>
        <p className={`absolute right-[8%] top-[64%] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#45b3ac] [text-shadow:1px_1px_0_#123b3a] ${dimmed(team2)}`}>
          {teamLabel(team2)}
        </p>
      </div>
    </motion.article>
  );
}

/** Pembungkus kalender: animasi masuk + lebar strip (naik terus sampai 978px). */
function CalendarBlock({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={popSpringVariants}
      custom={0.12}
      className="relative z-0 -mt-0 w-[min(96vw,978px)] drop-shadow-[0_6px_16px_rgba(0,0,0,0.1)] md:-mt-[3vw] lg:-mt-[1.2vw]"
    >
      {children}
    </motion.div>
  );
}

function MatchesBanner() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={popPunchVariants}
      custom={{ delay: 0.22, rotation: -2 }}
    >
      <Image
        src="/svg/figma/matches.svg"
        alt="Matches"
        width={319}
        height={94}
        className="mt-3 h-auto w-[44vw] max-w-[319px] sm:mt-5 sm:w-[30vw]"
        loading="eager"
      />
    </motion.div>
  );
}

/** Tampilan sementara saat ?date= dibaca (Suspense): kalender kosong + banner. */
function ScheduleFallback() {
  return (
    <>
      <CalendarBlock>
        <CalendarStrip days={[]} selectedKey={null} onSelect={() => {}} status="loading" />
      </CalendarBlock>
      <MatchesBanner />
    </>
  );
}

const LIVE_REFRESH_MS = 60_000;

/**
 * Kalender hari pertandingan + daftar laga hari terpilih, dari GET /matches. Hari terpilih
 * disimpan di ?date= supaya bertahan saat reload. Data diperbarui diam-diam saat tab kembali
 * aktif dan tiap 60 detik selama ada laga LIVE di hari terpilih (gagal refresh tidak mengganti
 * tampilan dengan error).
 */
function MatchDaySchedule() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion() ?? false;
  const listRef = useRef<HTMLDivElement>(null);

  const { state, reload, setState } = useAsyncData(listMatches);
  const { days, unscheduled } = useMemo(
    () => (state.status === "ready" ? groupMatchesByWibDay(state.data) : { days: [], unscheduled: [] }),
    [state],
  );

  const [today] = useState(todayWib);
  const [picked, setPicked] = useState<string | null>(null);
  const selectedKey = pickDefaultDay(days, picked ?? searchParams.get("date"), today);
  const selectedDay = days.find((day) => day.dateKey === selectedKey);

  const selectDay = (dateKey: string) => {
    setPicked(dateKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateKey);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Daftar laga di luar layar (ponsel, layar laptop pendek): gulir ke sana.
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top > window.innerHeight) {
      list.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const refreshSilently = useCallback(() => {
    listMatches().then(
      (data) => setState({ status: "ready", data }),
      () => {},
    );
  }, [setState]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSilently();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshSilently]);

  const hasLiveMatch = selectedDay?.matches.some((match) => match.status === "LIVE") ?? false;
  useEffect(() => {
    if (!hasLiveMatch) return;
    const timer = setInterval(refreshSilently, LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [hasLiveMatch, refreshSilently]);

  return (
    <>
      <CalendarBlock>
        <CalendarStrip
          days={days}
          selectedKey={selectedKey}
          onSelect={selectDay}
          status={state.status}
          onRetry={reload}
        />
      </CalendarBlock>

      <MatchesBanner />

      {/* Laga hari terpilih: jumlah kartu selalu sama dengan "N laga" di kotak tanggalnya. */}
      <div
        ref={listRef}
        className="mt-2 flex w-[94vw] max-w-[1026px] scroll-mt-[calc(var(--navbar-height)+12px)] flex-col sm:w-[72vw] md:mt-[1.5vw] lg:w-[72vw]"
      >
        {selectedDay?.matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={popSpringVariants}
            custom={0.25 + index * 0.14}
            className={index > 0 ? "mt-4 sm:mt-6" : ""}
          >
            <MatchCard
              match={match}
              frame={CARD_FRAMES[index % CARD_FRAMES.length]}
              dateKey={selectedDay.dateKey}
            />
          </motion.div>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {selectedDay ? `${selectedDay.matches.length} laga pada ${formatMatchDay(selectedDay)}` : ""}
      </p>

      {state.status === "ready" && unscheduled.length > 0 && (
        <p className="mt-4 font-poppins text-sm font-semibold text-[#760807]">
          {unscheduled.length} laga belum dijadwalkan
        </p>
      )}
    </>
  );
}

export const ScheduleResultMainLandingSection = () => {
  return (
    <section
      aria-label="Schedule and Result"
      className="relative isolate overflow-hidden bg-[#f3e6ce] pb-5 pt-[calc(var(--navbar-height)+12px)] md:pt-[calc(var(--navbar-height)+12px)] lg:pt-[calc(var(--navbar-height)+16px)] sm:pb-6"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, transparent 0 125px, #f3e6ce 190px), repeating-conic-gradient(#f5ead6 0% 25%, #e9782d 0% 50%)",
        backgroundSize: "100% 100%, 36px 36px",
        backgroundPosition: "top left, top left",
      }}
    >
      <Image
        src="/images/Backgroundschedule.png"
        alt=""
        width={1440}
        height={1330}
        priority
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
      />

      <div className="relative z-10 mx-auto flex w-full flex-col items-center">
        {/* Title: SCHEDULE & RESULT (Entrance Pop Animation only, no continuous float) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={popSpringVariants}
          custom={0}
          className="flex justify-center"
        >
          <Image
            src="/svg/figma/schedule & result.svg"
            alt="Schedule and Result"
            width={891}
            height={136}
            sizes="(max-width: 639px) 88vw, (max-width: 1023px) 64vw, 891px"
            className="h-auto w-[88vw] max-w-[891px] sm:w-[64vw]"
            priority
          />
        </motion.div>

        {/* Kalender, banner MATCHES, dan daftar laga berbagi hari terpilih (?date=), jadi
            ketiganya di dalam Suspense supaya halaman tetap bisa di-prerender. */}
        <Suspense fallback={<ScheduleFallback />}>
          <MatchDaySchedule />
        </Suspense>
      </div>
    </section>
  );
};

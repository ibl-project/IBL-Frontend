"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";
import { todayWib } from "@/lib/datetime";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { listMatches } from "@/lib/matchesApi";
import { groupMatchesByWibDay, pickDefaultDay } from "@/lib/scheduleDays";
import { CalendarStrip } from "./CalendarStrip";

interface MatchFixture {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  date: string;
  frame: string;
}

const fixtures: MatchFixture[] = [
  {
    id: 1,
    team1: "Team 1",
    team2: "Team 2",
    venue: "lapangan ITS",
    date: "10 Okt 2026 19.00 WIB",
    frame: "/svg/figma/Box Tim 12.svg",
  },
  {
    id: 2,
    team1: "Team 3",
    team2: "Team 4",
    venue: "lapangan ITS",
    date: "10 Okt 2026 19.00 WIB",
    frame: "/svg/figma/Box Tim 34.svg",
  },
];

function MatchCard({ fixture }: { fixture: MatchFixture }) {
  return (
    <motion.article
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className="relative w-full cursor-pointer"
    >
      <Image
        src={fixture.frame}
        alt=""
        width={1026}
        height={327}
        className="block h-auto w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        loading="eager"
      />
      <div className="absolute inset-0 text-center text-[#101010]">
        <div className="absolute left-[8%] top-[22%] h-[38%]">
          <Image
            src="/images/LOGO_1.svg"
            alt={`${fixture.team1} logo`}
            width={73}
            height={77}
            className="h-full w-auto"
            loading="eager"
          />
          <motion.div
            animate={{ rotate: [-18, -14, -18], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[31%] top-[37%] w-[62%] pointer-events-none"
          >
            <Image
              src="/images/ibl2k26login.png"
              alt=""
              width={552}
              height={523}
              className="w-full h-auto"
              loading="eager"
            />
          </motion.div>
        </div>
        <div className="absolute right-[8%] top-[22%] h-[38%]">
          <Image
            src="/images/LOGO_1.svg"
            alt={`${fixture.team2} logo`}
            width={73}
            height={77}
            className="h-full w-auto"
            loading="eager"
          />
          <motion.div
            animate={{ rotate: [-18, -14, -18], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute left-[31%] top-[37%] w-[62%] pointer-events-none"
          >
            <Image
              src="/images/ibl2k26login.png"
              alt=""
              width={552}
              height={523}
              className="w-full h-auto"
              loading="eager"
            />
          </motion.div>
        </div>

        <p className="absolute left-[28%] right-[28%] top-[29%] truncate font-hollywood text-[clamp(12px,1.65vw,24px)] leading-tight text-[#147f83] [text-shadow:1px_1px_0_#fff3d2]">
          {fixture.venue}
        </p>
        <p className="absolute left-[25%] right-[25%] top-[40%] truncate font-poppins text-[clamp(10px,1.25vw,18px)] font-extrabold leading-tight">
          {fixture.date}
        </p>
        <Link
          href={`/schedule-result-main/detail-game?id=${fixture.id}`}
          className="contents"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute left-1/2 top-[51%] -translate-x-1/2 rounded-[7px] border border-[#f6c475] bg-gradient-to-b from-[#c51610] to-[#760807] px-[clamp(10px,1.6vw,22px)] py-[clamp(3px,0.4vw,6px)] font-poppins text-[clamp(9px,0.9vw,13px)] font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,.28)] transition-colors hover:from-[#d6211b] hover:to-[#8a0a09]"
          >
            Game Detail
          </motion.button>
        </Link>
        <p className="absolute left-[8%] top-[64%] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#45b3ac] [text-shadow:1px_1px_0_#123b3a]">
          {fixture.team1}
        </p>
        <p className="absolute right-[8%] top-[64%] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#45b3ac] [text-shadow:1px_1px_0_#123b3a]">
          {fixture.team2}
        </p>
      </div>
    </motion.article>
  );
}

const LIVE_REFRESH_MS = 60_000;

/**
 * Kalender hari pertandingan dari GET /matches. Hari terpilih disimpan di ?date= supaya
 * bertahan saat reload. Data diperbarui diam-diam saat tab kembali aktif dan tiap 60 detik
 * selama ada laga LIVE di hari terpilih (gagal refresh tidak mengganti tampilan dengan error).
 */
function MatchDayCalendar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { state, reload, setState } = useAsyncData(listMatches);
  const days = useMemo(
    () => (state.status === "ready" ? groupMatchesByWibDay(state.data).days : []),
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
    <CalendarStrip
      days={days}
      selectedKey={selectedKey}
      onSelect={selectDay}
      status={state.status}
      onRetry={reload}
    />
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

        {/* Calendar Grouping (Entrance Pop Animation only, no continuous float) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={popSpringVariants}
          custom={0.12}
          className="relative z-0 -mt-0 w-[min(96vw,978px)] drop-shadow-[0_6px_16px_rgba(0,0,0,0.1)] md:-mt-[3vw] lg:-mt-[1.2vw]"
        >
          {/* useSearchParams (?date=) butuh Suspense supaya halaman tetap bisa di-prerender. */}
          <Suspense fallback={<CalendarStrip days={[]} selectedKey={null} onSelect={() => {}} status="loading" />}>
            <MatchDayCalendar />
          </Suspense>
        </motion.div>

        {/* MATCHES Banner (Entrance Punch Animation only, no continuous float) */}
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

        {/* Fixtures List */}
        <div className="mt-2 flex w-[94vw] max-w-[1026px] flex-col sm:w-[72vw] md:mt-[1.5vw] lg:w-[72vw]">
          {fixtures.map((fixture, index) => (
            <motion.div
              key={fixture.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={popSpringVariants}
              custom={0.25 + index * 0.14}
              className={index > 0 ? "mt-4 sm:mt-6" : ""}
            >
              <MatchCard fixture={fixture} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

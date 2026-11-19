"use client";

import React, { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { popSpringVariants } from "@/lib/animations";
import { useCountdown } from "@/lib/hooks/useCountdown";
import ClockPanelDesktop from "@/public/images/countdown/clock-panel-desktop.svg";
import CounterUnitFrameDesktop from "@/public/images/countdown/counter-unit-frame-desktop.svg";
import ScoreboardShellDesktop from "@/public/images/countdown/scoreboard-shell-desktop.svg";
import DayText from "@/public/texts/countdown/day.svg";
import MonthText from "@/public/texts/countdown/month.svg";
import OpenRegistText from "@/public/texts/countdown/open-regist.svg";
import RegistTeamSoonText from "@/public/texts/countdown/regist-team-soon.svg";
import type { CountdownTime } from "@/types/register";

/**
 * Tanggal Target Countdown: 14 September 2026, 18:00 WIB
 */
export const COUNTDOWN_TARGET = new Date("2026-09-14T18:00:00+07:00");
const ZERO_TIME: CountdownTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
const SCOREBOARD_FONT = { fontFamily: '"DSEG7ClassicMini", monospace' };

const padTwo = (value: number) => String(value).padStart(2, "0");

const CounterUnit = ({ value, label, alt }: { value: string; label: typeof DayText; alt: string }) => (
  <div className="flex w-[clamp(28px,calc(100vw*88/1440),88px)] shrink-0 flex-col items-center">
    <div className="relative z-10 mb-[-4%] h-[clamp(10px,calc(100vw*28/1440),28px)] w-[125%]">
      <Image src={label} alt={alt} fill className="object-contain" />
    </div>
    <div className="relative aspect-[112/113] w-full overflow-hidden">
      <Image
        src={CounterUnitFrameDesktop}
        alt=""
        className="absolute top-[-35.4%] left-0 h-[135.4%] w-full max-w-none"
        sizes="112px"
      />
      <div className="absolute inset-x-[6%] inset-y-[5%] grid grid-cols-2 place-items-center overflow-hidden">
        {value.split("").map((digit, index) => (
          <span
            key={`${digit}-${index}`}
            className="text-[clamp(0.75rem,calc(100vw*34/1440),3.4rem)] leading-none font-bold text-white drop-shadow-[0_0.07em_0_#5b0a0a]"
            style={SCOREBOARD_FONT}
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const ActiveRegisterCta = () => (
  <div className="flex min-w-0 flex-col items-center pt-[2%] text-center">
    <p className="z-40 max-w-[24ch] text-[clamp(0.5rem,calc(100vw*15.5/1440),1.55rem)] leading-[1.05] font-black text-[#9b0000] drop-shadow-[0.04em_0.06em_0_#f4d8bd]">
      Siap bertanding? Klik tombol sebelum waktu pendaftaran berakhir!
    </p>
    <Link
      href="/registration"
      className="mt-[6%] rounded-[7px] bg-gradient-to-b from-[#d60000] to-[#850000] px-[clamp(12px,calc(100vw*40/1440),54px)] py-[clamp(4px,calc(100vw*12/1440),16px)] text-[clamp(0.55rem,calc(100vw*14/1440),1.45rem)] leading-none font-extrabold text-white shadow-[0_0.08em_0_#4a0000] transition-all hover:brightness-110 active:scale-95"
    >
      Register Now
    </Link>
  </div>
);

const Scoreboard = ({
  isClockOn,
  remaining,
  selectedDate,
}: {
  isClockOn: boolean;
  remaining: CountdownTime;
  selectedDate: Date;
}) => {
  const statusText = isClockOn ? OpenRegistText : RegistTeamSoonText;
  const targetDay = padTwo(selectedDate.getDate());
  const targetMonth = padTwo(selectedDate.getMonth() + 1);
  const totalHours = remaining.days * 24 + remaining.hours;
  const timerText = isClockOn
    ? "00:00:00"
    : `${String(totalHours).padStart(2, "0")}:${padTwo(remaining.minutes)}:${padTwo(remaining.seconds)}`;

  return (
    <div
      className="relative mx-auto w-[calc(100%*1254.18/1440)]"
      style={{
        aspectRatio: "1254.18 / 859",
      }}
    >
      {/* 1. Scoreboard Shell - Layer 1 (Pops in 1st) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.1}
        className="absolute inset-0 h-full w-full"
      >
        <Image
          src={ScoreboardShellDesktop}
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 1440px) 1255px, 90vw"
        />
      </motion.div>

      {/* 2. Clock Panel - Layer 2 (Pops in 2nd) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.3}
        className="absolute top-[29.9%] left-[19.8%] aspect-[758/280] w-[60.4%]"
      >
        <Image src={ClockPanelDesktop} alt="" fill className="object-contain" sizes="(min-width: 1440px) 760px, 60vw" />
        <Image
          src={statusText}
          alt={isClockOn ? "Open Regist" : "Regist Team Soon"}
          className="absolute top-[5%] left-1/2 w-[63%] -translate-x-1/2"
        />
        <span
          className="absolute top-[63%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(1.05rem,calc(100vw*72/1440),6.1rem)] leading-none font-bold text-white drop-shadow-[-0.04em_0.01em_0.04em_#5b0a0a]"
          style={SCOREBOARD_FONT}
        >
          {timerText}
        </span>
      </motion.div>

      {/* 3. Counter Units - Layer 3 (Pops in 3rd) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={popSpringVariants}
        custom={0.48}
        className="absolute top-[63%] left-[19.5%] z-20 grid w-[61%] grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-[7%]"
      >
        <CounterUnit value={targetDay} label={DayText} alt="Day" />
        {isClockOn ? <ActiveRegisterCta /> : <div />}
        <CounterUnit value={targetMonth} label={MonthText} alt="Month" />
      </motion.div>
    </div>
  );
};

type CountdownOverride = "auto" | "running" | "expired" | "demo";

// URL tidak berubah tanpa reload, jadi tidak ada yang perlu di-subscribe.
const subscribeNoop = () => () => {};

/** Baca ?countdown=expired | running | demo (selain itu "auto"). */
function readCountdownParam(): CountdownOverride {
  const param = new URLSearchParams(window.location.search).get("countdown");
  return param === "expired" || param === "running" || param === "demo" ? param : "auto";
}

export const CountdownSection = () => {
  /**
   * Mode Uji Coba Manual:
   * - "auto"    : Mengikuti tanggal asli (14 Sept 2026).
   * - "running" : Memaksa status REGIST TEAM SOON! & timer berjalan.
   * - "expired" : Memaksa status OPEN REGIST! + tombol Register Now.
   */
  const DEBUG_COUNTDOWN_MODE: "auto" | "running" | "expired" = "auto";

  // Server & render pertama selalu "auto" (aman dari hydration mismatch), lalu nilai dari URL.
  const overrideMode = useSyncExternalStore(subscribeNoop, readCountdownParam, () => "auto" as const);
  // Demo countdown 10 detik dari saat komponen dipasang
  const [demoTarget] = useState(() => new Date(Date.now() + 10000));

  const activeTarget = overrideMode === "demo" ? demoTarget : COUNTDOWN_TARGET;
  const { time: remaining, isFinished } = useCountdown(activeTarget);

  // Menentukan apakah pendaftaran sudah dibuka (waktu habis):
  const effectiveMode = overrideMode !== "auto" ? overrideMode : DEBUG_COUNTDOWN_MODE;
  const isRegistrationOpen = effectiveMode === "expired" ? true : effectiveMode === "running" ? false : isFinished;

  const displayTime = isRegistrationOpen ? ZERO_TIME : remaining;

  return (
    <section className="relative mx-auto w-full max-w-[1440px] overflow-hidden bg-transparent px-0 py-0 text-[#1D1D1B] select-none md:origin-center md:scale-[0.75]">
      <div className="flex w-full flex-col items-center">
        <Scoreboard isClockOn={isRegistrationOpen} remaining={displayTime} selectedDate={COUNTDOWN_TARGET} />
      </div>
    </section>
  );
};

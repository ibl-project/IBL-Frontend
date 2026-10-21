"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";

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

function MatchCard({
  fixture,
  onDetails,
}: {
  fixture: MatchFixture;
  onDetails: (fixture: MatchFixture) => void;
}) {
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
        <motion.button
          type="button"
          onClick={() => onDetails(fixture)}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute left-1/2 top-[51%] -translate-x-1/2 rounded-[7px] border border-[#f6c475] bg-gradient-to-b from-[#c51610] to-[#760807] px-[clamp(10px,1.6vw,22px)] py-[clamp(3px,0.4vw,6px)] font-poppins text-[clamp(9px,0.9vw,13px)] font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,.28)] transition-colors hover:from-[#d6211b] hover:to-[#8a0a09]"
        >
          Game Detail
        </motion.button>
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

export const ScheduleResultMainLandingSection = () => {
  const [selectedFixture, setSelectedFixture] = useState<MatchFixture | null>(null);

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
        {/* Title: SCHEDULE & RESULT */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={popSpringVariants}
          custom={0}
          className="flex justify-center"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
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
        </motion.div>

        {/* Calendar Grouping */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={popSpringVariants}
          custom={0.12}
          className="relative z-0 -mt-0 w-[96vw] max-w-[978px] md:-mt-[3vw] md:w-[70vw] lg:-mt-[1.2vw] lg:w-[978px]"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <Image
              src="/svg/figma/calendar grouping.svg"
              alt="Jadwal pertandingan Senin 5 sampai Jumat 9 Oktober, satu sampai lima pertandingan per hari"
              width={978}
              height={243}
              sizes="(max-width: 639px) 96vw, (max-width: 1023px) 70vw, 978px"
              className="block h-auto w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.1)]"
              priority
            />
          </motion.div>
        </motion.div>

        {/* MATCHES Banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={popPunchVariants}
          custom={{ delay: 0.22, rotation: -2 }}
        >
          <motion.div
            animate={{ y: [-3, 3, -3], rotate: [-0.6, 0.6, -0.6] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
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
              <MatchCard fixture={fixture} onDetails={setSelectedFixture} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Dialog with AnimatePresence */}
      <AnimatePresence>
        {selectedFixture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedFixture(null);
            }}
          >
            <motion.section
              initial={{ scale: 0.72, opacity: 0, y: 25, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0, y: 15, rotate: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.8 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="fixture-detail-title"
              className="relative w-full max-w-[440px] border-[3px] border-[#f39a2c] bg-[#fff4d5] p-6 text-center shadow-[8px_8px_0_#351513]"
            >
              <motion.button
                type="button"
                aria-label="Tutup detail pertandingan"
                onClick={() => setSelectedFixture(null)}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute right-3 top-3 flex size-9 items-center justify-center text-[#7e0802] transition-colors hover:bg-[#f3dfb6] rounded-full"
              >
                <X size={21} />
              </motion.button>
              <h2 id="fixture-detail-title" className="font-hollywood text-2xl text-[#7e0802]">
                Game Detail
              </h2>
              <p className="mt-5 font-hollywood text-xl text-[#147f83]">
                {selectedFixture.team1} vs {selectedFixture.team2}
              </p>
              <p className="mt-2 font-poppins text-sm font-semibold">{selectedFixture.venue}</p>
              <p className="font-poppins text-sm">{selectedFixture.date}</p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

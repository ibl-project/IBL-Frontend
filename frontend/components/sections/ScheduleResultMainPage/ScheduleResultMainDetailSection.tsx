"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";

interface MatchFixtureData {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  date: string;
  quarterScores: {
    team1: (number | string)[];
    team2: (number | string)[];
  };
  stats: {
    label: string;
    team1: string;
    team2: string;
  }[];
}

const matchFixturesData: Record<number, MatchFixtureData> = {
  1: {
    id: 1,
    team1: "Team 1",
    team2: "Team 2",
    venue: "lapangan ITS",
    date: "10 Okt 2026 19.00 WIB",
    quarterScores: {
      team1: ["-", "-", "-", "-", "-"],
      team2: ["-", "-", "-", "-", "-"],
    },
    stats: [
      { label: "Field Goals", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "2 Points", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "3 Points", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "Free Throws", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "Rebounds (O/D)", team1: "0/0", team2: "0/0" },
      { label: "Assist", team1: "0", team2: "0" },
    ],
  },
  2: {
    id: 2,
    team1: "Team 3",
    team2: "Team 4",
    venue: "lapangan ITS",
    date: "10 Okt 2026 19.00 WIB",
    quarterScores: {
      team1: ["-", "-", "-", "-", "-"],
      team2: ["-", "-", "-", "-", "-"],
    },
    stats: [
      { label: "Field Goals", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "2 Points", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "3 Points", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "Free Throws", team1: "0/0 (0%)", team2: "0/0 (0%)" },
      { label: "Rebounds (O/D)", team1: "0/0", team2: "0/0" },
      { label: "Assist", team1: "0", team2: "0" },
    ],
  },
};

export const ScheduleResultMainDetailSection: React.FC = () => {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const fixtureId = idParam ? parseInt(idParam, 10) : 1;
  const fixture = matchFixturesData[fixtureId] || matchFixturesData[1];

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

      <div className="relative z-10 mx-auto flex w-full max-w-[920px] flex-col items-center px-3 sm:px-6">
        {/* Navigation & Back Action */}
        <div className="mb-2 flex w-full max-w-[820px] justify-start sm:mb-4">
          <Link
            href="/schedule-result-main"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-[#760807] bg-[#fff5df] px-3.5 py-1.5 font-poppins text-xs font-bold text-[#760807] shadow-[2px_2px_0_#380606] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[3px_3px_0_#380606] sm:text-sm"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 sm:size-4" />
            <span>Kembali ke Jadwal</span>
          </Link>
        </div>

        {/* Unified Match Graphic (Backboard + Ring + Net + Red Summary Box + Table) */}
        <motion.article
          initial="hidden"
          animate="visible"
          variants={popSpringVariants}
          custom={0}
          className="relative z-20 w-full max-w-[820px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
        >
          {/* Main Coordinate Frame 1080 x 1160 */}
          <div className="relative w-full aspect-[1080/1160]">
            {/* Layer 1: Red Textbox Summary Box (Positioned under backboard, beneath ring and net) */}
            <div className="absolute left-0 top-[39.5%] z-10 w-full aspect-[1074/650]">
              <Image
                src="/images/Textbox%20summary.png"
                alt="Summary Box"
                fill
                priority
                className="pointer-events-none object-contain select-none"
              />
            </div>

            {/* Layer 2: Basketball Backboard + Ring & Net (In front of Red Box, behind SUMMARY) */}
            <div className="absolute left-0 top-0 z-20 w-full aspect-[1080/761]">
              <Image
                src="/images/ring.png"
                alt="Basketball Backboard"
                fill
                priority
                className="pointer-events-none relative z-10 object-contain select-none"
              />

              {/* Team 1 & 2 Header with Venue and Logos (team12 group.svg) */}
              <div className="absolute left-1/2 top-[10.5%] z-20 w-[73.5%] -translate-x-1/2 aspect-[794/211]">
                <Image
                  src="/svg/figma/team12%20group.svg"
                  alt="Teams Match Header"
                  fill
                  priority
                  className="object-contain select-none"
                />
              </div>

              {/* Quarter Scores Table Box (tablebox ring.svg) */}
              <div className="absolute left-1/2 top-[36.5%] z-20 w-[67.6%] -translate-x-1/2 aspect-[730/233]">
                <Image
                  src="/svg/figma/tablebox%20ring.svg"
                  alt=""
                  fill
                  priority
                  className="pointer-events-none object-contain select-none"
                />

                {/* Table Content inside the tablebox frame */}
                <div className="absolute left-[3.5%] top-[8.5%] h-[72.5%] w-[93%] overflow-hidden">
                  <table className="h-full w-full border-collapse text-center">
                    <thead>
                      <tr className="font-poppins text-[clamp(7px,1.15vw,14px)] font-black text-[#101010]">
                        <th className="w-[28%] border-b border-r border-[#7E0202]/50 px-1 py-0.5">Team</th>
                        <th className="w-[14.4%] border-b border-r border-[#7E0202]/50 px-0.5 py-0.5">1st</th>
                        <th className="w-[14.4%] border-b border-r border-[#7E0202]/50 px-0.5 py-0.5">2nd</th>
                        <th className="w-[14.4%] border-b border-r border-[#7E0202]/50 px-0.5 py-0.5">3rd</th>
                        <th className="w-[14.4%] border-b border-r border-[#7E0202]/50 px-0.5 py-0.5">4th</th>
                        <th className="w-[14.4%] border-b border-[#7E0202]/50 px-0.5 py-0.5">Total</th>
                      </tr>
                    </thead>
                    <tbody className="font-poppins text-[clamp(7px,1.1vw,14px)] font-bold text-[#101010]">
                      <tr className="border-b border-[#7E0202]/50">
                        <td className="border-r border-[#7E0202]/50 px-1 py-0.5 font-black text-[#7E0202]">
                          {fixture.team1}
                        </td>
                        {fixture.quarterScores.team1.map((score, idx) => (
                          <td
                            key={idx}
                            className={`${idx < 4 ? "border-r border-[#7E0202]/50" : ""} px-0.5 py-0.5`}
                          >
                            {score}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border-r border-[#7E0202]/50 px-1 py-0.5 font-black text-[#7E0202]">
                          {fixture.team2}
                        </td>
                        {fixture.quarterScores.team2.map((score, idx) => (
                          <td
                            key={idx}
                            className={`${idx < 4 ? "border-r border-[#7E0202]/50" : ""} px-0.5 py-0.5`}
                          >
                            {score}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Layer 3: Cyan Summary Table (Inside Red Box, with generous margins) */}
            <div className="absolute left-1/2 top-[53.2%] z-25 w-[70.4%] -translate-x-1/2 aspect-[760/390]">
              <Image
                src="/svg/figma/Tabel%20Summary.svg"
                alt="Match Summary Table"
                fill
                priority
                className="object-contain select-none"
              />
            </div>

            {/* Layer 4: SUMMARY 3D Banner (Overlapping the net and top of the red box) */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={popPunchVariants}
              custom={{ delay: 0.15, rotation: 0 }}
              className="absolute left-1/2 top-[41.8%] z-30 w-[51.8%] -translate-x-1/2 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
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
          </div>
        </motion.article>
      </div>
    </section>
  );
};


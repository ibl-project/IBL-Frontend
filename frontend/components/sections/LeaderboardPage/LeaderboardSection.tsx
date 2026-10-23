"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { popSpringVariants, popPunchVariants } from "@/lib/animations";

export interface LeaderboardEntry {
  name: string;
  team: string;
  games: number | string;
  total: number | string;
  average: number | string;
}

type LeaderboardKey = "points" | "assists" | "rebounds";

interface LeaderboardSectionProps {
  leaderboards?: Partial<Record<LeaderboardKey, LeaderboardEntry[]>>;
}

interface CategoryConfig {
  key: LeaderboardKey;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  color: string;
  darkColor: string;
  gradientStops: { offset: string; color: string }[];
  strokeColor: string;
  ornaments: {
    src: string;
    width: number;
    height: number;
    className: string;
    initialRotate?: number;
    floatY?: number[];
    floatRotate?: number[];
    floatDuration?: number;
  }[];
}

const categories: CategoryConfig[] = [
  {
    key: "points",
    title: "GET BUCKETS",
    image: "/svg/figma/get bucckets (top points).svg",
    imageWidth: 842,
    imageHeight: 105,
    color: "#bd281f",
    darkColor: "#7e0809",
    gradientStops: [
      { offset: "0%", color: "#E52E1C" },
      { offset: "50%", color: "#EA6325" },
      { offset: "100%", color: "#F6B553" },
    ],
    strokeColor: "#1A1615",
    ornaments: [
      {
        src: "/images/announcement/star.svg",
        width: 311,
        height: 249,
        className:
          "-left-[5%] top-[4%] w-[10vw] max-w-[96px] sm:-left-[8%] sm:top-[0%] sm:w-[5.5vw]",
        initialRotate: -5,
        floatY: [-6, 6, -6],
        floatRotate: [-3, 3, -3],
        floatDuration: 4.2,
      },
      {
        src: "/svg/figma/basketapi.svg",
        width: 370,
        height: 489,
        className:
          "-right-[12%] top-[-1%] w-[12vw] max-w-[44px] sm:-right-[33%] sm:top-[-8%] sm:w-[22vw] sm:max-w-[370px]",
        initialRotate: 4,
        floatY: [-8, 8, -8],
        floatRotate: [-2, 2, -2],
        floatDuration: 5.0,
      },
    ],
  },
  {
    key: "assists",
    title: "DROP DIMES",
    image: "/svg/figma/drop dimes (top assist).svg",
    imageWidth: 852,
    imageHeight: 108,
    color: "#49b7b4",
    darkColor: "#167d82",
    gradientStops: [
      { offset: "0%", color: "#3DB8BA" },
      { offset: "50%", color: "#76D3C8" },
      { offset: "100%", color: "#FCD69B" },
    ],
    strokeColor: "#182020",
    ornaments: [
      {
        src: "/images/hat.png",
        width: 234,
        height: 207,
        className:
          "-left-[14%] top-[-2%] w-[15vw] max-w-[58px] sm:-left-[18%] sm:top-[2%] sm:w-[11vw] sm:max-w-[160px]",
        initialRotate: -6,
        floatY: [-7, 7, -7],
        floatRotate: [-3, 3, -3],
        floatDuration: 4.6,
      },
      {
        src: "/svg/figma/hiasan top assist.svg",
        width: 113,
        height: 85,
        className:
          "-right-[8%] top-[0%] w-[9vw] max-w-[38px] sm:-right-[14%] sm:top-[-2%] sm:w-[6vw] sm:max-w-[80px] md:-right-[15%]",
        initialRotate: 2,
        floatY: [-5, 5, -5],
        floatRotate: [-2, 2, -2],
        floatDuration: 4.2,
      },
    ],
  },
  {
    key: "rebounds",
    title: "CRASH THE GLASS",
    image: "/svg/figma/crash the glass (top rebounds).svg",
    imageWidth: 1043,
    imageHeight: 137,
    color: "#f39a2c",
    darkColor: "#de5d18",
    gradientStops: [
      { offset: "0%", color: "#DE5117" },
      { offset: "50%", color: "#F08524" },
      { offset: "100%", color: "#FCD14F" },
    ],
    strokeColor: "#1A1715",
    ornaments: [
      {
        src: "/svg/figma/star kuning.svg",
        width: 284,
        height: 436,
        // Star positioned right at the edge (pas di ujung) with flex flex-row justify-end
        className:
          "-right-[10%] top-[6%] flex flex-row justify-end w-[16vw] max-w-[65px] sm:-right-[26%] sm:top-[4%] sm:w-[20vw] sm:max-w-[230px] md:-right-[30%] lg:-right-[32%]",
        initialRotate: 2,
        floatY: [-8, 8, -8],
        floatRotate: [-2.5, 2.5, -2.5],
        floatDuration: 4.8,
      },
    ],
  },
];

const demoEntries = (): LeaderboardEntry[] =>
  Array.from({ length: 5 }, (_, index) => ({
    name: `nama pemain ${index + 1}`,
    team: "nama himpunan",
    games: 0,
    total: 0,
    average: 0,
  }));

function LeaderboardTable({
  categoryKey,
  title,
  color,
  darkColor,
  gradientStops,
  strokeColor,
  entries,
}: {
  categoryKey: LeaderboardKey;
  title: string;
  color: string;
  darkColor: string;
  gradientStops: { offset: string; color: string }[];
  strokeColor: string;
  entries: LeaderboardEntry[];
}) {
  return (
    <div
      className="overflow-hidden rounded-[8px] border-2 shadow-[3px_4px_0_rgba(0,0,0,0.4)] sm:rounded-[16px] sm:border-4"
      style={{ borderColor: color }}
    >
      <table className="w-full table-fixed border-collapse text-center font-poppins text-[clamp(9px,1.7vw,24px)] leading-none">
        <caption className="sr-only">{title} leaderboard</caption>
        <colgroup>
          <col className="w-[8%]" />
          <col className="w-[57%]" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead>
          <tr className="h-[clamp(16px,5.25vw,22px)] text-white sm:h-[clamp(32px,3.7vw,53px)]">
            {["NO", "NAME", "GAME", "TOTAL", "AVG"].map((label) => (
              <th
                key={label}
                scope="col"
                className="border-r border-white/80 px-1 font-bold last:border-r-0 sm:border-r-2"
                style={{
                  backgroundImage: `linear-gradient(180deg, ${color} 0%, ${darkColor} 100%)`,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 5).map((entry, index) => (
            <tr
              key={`${entry.name}-${index}`}
              className="h-[clamp(19px,6.15vw,26px)] border-t text-[#151515] sm:h-[clamp(42px,4.75vw,68px)] sm:border-t-2"
              style={{ backgroundColor: "#fff8df", borderColor: color }}
            >
              <td
                className="border-r px-1 font-bold sm:border-r-2"
                style={{ borderColor: color }}
              >
                {index + 1}
              </td>
              <td
                className="border-r px-2 py-0.5 text-left sm:border-r-2 sm:py-1"
                style={{ borderColor: color }}
              >
                <div className="flex flex-col justify-center">
                  <svg
                    viewBox="0 0 500 42"
                    preserveAspectRatio="xMinYMid meet"
                    className="h-[clamp(13px,3.8vw,19px)] w-auto max-w-full sm:h-[clamp(24px,2.4vw,36px)]"
                    style={{ overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient
                        id={`grad-${categoryKey}-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        {gradientStops.map((stop, i) => (
                          <stop key={i} offset={stop.offset} stopColor={stop.color} />
                        ))}
                      </linearGradient>
                    </defs>
                    <text
                      x="2"
                      y="32"
                      fontFamily="var(--font-drowner), sans-serif"
                      fontSize="32"
                      fill={`url(#grad-${categoryKey}-${index})`}
                      stroke={strokeColor}
                      strokeWidth="3.2"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                      className="select-none tracking-wide"
                    >
                      {entry.name}
                    </text>
                  </svg>
                  <span className="block truncate font-poppins text-[7px] leading-tight text-[#151515] sm:text-[clamp(11px,1.2vw,17px)]">
                    {entry.team}
                  </span>
                </div>
              </td>
              {[entry.games, entry.total, entry.average].map((value, valueIndex) => (
                <td
                  key={`${entry.name}-${valueIndex}`}
                  className="border-r px-0.5 font-bold text-[#151515] last:border-r-0 sm:border-r-2 sm:text-[clamp(13px,1.35vw,19px)]"
                  style={{ borderColor: color }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeaderboardSection({ leaderboards = {} }: LeaderboardSectionProps) {
  return (
    <section
      aria-label="Leaderboard IBL 2K26"
      className="relative isolate min-h-[calc(100vw*540/320)] overflow-hidden pb-[6vw] pt-[calc(var(--navbar-height)+8px)] sm:min-h-0 sm:pb-8 sm:pt-[calc(var(--navbar-height)+0.5vw)]"
    >
      <Image
        src="/images/backgroundleaderboard.png"
        alt=""
        width={1440}
        height={1869}
        priority
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
      />

      <div className="relative z-20 mx-auto flex w-[82%] max-w-[980px] flex-col gap-y-[0.5vw] sm:w-[60%] sm:gap-y-[0.2vw]">
        {categories.map((category, catIndex) => (
          <section key={category.key} aria-label={category.title} className="relative isolate">
            {category.ornaments.map((ornament, ornIndex) => (
              <motion.div
                key={ornament.src}
                aria-hidden="true"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={popPunchVariants}
                custom={{
                  delay: 0.2 + ornIndex * 0.1,
                  rotation: ornament.initialRotate ?? 0,
                }}
                className={`pointer-events-none absolute z-0 ${ornament.className}`}
              >
                <motion.div
                  animate={{
                    y: ornament.floatY ?? [-6, 6, -6],
                    rotate: ornament.floatRotate ?? [-2, 2, -2],
                  }}
                  transition={{
                    duration: ornament.floatDuration ?? 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-auto w-full"
                >
                  <Image
                    src={ornament.src}
                    alt=""
                    width={ornament.width}
                    height={ornament.height}
                    className="h-auto w-full"
                    loading="eager"
                  />
                </motion.div>
              </motion.div>
            ))}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={popSpringVariants}
              custom={catIndex * 0.15}
              className="relative z-10 flex flex-col gap-[5px] sm:gap-0"
            >
              <Image
                src={category.image}
                alt={`${category.title} leaderboard`}
                width={category.imageWidth}
                height={category.imageHeight}
                sizes="(max-width: 639px) 87vw, 70vw"
                className="-ml-[8%] h-auto w-[116%] max-w-none"
                loading="eager"
              />
              <LeaderboardTable
                categoryKey={category.key}
                title={category.title}
                color={category.color}
                darkColor={category.darkColor}
                gradientStops={category.gradientStops}
                strokeColor={category.strokeColor}
                entries={leaderboards[category.key] ?? demoEntries()}
              />
            </motion.div>
          </section>
        ))}
      </div>
    </section>
  );
}
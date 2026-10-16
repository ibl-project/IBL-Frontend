import Image from "next/image";

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

const categories: {
  key: LeaderboardKey;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  color: string;
  darkColor: string;
  ornaments: {
    src: string;
    width: number;
    height: number;
    className: string;
  }[];
}[] = [
  {
    key: "points",
    title: "GET BUCKETS",
    image: "/svg/figma/get bucckets (top points).svg",
    imageWidth: 842,
    imageHeight: 105,
    color: "#bd281f",
    darkColor: "#7e0809",
    ornaments: [
      {
        src: "/images/announcement/star.svg",
        width: 311,
        height: 249,
        className:
          "-left-[5%] top-[4%] w-[10vw] max-w-[96px] sm:-left-[8%] sm:top-[0%] sm:w-[5.5vw]",
      },
      {
        src: "/svg/figma/basketapi.svg",
        width: 370,
        height: 489,
        className:
          "-right-[12%] top-[-1%] w-[12vw] max-w-[44px] sm:-right-[33%] sm:top-[-8%] sm:w-[22vw] sm:max-w-[370px]",
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
    ornaments: [
      {
        src: "/images/hat.png",
        width: 234,
        height: 207,
        className:
          "-left-[14%] top-[-2%] w-[15vw] max-w-[58px] sm:-left-[18%] sm:top-[2%] sm:w-[11vw] sm:max-w-[160px]",
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
    ornaments: [
      {
        src: "/svg/figma/star kuning.svg",
        width: 284,
        height: 436,
        className:
          "-right-[18%] top-[12%] w-[15vw] max-w-[58px] sm:-right-[24%] sm:top-[12%] sm:w-[16vw] sm:max-w-[230px]",
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
  title,
  color,
  darkColor,
  entries,
}: {
  title: string;
  color: string;
  darkColor: string;
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
                className="border-r border-black/70 px-1 font-bold last:border-r-0 sm:border-r-2"
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
              <td className="border-r border-black/65 px-1 font-bold sm:border-r-2">{index + 1}</td>
              <td className="border-r border-black/65 px-2 text-left sm:border-r-2">
                <span className="block truncate font-hollywood text-[clamp(10px,3vw,13px)] leading-[1.05] sm:text-[clamp(18px,2.15vw,31px)]">
                  {entry.name}
                </span>
                <span className="mt-0.5 block truncate text-[7px] leading-none sm:text-[clamp(11px,1.2vw,17px)]">
                  {entry.team}
                </span>
              </td>
              {[entry.games, entry.total, entry.average].map((value, valueIndex) => (
                <td
                  key={`${entry.name}-${valueIndex}`}
                  className="border-r border-black/65 px-0.5 last:border-r-0 sm:border-r-2 sm:text-[clamp(13px,1.35vw,19px)]"
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
        {categories.map((category) => (
          <section key={category.key} aria-label={category.title} className="relative isolate">
            {category.ornaments.map((ornament) => (
              <div
                key={ornament.src}
                aria-hidden="true"
                className={`pointer-events-none absolute z-0 ${ornament.className}`}
              >
                <Image
                  src={ornament.src}
                  alt=""
                  width={ornament.width}
                  height={ornament.height}
                  className="h-auto w-full"
                  loading="eager"
                />
              </div>
            ))}
            <div className="relative z-10 flex flex-col gap-[5px] sm:gap-0">
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
                title={category.title}
                color={category.color}
                darkColor={category.darkColor}
                entries={leaderboards[category.key] ?? demoEntries()}
              />
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
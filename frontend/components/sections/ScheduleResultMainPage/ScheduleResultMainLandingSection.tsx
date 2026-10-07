"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

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
    <article className="relative w-full">
      <Image
        src={fixture.frame}
        alt=""
        width={1026}
        height={327}
        className="block h-auto w-full"
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
          <Image
            src="/images/ibl2k26login.png"
            alt=""
            width={552}
            height={523}
            className="absolute left-[31%] top-[37%] w-[62%] -rotate-[17deg]"
            loading="eager"
          />
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
          <Image
            src="/images/ibl2k26login.png"
            alt=""
            width={552}
            height={523}
            className="absolute left-[31%] top-[37%] w-[62%] -rotate-[17deg]"
            loading="eager"
          />
        </div>

        <p className="absolute left-[28%] right-[28%] top-[29%] truncate font-hollywood text-[clamp(12px,1.65vw,24px)] leading-tight text-[#147f83] [text-shadow:1px_1px_0_#fff3d2]">
          {fixture.venue}
        </p>
        <p className="absolute left-[25%] right-[25%] top-[40%] truncate font-poppins text-[clamp(10px,1.25vw,18px)] font-extrabold leading-tight">
          {fixture.date}
        </p>
        <button
          type="button"
          onClick={() => onDetails(fixture)}
          className="absolute left-1/2 top-[51%] -translate-x-1/2 rounded-[7px] border border-[#f6c475] bg-gradient-to-b from-[#c51610] to-[#760807] px-[clamp(10px,1.6vw,22px)] py-[clamp(3px,0.4vw,6px)] font-poppins text-[clamp(9px,0.9vw,13px)] font-semibold text-white shadow-[0_2px_0_rgba(0,0,0,.28)] transition-transform hover:-translate-x-1/2 hover:-translate-y-0.5 active:translate-y-0"
  >
          Game Detail
        </button>
        <p className="absolute left-[8%] top-[64%] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#45b3ac] [text-shadow:1px_1px_0_#123b3a]">
          {fixture.team1}
        </p>
        <p className="absolute right-[8%] top-[64%] font-hollywood text-[clamp(12px,1.5vw,22px)] text-[#45b3ac] [text-shadow:1px_1px_0_#123b3a]">
          {fixture.team2}
        </p>
      </div>
    </article>
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
        <Image
          src="/svg/figma/schedule & result.svg"
          alt="Schedule and Result"
          width={891}
          height={136}
          sizes="(max-width: 639px) 88vw, (max-width: 1023px) 64vw, 891px"
          className="h-auto w-[88vw] max-w-[891px] sm:w-[64vw]"
          priority
        />

        <div className="relative z-0 -mt-0 w-[96vw] max-w-[978px] md:-mt-[3vw] md:w-[70vw] lg:-mt-[1.2vw] lg:w-[978px]">
          <Image
            src="/svg/figma/calendar grouping.svg"
            alt="Jadwal pertandingan Senin 5 sampai Jumat 9 Oktober, satu sampai lima pertandingan per hari"
            width={978}
            height={243}
            sizes="(max-width: 639px) 96vw, (max-width: 1023px) 70vw, 978px"
            className="block h-auto w-full"
            priority
          />
        </div>

        <Image
          src="/svg/figma/matches.svg"
          alt="Matches"
          width={319}
          height={94}
          className="mt-3 h-auto w-[44vw] max-w-[319px] sm:mt-5 sm:w-[30vw]"
          loading="eager"
        />

        <div className="mt-2 flex w-[94vw] max-w-[1026px] flex-col sm:w-[72vw] md:mt-[1.5vw] lg:w-[72vw]">
          {fixtures.map((fixture, index) => (
            <div
              key={fixture.id}
              className={index > 0 ? "mt-4 sm:mt-6" : ""}
            >
              <MatchCard fixture={fixture} onDetails={setSelectedFixture} />
            </div>
          ))}
        </div>
      </div>

      {selectedFixture && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedFixture(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="fixture-detail-title"
            className="relative w-full max-w-[440px] border-[3px] border-[#f39a2c] bg-[#fff4d5] p-6 text-center shadow-[8px_8px_0_#351513]"
          >
            <button
              type="button"
              aria-label="Tutup detail pertandingan"
              onClick={() => setSelectedFixture(null)}
              className="absolute right-3 top-3 flex size-9 items-center justify-center text-[#7e0802] transition-colors hover:bg-[#f3dfb6]"
            >
              <X size={21} />
            </button>
            <h2 id="fixture-detail-title" className="font-hollywood text-2xl text-[#7e0802]">
              Game Detail
            </h2>
            <p className="mt-5 font-hollywood text-xl text-[#147f83]">
              {selectedFixture.team1} vs {selectedFixture.team2}
            </p>
            <p className="mt-2 font-poppins text-sm font-semibold">{selectedFixture.venue}</p>
            <p className="font-poppins text-sm">{selectedFixture.date}</p>
          </section>
        </div>
      )}
    </section>
  );
};

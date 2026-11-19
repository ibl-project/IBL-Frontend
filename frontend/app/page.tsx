import React from "react";
import type { Metadata } from "next";
import Image from "next/image";

import { AboutSection } from "@/components/sections/MainPage/AboutSection";
import { CountdownSection } from "@/components/sections/MainPage/CountdownSection";
import { LiveMatchModal } from "@/components/sections/MainPage/LiveMatchModal";
import { ThemeSection } from "@/components/sections/MainPage/ThemeSection";
import { TimelineSection } from "@/components/sections/MainPage/TimelineSection";

export const metadata: Metadata = {
  title: "IBL 2K26 | ITS Basketball League",
  description:
    "ITS Basketball League 2026 (IBL 2K26) - Fastbreak Collector. Kompetisi bola basket antar Himpunan Mahasiswa Departemen (HMD) terbesar di Institut Teknologi Sepuluh Nopember, diselenggarakan oleh UKM Basket ITS.",
  keywords: [
    "IBL 2K26",
    "ITS Basketball League",
    "UKM Basket ITS",
    "Basket ITS",
    "Fastbreak Collector",
    "Kompetisi Basket Mahasiswa",
  ],
  openGraph: {
    title: "IBL 2K26 | ITS Basketball League",
    description: "Fastbreak Collector - Turnamen Basket Mahasiswa Terbesar Institut Teknologi Sepuluh Nopember 2026.",
    url: "https://iblits.com",
    siteName: "IBL 2K26",
    locale: "id_ID",
    type: "website",
  },
};

export default function Home() {
  return (
    <main
      id="home-page"
      className="relative isolate mx-auto aspect-[1440/4716] w-full max-w-[1440px] overflow-hidden max-lg:mt-[var(--about-bg-mt-mobile,24px)] lg:aspect-[1440/4692]"
    >
      {/* Pop-up Match Modal: Hanya muncul jika ada match berstatus LIVE */}
      <LiveMatchModal />

      {/* 
        Unified Monolithic Background (1440 × 5036px):
        Converted to WebP (233 KB, -93.5% payload) with responsive viewport sizes.
      */}
      <Image
        src="/images/Bg_Home Page.webp"
        alt="IBL 2K26 Homepage Background"
        fill
        priority
        sizes="(max-width: 1440px) 100vw, 1440px"
        className="pointer-events-none z-0 object-cover object-top select-none lg:!-top-[calc(100vw*24/1440)] lg:!h-[calc(100%+(100vw*24/1440))] xl:!-top-[24px] xl:!h-[calc(100%+24px)]"
      />

      {/* Sections Flow - Layer 10 (above background) */}
      <div className="relative z-10 flex w-full flex-col items-center">
        {/* 1. About Section */}
        <AboutSection />

        {/* 3. Theme Section */}
        <ThemeSection />

        {/* 4. Countdown Section */}
        <div
          className="flex w-full flex-col items-center"
          style={{
            marginTop: "calc(100% * 284 / 1440)",
          }}
        >
          <CountdownSection />
        </div>

        {/* 5. Timeline Section */}
        <div
          className="flex w-full flex-col items-center"
          style={{
            marginTop: "calc(100% * 126 / 1440)",
          }}
        >
          <TimelineSection />
        </div>
      </div>
    </main>
  );
}

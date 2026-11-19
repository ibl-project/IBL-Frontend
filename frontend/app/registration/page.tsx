import React from "react";
import type { Metadata } from "next";
import Image from "next/image";

import { GuidebookSection } from "@/components/sections/RegistrationPage/GuidebookSection";
import { RegisterNowSection } from "@/components/sections/RegistrationPage/RegisterNowSection";
import { RegistHeroSection } from "@/components/sections/RegistrationPage/RegistHeroSection";
import { RegistrationDecorations } from "@/components/sections/RegistrationPage/RegistrationDecorations";
import registrationBg from "@/public/images/registration/Registration-Bg.webp";

export const metadata: Metadata = {
  title: "Registration | IBL 2K26 - Open Team Registration",
  description:
    "Daftarkan tim basketmu sekarang di ITS Basketball League 2026 (IBL 2K26) - Fastbreak Collector. Buka pendaftaran tim antar Himpunan Mahasiswa Departemen se-ITS.",
  keywords: [
    "IBL 2K26",
    "ITS Basketball League",
    "Registration",
    "Open Team Registration",
    "UKM Basket ITS",
    "Basket ITS",
    "Fastbreak Collector",
  ],
  openGraph: {
    title: "Registration | IBL 2K26 - Open Team Registration",
    description: "Daftarkan tim basketmu di IBL 2K26: Fastbreak Collector sekarang!",
    url: "https://iblits.com/registration",
    siteName: "IBL 2K26",
    locale: "id_ID",
    type: "website",
  },
};

export default function RegistrationPage() {
  return (
    <main
      id="registration-page"
      className="relative isolate flex min-h-[max(100vh,calc(100vw*1165/1440))] w-full flex-col items-center overflow-x-clip bg-[#F1EAD7] lg:min-h-[1165px]"
      style={{
        paddingTop: "var(--navbar-height)",
      }}
    >
      {/* 
        Full-Bleed Responsive Background:
        - Covers 100% width across widescreen monitors (>=1440px with zoom)
        - Extends from navbar down to the footer (bottom-0) with ZERO blank gap
        - Content sections have fixed aspect ratios, ensuring stable height and zero CLS
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 w-full overflow-hidden select-none"
        style={{
          top: "var(--navbar-height)",
        }}
      >
        <Image
          src={registrationBg}
          alt="Registration Background"
          fill
          priority
          sizes="(max-width: 1440px) 100vw, 1440px"
          className="object-cover object-top"
        />
      </div>

      {/* 
        Canvas Container:
        - Centered with max-w-[1440px]
        - On displays >= 1440px: locks at exact 1440px scale (content does not blow up)
        - On displays < 1440px: scales smoothly and responsively
      */}
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* Floating Decorative Elements (Lightning Left, Lightning Right, Basketball Left) */}
        <RegistrationDecorations />

        {/* Content Flow */}
        <div className="relative z-20 flex w-full flex-col items-center">
          {/* 1. Header/Hero Registration */}
          <RegistHeroSection />

          {/* 2. Guidebook Ticket Card */}
          <GuidebookSection />

          {/* 3. Register Now Clipboard Card */}
          <RegisterNowSection />
        </div>
      </div>
    </main>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Social icon helpers (Square styled with white icons)
// ---------------------------------------------------------------------------
const InstagramIcon = () => (
  <svg
    className="h-5 w-5 sm:h-5.5 sm:w-5.5"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="12" cy="12" r="5" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.3" fill="#FFFFFF" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    className="h-5 w-5 sm:h-5.5 sm:w-5.5"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.35a8.16 8.16 0 0 0 4.77 1.52V7.41a4.85 4.85 0 0 1-1.01-.72z"
      fill="#FFFFFF"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    className="h-5 w-5 sm:h-5.5 sm:w-5.5"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.75 14.79c-.25.7-1.24 1.27-2.01 1.44-.53.11-1.22.2-3.56-.77-2.99-1.23-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.06 0-1.46.76-2.17 1.03-2.46.27-.29.59-.36.79-.36.2 0 .39.002.56.01.18.008.42-.069.66.5.25.59.85 2.04.92 2.19.07.15.12.33.02.53-.09.2-.14.32-.28.5-.14.18-.3.4-.42.54-.14.15-.29.31-.12.61.17.3.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.31 1.42.3.15.47.12.65-.07.18-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.72.81 2.01.96.3.15.49.22.56.35.07.13.07.77-.18 1.47z"
      fill="#FFFFFF"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    className="h-5 w-5 sm:h-5.5 sm:w-5.5"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.94 8.5H3.56V19h3.38V8.5ZM5.25 3C4.14 3 3.25 3.9 3.25 5s.89 2 2 2 2-.9 2-2-.89-2-2-2ZM20.75 12.98c0-3.17-1.69-4.64-3.95-4.64-1.82 0-2.64 1-3.09 1.7V8.5h-3.38V19h3.38v-5.2c0-1.37.26-2.7 1.95-2.7 1.67 0 1.69 1.56 1.69 2.79V19h3.4l-.01-6.02Z"
      fill="#FFFFFF"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Typed interface for footer nav items
// ---------------------------------------------------------------------------
interface FooterNavItem {
  label: React.ReactNode;
  plainLabel: string;
  href: string;
  external?: boolean;
}

const NAV_COL_1: FooterNavItem[] = [
  { label: "Home", plainLabel: "Home", href: "/" },
  { label: "Registration", plainLabel: "Registration", href: "/registration" },
  {
    label: "Regulasi",
    plainLabel: "Regulasi",
    href: "https://intip.in/REGULASIKOMPETISIIBL2K26",
    external: true,
  },
  {
    label: (
      <>
        Schedule <span className="font-['Hobo_Std'] text-[0.85em] font-medium tracking-wide">&amp;</span> Result
      </>
    ),
    plainLabel: "Schedule & Result",
    href: "/schedule-result-main",
  },
];

const NAV_COL_2: FooterNavItem[] = [
  { label: "Teams", plainLabel: "Teams", href: "/teams-main" },
  {
    label: (
      <>
        Groups <span className="font-['Hobo_Std'] text-[0.85em] font-medium tracking-wide">&amp;</span> Standings
      </>
    ),
    plainLabel: "Groups & Standings",
    href: "/groups-standings",
  },
  { label: "Leaderboard", plainLabel: "Leaderboard", href: "/leaderboard" },
];

const SOCIAL_LINKS = [
  {
    icon: <LinkedInIcon />,
    handle: "itsbasketballleague",
    href: "https://www.linkedin.com/company/itsbasketballleague/",
    label: "LinkedIn IBL 2K26",
  },
  {
    icon: <InstagramIcon />,
    handle: "@ibl2k26",
    href: "https://www.instagram.com/ibl2k26/",
    label: "Instagram IBL 2K26",
  },
  {
    icon: <TikTokIcon />,
    handle: "@ibl.2026",
    href: "https://www.tiktok.com/@ibl.2026",
    label: "TikTok IBL 2026",
  },
  {
    icon: <WhatsAppIcon />,
    handle: "087760333086",
    href: "https://wa.me/6287760333086",
    label: "WhatsApp IBL 2K26",
  },
];

// ---------------------------------------------------------------------------
// Footer Component
// ---------------------------------------------------------------------------
export const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden border-t border-black/5 bg-[#fdf6dd]">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-2 pb-6 sm:px-10 sm:pt-3 md:px-14 md:pt-4 md:pb-8 lg:px-20">
        <div className="flex min-h-[160px] flex-col items-start justify-between gap-6 md:min-h-[170px] md:flex-row md:items-stretch md:gap-8">
          {/* Sisi Kiri: Branding (Atas) & Copyright (Bawah) */}
          <div className="flex flex-col items-start justify-between gap-5 md:gap-6">
            {/* Logo Maskot & Brand Title (Besar & Dominan) */}
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-7">
              <div className="relative h-24 w-24 flex-shrink-0 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-44 lg:w-44">
                <Image src="/images/logo-ibl.png" alt="IBL 2K26 mascot" fill className="object-contain" priority />
              </div>
              <div className="flex flex-col">
                <h2 className="font-hollywood text-3xl leading-none tracking-[3px] text-black sm:text-4xl sm:tracking-[4px] md:text-5xl lg:text-6xl">
                  IBL 2K26
                </h2>
                <p className="mt-1.5 font-['Inter'] text-base font-bold text-[#7f0303] sm:mt-2 sm:text-lg md:text-xl lg:text-2xl">
                  Fastbreak Collector
                </p>
              </div>
            </div>

            {/* Copyright - desktop/tablet (kiri bawah) */}
            <p className="hidden font-['Inter'] font-medium text-[#1d1d1b] md:block md:text-base lg:text-lg">
              Copyright © 2026 IBL 2K26, Hak Cipta Dilindungi
            </p>
          </div>

          {/* Sisi Kanan: Navigasi (Atas) & Social Media (Bawah) */}
          <div className="flex w-full flex-col items-start justify-between gap-5 md:w-auto md:gap-6">
            {/* Kolom Navigasi (Kanan Atas) - 2 Group Terpisah di-Justify Mentok Kanan-Kiri di Mobile */}
            <div className="flex w-full items-start justify-between pt-2 text-left sm:pt-3 md:justify-start md:gap-10 md:pt-3.5 lg:gap-14">
              {/* Group Kiri */}
              <div className="flex flex-col gap-1 text-left sm:gap-1.5">
                {NAV_COL_1.map((item) =>
                  item.external ? (
                    <a
                      key={item.plainLabel}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-['Drowner'] text-sm leading-tight font-normal tracking-[1.5px] whitespace-nowrap text-black transition-opacity hover:opacity-70 sm:text-base sm:tracking-[2px] md:text-lg lg:text-xl"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.plainLabel}
                      href={item.href}
                      className="font-['Drowner'] text-sm leading-tight font-normal tracking-[1.5px] whitespace-nowrap text-black transition-opacity hover:opacity-70 sm:text-base sm:tracking-[2px] md:text-lg lg:text-xl"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>

              {/* Group Kanan */}
              <div className="flex flex-col gap-1 text-left sm:gap-1.5">
                {NAV_COL_2.map((item) => (
                  <Link
                    key={item.plainLabel}
                    href={item.href}
                    className="font-['Drowner'] text-sm leading-tight font-normal tracking-[1.5px] whitespace-nowrap text-black transition-opacity hover:opacity-70 sm:text-base sm:tracking-[2px] md:text-lg lg:text-xl"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Media Row (Kanan Bawah) - Justify Between di Mobile, Tulisan Gede & Icon Kotak */}
            <div className="flex w-full items-center justify-between gap-3.5 pt-2 sm:gap-4 md:justify-start md:pt-0">
              <span className="font-['Inter'] text-lg font-bold whitespace-nowrap text-black sm:text-xl lg:text-2xl">
                Social Media
              </span>
              <div className="flex items-center gap-2 sm:gap-2.5">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={`${social.label} (${social.handle})`}
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-[#259b9b] text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#1d7d7d] sm:h-10 sm:w-10 sm:rounded-lg lg:h-11 lg:w-11"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - mobile only (paling bawah layar kecil) */}
        <div className="mt-4 border-t border-black/10 pt-6 text-center md:hidden">
          <p className="font-['Inter'] text-[11px] font-medium text-[#1d1d1b]">
            Copyright © 2026 IBL 2K26, Hak Cipta Dilindungi
          </p>
        </div>
      </div>
    </footer>
  );
};

import React from "react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Social icon helpers (Square styled with white icons)
// ---------------------------------------------------------------------------
const InstagramIcon = () => (
  <svg
    className="w-5 h-5 sm:w-5.5 sm:h-5.5"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      ry="5"
      stroke="#FFFFFF"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="5" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.3" fill="#FFFFFF" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    className="w-5 h-5 sm:w-5.5 sm:h-5.5"
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
    className="w-5 h-5 sm:w-5.5 sm:h-5.5"
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
    className="w-5 h-5 sm:w-5.5 sm:h-5.5"
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
        Schedule{" "}
        <span className="font-['Hobo_Std'] text-[0.85em] font-medium tracking-wide">
          &amp;
        </span>{" "}
        Result
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
        Groups{" "}
        <span className="font-['Hobo_Std'] text-[0.85em] font-medium tracking-wide">
          &amp;
        </span>{" "}
        Standings
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
    <footer className="w-full bg-[#fdf6dd] border-t border-black/5 relative overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pt-2 sm:pt-3 md:pt-4 pb-6 md:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 md:gap-8 min-h-[160px] md:min-h-[170px]">
          {/* Sisi Kiri: Branding (Atas) & Copyright (Bawah) */}
          <div className="flex flex-col justify-between items-start gap-5 md:gap-6">
            {/* Logo Maskot & Brand Title (Besar & Dominan) */}
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-7">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 flex-shrink-0">
                <Image
                  src="/images/logo-ibl.png"
                  alt="IBL 2K26 mascot"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h2 className="font-hollywood text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black tracking-[3px] sm:tracking-[4px] leading-none">
                  IBL 2K26
                </h2>
                <p className="font-['Inter'] font-bold text-[#7f0303] text-base sm:text-lg md:text-xl lg:text-2xl mt-1.5 sm:mt-2">
                  Fastbreak Collector
                </p>
              </div>
            </div>

            {/* Copyright - desktop/tablet (kiri bawah) */}
            <p className="hidden md:block text-[#1d1d1b] font-medium font-['Inter'] md:text-base lg:text-lg">
              Copyright © 2026 IBL 2K26, Hak Cipta Dilindungi
            </p>
          </div>

          {/* Sisi Kanan: Navigasi (Atas) & Social Media (Bawah) */}
          <div className="flex flex-col justify-between items-start gap-5 md:gap-6 w-full md:w-auto">
            {/* Kolom Navigasi (Kanan Atas) - 2 Group Terpisah di-Justify Mentok Kanan-Kiri di Mobile */}
            <div className="w-full flex justify-between items-start md:justify-start md:gap-10 lg:gap-14 text-left pt-2 sm:pt-3 md:pt-3.5">
              {/* Group Kiri */}
              <div className="flex flex-col gap-1 sm:gap-1.5 text-left">
                {NAV_COL_1.map((item) =>
                  item.external ? (
                    <a
                      key={item.plainLabel}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-['Drowner'] font-normal text-sm sm:text-base md:text-lg lg:text-xl tracking-[1.5px] sm:tracking-[2px] leading-tight hover:opacity-70 transition-opacity whitespace-nowrap"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.plainLabel}
                      href={item.href}
                      className="text-black font-['Drowner'] font-normal text-sm sm:text-base md:text-lg lg:text-xl tracking-[1.5px] sm:tracking-[2px] leading-tight hover:opacity-70 transition-opacity whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>

              {/* Group Kanan */}
              <div className="flex flex-col gap-1 sm:gap-1.5 text-left">
                {NAV_COL_2.map((item) => (
                  <Link
                    key={item.plainLabel}
                    href={item.href}
                    className="text-black font-['Drowner'] font-normal text-sm sm:text-base md:text-lg lg:text-xl tracking-[1.5px] sm:tracking-[2px] leading-tight hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Media Row (Kanan Bawah) - Justify Between di Mobile, Tulisan Gede & Icon Kotak */}
            <div className="w-full flex justify-between md:justify-start items-center gap-3.5 sm:gap-4 pt-2 md:pt-0">
              <span className="font-['Inter'] font-bold text-lg sm:text-xl lg:text-2xl text-black whitespace-nowrap">
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
                    className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-md sm:rounded-lg bg-[#259b9b] hover:bg-[#1d7d7d] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm text-white"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - mobile only (paling bawah layar kecil) */}
        <div className="md:hidden pt-6 mt-4 border-t border-black/10 text-center">
          <p className="text-[#1d1d1b] font-medium font-['Inter'] text-[11px]">
            Copyright © 2026 IBL 2K26, Hak Cipta Dilindungi
          </p>
        </div>
      </div>
    </footer>
  );
};

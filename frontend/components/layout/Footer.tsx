import React from "react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Social icon helpers (Matching Figma 22x22px teal circle with white icons)
// ---------------------------------------------------------------------------
const InstagramIcon = () => (
  <svg
    width="14"
    height="14"
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
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="5" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="#FFFFFF" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    width="13"
    height="13"
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
    width="13"
    height="13"
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
    width="13"
    height="13"
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
  { label: "Regulasi", plainLabel: "Regulasi", href: "https://intip.in/REGULASIKOMPETISIIBL2K26", external: true },
  {
    label: (
      <>
        Schedule{" "}
        <span className="font-['Hobo_Std'] text-base font-medium tracking-widest">
          &amp;
        </span>{" "}
        Result
      </>
    ),
    plainLabel: "Schedule & Result",
    href: "#",
  },
];

const NAV_COL_2: FooterNavItem[] = [
  { label: "Teams", plainLabel: "Teams", href: "#" },
  {
    label: (
      <>
        Groups{" "}
        <span className="font-['Hobo_Std'] text-base font-medium tracking-widest">
          &amp;
        </span>{" "}
        Standings
      </>
    ),
    plainLabel: "Groups & Standings",
    href: "#",
  },
  { label: "Leaderboard", plainLabel: "Leaderboard", href: "#" },
];

const SOCIAL_LINKS = [
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
  {
    icon: <LinkedInIcon />,
    handle: "itsbasketballleague",
    href: "https://www.linkedin.com/company/itsbasketballleague/",
    label: "LinkedIn IBL 2K26",
  },
];

// ---------------------------------------------------------------------------
// Footer Component
// ---------------------------------------------------------------------------
export const Footer = () => {
  return (
    <footer className="w-full bg-[#fdf6dd] relative overflow-hidden">
      {/* Container wrapper for centered 1440px canvas */}
      <div className="w-full flex justify-center">
        {/* DESKTOP & TABLET LAYOUT (>= 768px) - Exact responsive proportional mapping */}
        <div
          className="hidden md:block relative w-full max-w-[1440px]"
          style={{ height: "min(calc(100vw * 320 / 1440), 320px)" }}
        >
          {/* Logo 2 (Mascot) */}
          <div
            className="absolute"
            style={{
              width: "calc(100% * 149 / 1440)",
              height: "calc(100% * 162 / 320)",
              left: "calc(100% * 216 / 1440)",
              top: "calc(100% * 59 / 320)",
            }}
          >
            <Image
              src="/images/LOGO_1.svg"
              alt="IBL 2K26 mascot"
              fill
              className="object-contain"
            />
          </div>

          {/* IBL 2K26 Title */}
          <h2
            className="absolute font-hollywood text-black tracking-[2.88px] leading-[1.2]"
            style={{
              left: "calc(100% * 373 / 1440)",
              top: "calc(100% * 63 / 320)",
              fontSize: "clamp(15px, calc(100vw * 24 / 1440), 24px)",
              maxWidth: "calc(100% * 115 / 1440)",
            }}
          >
            IBL 2K26
          </h2>

          {/* Subtitle Fastbreak Collector */}
          <p
            className="absolute font-['Inter'] font-bold text-[#7f0303] leading-[normal] whitespace-nowrap"
            style={{
              left: "calc(100% * 373 / 1440)",
              top: "calc(100% * 95.5 / 320)",
              fontSize: "clamp(11px, calc(100vw * 16 / 1440), 16px)",
            }}
          >
            Fastbreak Collector
          </p>

          {/* Social Links */}
          <div
            className="absolute flex flex-col"
            style={{
              left: "calc(100% * 375 / 1440)",
              top: "calc(100% * 119 / 320)",
              gap: "clamp(4px, calc(100vw * 8 / 1440), 8px)",
            }}
          >
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.handle}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex items-center group"
                style={{ gap: "clamp(4px, calc(100vw * 7 / 1440), 7px)" }}
              >
                <span
                  className="rounded-full bg-[#259b9b] flex items-center justify-center flex-shrink-0 group-hover:bg-[#1d7d7d] transition-colors"
                  style={{
                    width: "clamp(14px, calc(100vw * 22 / 1440), 22px)",
                    height: "clamp(14px, calc(100vw * 22 / 1440), 22px)",
                  }}
                >
                  {social.icon}
                </span>
                <span
                  className="text-[#1d1d1b] font-medium font-['Inter'] group-hover:text-[#259b9b] transition-colors whitespace-nowrap"
                  style={{ fontSize: "clamp(9px, calc(100vw * 14 / 1440), 14px)" }}
                >
                  {social.handle}
                </span>
              </a>
            ))}
          </div>

          {/* Column 1 Nav Links */}
          <div
            className="absolute flex flex-col"
            style={{
              left: "calc(100% * 665 / 1440)",
              top: "calc(100% * 63 / 320)",
              gap: "clamp(12px, calc(100vw * 29 / 1440), 29px)",
            }}
          >
            {NAV_COL_1.map((item) =>
              item.external ? (
                <a
                  key={item.plainLabel}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-['Drowner'] font-normal tracking-[3px] hover:opacity-70 transition-opacity whitespace-nowrap"
                  style={{
                    fontSize: "clamp(12px, calc(100vw * 20 / 1440), 20px)",
                    lineHeight: "clamp(16px, calc(100vw * 24 / 1440), 24px)",
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.plainLabel}
                  href={item.href}
                  className="text-black font-['Drowner'] font-normal tracking-[3px] hover:opacity-70 transition-opacity whitespace-nowrap"
                  style={{
                    fontSize: "clamp(12px, calc(100vw * 20 / 1440), 20px)",
                    lineHeight: "clamp(16px, calc(100vw * 24 / 1440), 24px)",
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Column 2 Nav Links */}
          <div
            className="absolute flex flex-col"
            style={{
              left: "calc(100% * 993 / 1440)",
              top: "calc(100% * 63 / 320)",
              gap: "clamp(12px, calc(100vw * 28 / 1440), 28px)",
            }}
          >
            {NAV_COL_2.map((item) => (
              <Link
                key={item.plainLabel}
                href={item.href}
                className="text-black font-['Drowner'] font-normal tracking-[3px] hover:opacity-70 transition-opacity whitespace-nowrap"
                style={{
                  fontSize: "clamp(12px, calc(100vw * 20 / 1440), 20px)",
                  lineHeight: "clamp(16px, calc(100vw * 24 / 1440), 24px)",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Copyright bar */}
          <div
            className="absolute -translate-x-1/2 text-center text-[#1d1d1b] font-medium font-['Inter'] whitespace-nowrap"
            style={{
              left: "50%",
              top: "calc(100% * 262 / 320)",
              fontSize: "clamp(10px, calc(100vw * 14 / 1440), 14px)",
            }}
          >
            Copyright © 2026 IBL 2K26, Hak Cipta Dilindungi
          </div>
        </div>

        {/* MOBILE LAYOUT (< 768px) - Highly readable mobile design based on Figma node 494:1041 */}
        <div className="md:hidden w-full max-w-[500px] mx-auto px-4 py-4 flex flex-col items-center justify-between gap-2.5 min-h-[190px]">
          {/* Top Section: Mascot + Brand + Horizontal Socials */}
          <div className="flex items-center justify-center gap-3 w-full">
            {/* Mascot Logo */}
            <div className="w-[52px] h-[58px] relative flex-shrink-0">
              <Image
                src="/images/LOGO_1.svg"
                alt="IBL 2K26 mascot"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="font-hollywood text-[17px] sm:text-[19px] text-black tracking-[2px] leading-tight">
                IBL 2K26
              </h2>
              <p className="font-['Inter'] font-bold text-[#7f0303] text-[12px] sm:text-[13px] leading-tight mb-1">
                Fastbreak Collector
              </p>
              {/* Horizontal Social Links */}
              <div className="flex flex-row items-center gap-2 sm:gap-2.5">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.handle}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 group"
                  >
                    <span className="w-[17px] h-[17px] rounded-full bg-[#259b9b] flex items-center justify-center flex-shrink-0">
                      <span className="scale-[0.7] flex items-center justify-center">
                        {social.icon}
                      </span>
                    </span>
                    <span className="text-[#1d1d1b] text-[10.5px] sm:text-[11.5px] font-medium font-['Inter'] whitespace-nowrap">
                      {social.handle}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Section: 2 columns navigation */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-center w-full max-w-[340px] pt-1">
            <div className="flex flex-col gap-1">
              {NAV_COL_1.map((item) =>
                item.external ? (
                  <a
                    key={item.plainLabel}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-['Drowner'] text-[13px] sm:text-[14px] tracking-[1.5px] leading-tight hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.plainLabel}
                    href={item.href}
                    className="text-black font-['Drowner'] text-[13px] sm:text-[14px] tracking-[1.5px] leading-tight hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
            <div className="flex flex-col gap-1">
              {NAV_COL_2.map((item) => (
                <Link
                  key={item.plainLabel}
                  href={item.href}
                  className="text-black font-['Drowner'] text-[13px] sm:text-[14px] tracking-[1.5px] leading-tight hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Section: Copyright */}
          <div className="text-center text-[#1d1d1b] text-[10.5px] font-medium font-['Inter'] leading-none pt-0.5">
            Copyright © 2026 IBL 2K26, Hak Cipta Dilindungi
          </div>
        </div>
      </div>
    </footer>
  );
};

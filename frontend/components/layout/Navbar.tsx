"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------
interface NavItem {
  label: React.ReactNode;
  href: string;
  soon?: boolean;
  /** Plain text used for mobile menu label */
  plainLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { plainLabel: "Home", label: "Home", href: "/" },
  {
    plainLabel: "Registration",
    label: "Registration",
    href: "/registration",
  },
  {
    plainLabel: "Schedule & Result",
    label: (
      <>
        Schedule <span className="font-['Hobo_Std'] text-[0.85em] font-medium tracking-widest">&amp;</span> Result
      </>
    ),
    href: "/schedule-result-main",
  },
  { plainLabel: "Teams", label: "Teams", href: "/teams-main" },
  {
    plainLabel: "Groups & Standings",
    label: (
      <>
        Groups <span className="font-['Hobo_Std'] text-[0.85em] font-medium tracking-widest">&amp;</span> Standings
      </>
    ),
    href: "/groups-standings",
  },
  { plainLabel: "Leaderboard", label: "Leaderboard", href: "/leaderboard" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Lock body scroll when drawer is open.
  // scrollbar-gutter: stable in globals.css already reserves the scrollbar space
  // at CSS level, so NO JS padding compensation is needed. Adding it would
  // double-compensate and cause the very CLS we are trying to prevent.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* NAVBAR BAR                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header
        className="fixed top-0 right-0 left-0 z-[200] bg-[#fdf6dd] shadow-[0px_2px_30px_0px_rgba(0,0,0,0.10)]"
        style={{ height: "var(--navbar-height)" }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10 xl:px-12">
          {/* Logo — left */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <Image
              alt="Logo IBL 2K26"
              src="/images/LOGO_1.svg"
              width={82}
              height={89}
              className="object-contain"
              style={{ width: "var(--navbar-logo-width)", height: "auto" }}
              priority
            />
            <span
              className="font-hollywood leading-tight font-extrabold text-stone-900"
              style={{ fontSize: "var(--navbar-font-size)" }}
            >
              IBL
              <br />
              2K26
            </span>
          </Link>

          {/* ---------------------------------------------------------------- */}
          {/* DESKTOP NAV LINKS                                                */}
          {/* ---------------------------------------------------------------- */}
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6 2xl:gap-8" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <div key={item.plainLabel} className="relative flex flex-col items-end">
                {/* "soon" badge — flex-end horizontally */}
                {item.soon && (
                  <span
                    className="absolute -top-4 right-0 font-['Inter'] text-xs leading-none font-extrabold whitespace-nowrap text-red-900 select-none xl:text-sm"
                    aria-label="coming soon"
                  >
                    soon
                  </span>
                )}

                {item.soon ? (
                  <span
                    className="cursor-not-allowed font-['Drowner'] leading-6 tracking-[1.5px] whitespace-nowrap text-stone-900 select-none xl:tracking-[3px]"
                    style={{ fontSize: "var(--navbar-font-size)" }}
                    aria-disabled="true"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="font-['Drowner'] leading-5 tracking-[1.2px] whitespace-nowrap text-stone-900 transition-opacity hover:opacity-70 xl:tracking-[2px]"
                    style={{ fontSize: "var(--navbar-font-size)" }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* ---------------------------------------------------------------- */}
          {/* MOBILE BURGER BUTTON                                             */}
          {/* ---------------------------------------------------------------- */}
          <button
            className="z-[201] flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px] lg:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-drawer"
          >
            <span className="block h-[2px] w-6 rounded-full bg-stone-900 transition-all duration-300" />
            <span className="block h-[2px] w-6 rounded-full bg-stone-900 transition-all duration-300" />
            <span className="block h-[2px] w-4 rounded-full bg-stone-900 transition-all duration-300" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE DRAWER OVERLAY (HARDWARE-ACCELERATED CLIPPED APPROACH)      */}
      {/* ------------------------------------------------------------------ */}
      {/* Outer clipping viewport: overflow-hidden & visibility toggle completely
          prevent any off-screen subpixel bleed or flash artifacts */}
      <div
        className={`fixed inset-0 z-[300] overflow-hidden transition-[visibility] duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop with smooth fade and blur */}
        <div
          className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
          aria-hidden="true"
        />

        {/* Drawer panel: smooth fluid spring-like cubic bezier slide from right */}
        <aside
          id="mobile-drawer"
          className={`fixed top-0 right-0 flex h-full w-[min(320px,90vw)] flex-col bg-[#fdf6dd] shadow-[-10px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile navigation"
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
            <Link href="/" onClick={closeDrawer} className="flex items-center gap-2">
              <Image alt="Logo IBL 2K26" src="/images/LOGO_1.svg" width={40} height={44} className="object-contain" />
              <span className="font-hollywood text-lg leading-tight font-extrabold text-stone-900">IBL 2K26</span>
            </Link>

            {/* Close button */}
            <button
              onClick={closeDrawer}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-stone-200"
              aria-label="Close navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M2 2L18 18M18 2L2 18" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Drawer nav items with staggered entrance */}
          <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile navigation links">
            <ul className="flex flex-col gap-1" role="list">
              {NAV_ITEMS.map((item, i) => (
                <li
                  key={item.plainLabel}
                  role="listitem"
                  className={`transition-all duration-300 ease-out ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${60 + i * 35}ms` : "0ms",
                  }}
                >
                  {item.soon ? (
                    <div
                      className="flex cursor-not-allowed items-center justify-between rounded-xl px-4 py-3.5 opacity-50 select-none"
                      aria-disabled="true"
                    >
                      <span className="font-['Drowner'] text-xl tracking-[3px] text-stone-900">{item.plainLabel}</span>
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-['Inter'] text-xs font-extrabold text-red-900">
                        soon
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeDrawer}
                      className="group flex items-center rounded-xl px-4 py-3.5 transition-colors duration-150 hover:bg-orange-100 active:bg-orange-200"
                    >
                      <span className="font-['Drowner'] text-xl tracking-[3px] text-stone-900 transition-colors group-hover:text-stone-700">
                        {item.plainLabel}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Drawer footer */}
          <div className="border-t border-stone-200 px-6 pt-4 pb-8">
            <p className="text-center font-['Inter'] text-xs text-stone-500">ITS Basketball League 2K26</p>
          </div>
        </aside>
      </div>
    </>
  );
};

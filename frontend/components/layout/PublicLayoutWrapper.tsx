"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * PublicLayoutWrapper
 * 
 * Komponen pembungkus untuk membedakan layout publik (Home, Registration, Announcement)
 * dengan layout dashboard (Teams, Scoring).
 * 
 * - Jika rute diawali dengan '/teams' atau '/scoring', Navbar dan Footer umum tidak akan dirender,
 *   sehingga layout dashboard (Sidebar + Topbar) dapat tampil penuh dan bersih.
 * - Jika rute publik, Navbar dan Footer dirender seperti biasa.
 */
export function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Cek apakah halaman saat ini merupakan bagian dari dashboard (Teams, Scoring, Schedule Result) atau halaman login
  const isDashboardRoute =
    pathname?.startsWith("/teams") ||
    pathname?.startsWith("/scoring") ||
    (pathname === "/schedule-result" || pathname?.startsWith("/schedule-result/")) ||
    pathname?.startsWith("/login");

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

"use client";

import React, { useEffect } from "react";
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
 * - Zoom style html dibersihkan pada dashboard agar layout fixed/sidebar tidak terdistorsi saat zoom out.
 * - Jika rute publik, Navbar dan Footer dirender seperti biasa.
 */
export function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Cek apakah halaman saat ini merupakan bagian dari dashboard (Teams, Scoring) atau halaman login
  const isDashboardRoute =
    pathname?.startsWith("/teams") || pathname?.startsWith("/scoring") || pathname?.startsWith("/login");

  // Pastikan style.zoom tidak aktif pada halaman dashboard saat navigasi client-side
  useEffect(() => {
    if (isDashboardRoute) {
      document.documentElement.style.zoom = "";
      return;
    }

    const applyZoom = () => {
      const w = window.innerWidth || document.documentElement.clientWidth;
      if (w > 1440) {
        document.documentElement.style.zoom = (w / 1440).toFixed(6);
      } else {
        document.documentElement.style.zoom = "";
      }
    };

    applyZoom();
    window.addEventListener("resize", applyZoom);
    return () => {
      window.removeEventListener("resize", applyZoom);
      document.documentElement.style.zoom = "";
    };
  }, [isDashboardRoute]);

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

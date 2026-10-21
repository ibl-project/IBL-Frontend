import type { Metadata } from "next";
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard/DashboardLayout";

/**
 * =============================================================================
 * ROUTE GROUP LAYOUT: app/(dashboard)/layout.tsx
 * =============================================================================
 * 
 * DESKRIPSI:
 * Layout bersama (shared layout) khusus rute-rute dashboard (seperti /teams dan /scoring).
 * Menggunakan Next.js Route Group '(dashboard)' sehingga URL tetap bersih:
 * - /teams
 * - /scoring
 * 
 * Layout ini menggantikan layout publik dan menyematkan Sidebar & Topbar tersendiri.
 * =============================================================================
 */

export const metadata: Metadata = {
  title: "Dashboard | IBL 2K26",
  description: "Portal Manajemen Pertandingan & Tim IBL 2K26",
};

/**
 * AUTH GUARD:
 * Rute di dalam group (dashboard) ini mencakup /teams, /scoring, /schedule-result.
 * Sesi login dicek ke backend oleh DashboardLayout (lib/apiClient.ts). Cookie
 * sesi milik domain API, jadi tidak bisa dibaca di sini atau di proxy Next.js.
 * Perlindungan data yang sebenarnya tetap di backend: semua endpoint pengubah
 * data menolak request tanpa access token yang sah.
 */
export default function DashboardRouteGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

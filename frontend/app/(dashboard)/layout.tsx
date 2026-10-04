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
 * TODO [BACKEND / AUTH GUARD]:
 * Rute di dalam group (dashboard) ini mencakup /teams dan /scoring.
 * - Proteksi rute saat ini diarahkan melalui frontend/middleware.ts.
 * - Jika ingin validasi sesi di sisi server component, dapat mengecek cookie
 *   atau memverifikasi session JWT di sini sebelum merender children.
 */
export default function DashboardRouteGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

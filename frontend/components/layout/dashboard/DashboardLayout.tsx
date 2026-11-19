"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { restoreSession } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/store/useAuthStore";

import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

/** Sidebar langsung tertutup di layar < 1024px (mobile/tablet). */
function isNarrowViewport(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  return width > 0 && width < 1024;
}

/**
 * Halaman yang butuh layar lebar (scoring desk) bisa menutup sidebar lewat
 * useCollapseSidebar(). Pengguna tetap bisa membukanya lagi dari topbar.
 */
const SidebarCollapseContext = createContext<((collapsed: boolean) => void) | null>(null);

/** Tutup sidebar saat komponen pemanggil dipasang. */
export function useCollapseSidebar() {
  const setCollapsed = useContext(SidebarCollapseContext);
  useEffect(() => {
    setCollapsed?.(true);
  }, [setCollapsed]);
}

/**
 * DashboardLayout
 *
 * Layout wrapper bersama untuk halaman-halaman dashboard (Teams, Scoring, dll).
 * Menggabungkan:
 * 1. DashboardSidebar fixed full-height di sisi kiri dengan transisi width (w-64 <-> w-0)
 * 2. DashboardTopbar di sisi atas yang mengambil sisa lebar
 * 3. Main content ({children}) yang otomatis melebar ketika sidebar ditutup (tanpa scroll horizontal)
 *
 * Auth guard: isi dashboard baru ditampilkan setelah BACKEND mengonfirmasi
 * sesi login masih sah (lib/apiClient.ts). Tidak ada lagi cookie/localStorage
 * yang bisa dipalsukan dari DevTools untuk membuka dashboard.
 */
export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const authStatus = useAuthStore((state) => state.status);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isNarrowViewport);

  // Pulihkan sesi dari backend saat dashboard dibuka (mis. setelah reload).
  useEffect(() => {
    void restoreSession();
  }, []);

  // Tidak ada sesi yang sah (belum login, logout, atau sesi dicabut di tab
  // lain) → kembali ke login, lalu kembali ke halaman ini setelah login.
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?from=${encodeURIComponent(pathname || "/teams")}`);
    }
  }, [authStatus, pathname, router]);

  // Tampilkan loading selama sesi belum dikonfirmasi backend, supaya isi
  // dashboard tidak sempat terlihat oleh yang belum login.
  if (authStatus !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-poppins">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div id="dashboard-layout" className="relative flex min-h-screen overflow-x-hidden bg-slate-50 font-poppins">
      {/* 1. Sidebar Navigasi Fixed Full-Height */}
      <DashboardSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed((prev) => !prev)} />

      {/* 2. Konten Utama (Topbar + Halaman) - Transisi margin-left smooth mengikuti sidebar */}
      <div
        id="dashboard-main-area"
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-0" : "ml-0 lg:ml-64"
        }`}
      >
        <DashboardTopbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <main className="min-w-0 flex-1">
          <SidebarCollapseContext value={setIsSidebarCollapsed}>{children}</SidebarCollapseContext>
        </main>
      </div>
    </div>
  );
};

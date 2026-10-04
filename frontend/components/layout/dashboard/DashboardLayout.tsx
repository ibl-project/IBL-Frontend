"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

/**
 * DashboardLayout
 *
 * Layout wrapper bersama untuk halaman-halaman dashboard (Teams, Scoring, dll).
 * Menggabungkan:
 * 1. DashboardSidebar fixed full-height di sisi kiri dengan transisi width (w-64 <-> w-0)
 * 2. DashboardTopbar di sisi atas yang mengambil sisa lebar
 * 3. Main content ({children}) yang otomatis melebar ketika sidebar ditutup (tanpa scroll horizontal)
 */
export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auth Guard: Verifikasi apakah user sudah login
  useEffect(() => {
    const hasAuthCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith("auth_token="));
    const hasAuthStorage =
      typeof window !== "undefined" && localStorage.getItem("auth_token") === "true";

    if (!hasAuthCookie && !hasAuthStorage) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Auto-collapse pada viewport mobile saat inisialisasi
  useEffect(() => {
    const width =
      window.innerWidth || document.documentElement.clientWidth || 0;
    if (width > 0 && width < 1024) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Tampilkan loading / kosong sesaat saat mengecek auth untuk menghindari flash of unauthorized content
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-poppins">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      id="dashboard-layout"
      className="min-h-screen flex bg-slate-50 font-poppins relative overflow-x-hidden"
    >
      {/* 1. Sidebar Navigasi Fixed Full-Height */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Konten Utama (Topbar + Halaman) - Transisi margin-left smooth mengikuti sidebar */}
      <div
        id="dashboard-main-area"
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[margin] duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-0" : "ml-0 lg:ml-64"
        }`}
      >
        <DashboardTopbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};


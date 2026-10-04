"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardTopbarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

/**
 * DashboardTopbar
 *
 * Komponen topbar navigasi atas untuk halaman dashboard.
 * Berisi:
 * 1. Tombol toggle menu (tampil ketika sidebar collapsed untuk membuka kembali)
 * 2. Profil pengguna di kanan atas (Role "Damen", "IBL 2K26", dan Avatar) dengan dropdown Logout
 */
export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <>
      <header
        className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between font-poppins z-30 transition-[left] duration-300 ease-in-out ${
          isSidebarCollapsed ? "left-0" : "left-0 lg:left-64"
        }`}
      >
        {/* 1. Tombol Toggle Buka Sidebar (Tampil saat sidebar ditutup) */}
        <div className="flex items-center gap-3">
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Buka menu sidebar"
              title="Buka menu sidebar"
              className="p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-hidden cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 
          2. User Profile Info with Dropdown & Logout
        */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-hidden cursor-pointer select-none"
            aria-expanded={isProfileOpen}
            aria-label="Menu pengguna"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                Damen
              </span>
              <span className="text-xs text-gray-500 leading-tight">IBL 2K26</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs select-none ring-2 ring-transparent hover:ring-teal-200 transition-all">
              D
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 flex flex-col gap-1 font-poppins animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">Damen</p>
                  <p className="text-xs text-gray-500 font-medium">staff@ibl2k26.com</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
                    try {
                      localStorage.removeItem("auth_token");
                    } catch {
                      // Ignore
                    }
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Spacer elemen setinggi h-16 agar posisi konten di bawahnya tidak bergeser atau tertutup header */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />
    </>
  );
};

"use client";

import React, { useState } from "react";

import { logout } from "@/lib/apiClient";
import { ROLE_LABEL, useAuthStore } from "@/lib/store/useAuthStore";

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
 * 2. Profil akun yang sedang login (nama, role, email dari backend) dengan dropdown Logout
 */
export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({ isSidebarCollapsed = false, onToggleSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const displayName = user?.name ?? "";
  const roleLabel = user ? ROLE_LABEL[user.role] : "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 font-poppins transition-[left] duration-300 ease-in-out md:px-6 ${
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
              className="-ml-1 cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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
            className="flex cursor-pointer items-center gap-3 rounded-full p-1.5 transition-colors select-none hover:bg-gray-100 focus:outline-hidden"
            aria-expanded={isProfileOpen}
            aria-label="Menu pengguna"
          >
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm leading-tight font-semibold text-gray-800">{displayName}</span>
              <span className="text-xs leading-tight text-gray-500">{roleLabel} · IBL 2K26</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-xs ring-2 ring-transparent transition-all select-none hover:ring-teal-200">
              {initial}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-2 font-poppins shadow-xl duration-150">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-sm font-bold text-gray-800">{displayName}</p>
                  <p className="text-xs font-medium break-all text-gray-500">{user?.email}</p>
                  <p className="mt-0.5 text-xs font-semibold text-teal-700">{roleLabel}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Sesi dicabut di backend; DashboardLayout otomatis
                    // mengarahkan ke /login begitu status berubah.
                    void logout();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg
                    className="h-4 w-4 text-red-500"
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

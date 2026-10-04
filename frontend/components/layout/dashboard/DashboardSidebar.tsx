"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { logout } from "@/lib/apiClient";

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  hasRoute: boolean; // Flag penanda apakah halaman UI rutenya sudah tersedia
  icon: React.ReactNode;
  badge?: string;
}

interface MenuGroup {
  groupTitle: string;
  items: MenuItem[];
}

/**
 * DashboardSidebar
 *
 * Komponen sidebar kiri untuk dashboard IBL 2K26.
 * Fitur:
 * 1. Fixed full-height (h-screen) top-to-bottom agar section Logout selalu terlihat.
 * 2. Tombol X Lucide di samping kiri logo + teks IBL 2K26 untuk collapse/tutup sidebar.
 * 3. Transisi width smooth profesional (w-64 <-> w-0) tanpa CLS.
 */
export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed = false,
  onToggle,
}) => {
  const pathname = usePathname();

  // Definisi struktur navigasi menu
  const menuGroups: MenuGroup[] = [
    {
      groupTitle: "MAIN",
      items: [
        {
          name: "Teams",
          href: "/teams",
          hasRoute: true,
          icon: (
            <svg
              className="w-5 h-5 shrink-0 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      groupTitle: "DAMEN",
      items: [
        {
          name: "Schedule Result",
          href: "/schedule-result",
          hasRoute: true,
          icon: (
            <svg
              className="w-5 h-5 shrink-0 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
        },
        {
          name: "Playoff",
          href: "#",
          hasRoute: false,
          icon: (
            <svg
              className="w-5 h-5 shrink-0 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4a5 5 0 005 5h4a5 5 0 005-5V3M5 5H3a2 2 0 00-2 2v1a4 4 0 004 4h0M19 5h2a2 2 0 012 2v1a4 4 0 01-4 4h0M12 12v6m-4 3h8"
              />
            </svg>
          ),
        },
      ],
    },
    {
      groupTitle: "EVENT",
      items: [
        {
          name: "Scoring",
          href: "/scoring",
          hasRoute: true,
          icon: (
            <svg
              className="w-5 h-5 shrink-0 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  // Sesi dicabut di backend; DashboardLayout otomatis mengarahkan ke /login.
  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Overlay Backdrop untuk Mobile saat sidebar terbuka */}
      {!isCollapsed && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container (Pinned to viewport top and bottom with inset-y-0 h-full) */}
      <aside
        className={`fixed inset-y-0 left-0 h-full z-50 bg-teal-600 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] 
          flex flex-col font-poppins transition-[width] duration-300 ease-in-out
          ${
            isCollapsed
              ? "w-0 overflow-hidden pointer-events-none"
              : "w-64 overflow-hidden pointer-events-auto"
          }`}
      >
        {/* Inner fixed-width wrapper to prevent reflow / CLS during collapse transition */}
        <div className="w-64 h-full flex flex-col justify-between shrink-0 overflow-hidden">
          {/* Sisi Atas: Logo & Navigasi */}
          <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header Brand & Tombol Close (Lucide X di samping kiri logo + tulisan IBL 2K26) */}
            <div className="w-full px-5 pt-6 pb-5 flex items-center gap-3 shrink-0">
              {/* Tombol X Lucide untuk menutup sidebar */}
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 -ml-1 text-white/90 hover:text-white hover:bg-white/15 rounded-lg transition-colors focus:outline-hidden cursor-pointer shrink-0"
                aria-label="Tutup sidebar"
                title="Tutup sidebar"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Logo + Tulisan IBL 2K26 */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image
                    src="/images/LOGO_1.svg"
                    alt="IBL 2K26 Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-white text-xl font-extrabold font-poppins leading-none tracking-tight truncate">
                  IBL 2K26
                </span>
              </div>
            </div>

            {/* List Menu Navigasi (Bisa scroll independen bila layar vertikal pendek) */}
            <nav className="w-full px-3 flex-1 overflow-y-auto flex flex-col gap-1 min-h-0 pb-2">
              {menuGroups.map((group, groupIdx) => (
                <div key={group.groupTitle} className="w-full">
                  {/* Header Kategori Menu */}
                  <div
                    className={`w-full px-3 pb-2 flex flex-col justify-start items-start ${
                      groupIdx === 0 ? "pt-1" : "pt-5"
                    }`}
                  >
                    <span className="text-white text-base font-bold font-poppins uppercase leading-4 tracking-wide">
                      {group.groupTitle}
                    </span>
                  </div>

                  {/* Items dalam Grup */}
                  <div className="w-full flex flex-col gap-1">
                    {group.items.map((item) => {
                      const isActive =
                        item.hasRoute &&
                        (pathname === item.href ||
                          pathname?.startsWith(item.href + "/"));

                      const itemContent = (
                        <div
                          className={`w-full px-4 py-3 inline-flex items-center gap-3 cursor-pointer transition-colors duration-150 ${
                            isActive
                              ? "bg-white/25 rounded-tl-xl rounded-bl-xl border-r-4 border-stone-200 text-white font-medium"
                              : "rounded-xl text-white/90 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="shrink-0">{item.icon}</div>
                          <span className="text-white text-base font-normal font-poppins leading-6">
                            {item.name}
                          </span>
                        </div>
                      );

                      return item.hasRoute ? (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            if (
                              typeof window !== "undefined" &&
                              window.innerWidth < 1024
                            ) {
                              onToggle?.();
                            }
                          }}
                          className="w-full block focus:outline-hidden"
                        >
                          {itemContent}
                        </Link>
                      ) : (
                        <div
                          key={item.name}
                          className="w-full block focus:outline-hidden opacity-75 cursor-not-allowed"
                          title={`Halaman ${item.name} sedang dalam pengembangan`}
                        >
                          {itemContent}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Sisi Bawah: Tombol Logout (Selalu berada di bagian paling bawah layar) */}
          <div className="w-full px-4 py-4 border-t border-green-200/20 shrink-0 mt-auto bg-teal-600">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-xl inline-flex items-center gap-3 text-white hover:bg-white/10 transition-colors duration-150 focus:outline-hidden cursor-pointer"
            >
              <div className="shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <span className="text-white text-base font-normal font-poppins leading-6">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

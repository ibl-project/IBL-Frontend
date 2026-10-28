import type { Metadata } from "next";
import React from "react";
import { PlayoffAdminSection } from "@/components/sections/PlayoffPage/PlayoffAdminSection";

export const metadata: Metadata = {
  title: "Playoff | Dashboard IBL 2K26",
  description: "Bagan dan Manajemen Jadwal Turnamen Playoff IBL 2K26",
};

export default function PlayoffPage() {
  return (
    <div className="min-h-screen w-full bg-[#e1e7ea] px-6 py-6 md:px-[46px]">
      <PlayoffAdminSection />
    </div>
  );
}

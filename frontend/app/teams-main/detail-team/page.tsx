import React, { Suspense } from "react";
import type { Metadata } from "next";

import { TeamsMainDetailSection } from "@/components/sections/TeamsMainPage/TeamsMainDetailSection";

export const metadata: Metadata = {
  title: "Detail Tim | IBL 2K26",
  description: "Daftar pemain dan statistik tim ITS Basketball League 2K26.",
};

export default function DetailTeamPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#EC5D12] pt-24 text-center font-bold text-[#FDF6DD]">Memuat data tim...</div>}
    >
      <TeamsMainDetailSection />
    </Suspense>
  );
}

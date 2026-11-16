import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ScoreDetailPdfSection } from "@/components/sections/ScoreDetailPage/ScoreDetailPdfSection";

export const metadata: Metadata = {
  title: "Score Detail | IBL 2K26",
  description: "Lembar box score pertandingan IBL 2K26 dalam bentuk PDF.",
  robots: { index: false },
};

export default function ScoreDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3e6ce] pt-24 text-center font-poppins text-lg font-bold text-[#760807]">
          Memuat score detail...
        </div>
      }
    >
      <ScoreDetailPdfSection />
    </Suspense>
  );
}

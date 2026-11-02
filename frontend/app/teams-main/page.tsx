import type { Metadata } from "next";

import { TeamsMainLandingSection } from "@/components/sections/TeamsMainPage/TeamsMainLandingSection";

export const metadata: Metadata = {
  title: "Teams | IBL 2K26",
  description: "Daftar tim peserta ITS Basketball League 2K26.",
};

export default function TeamsMainPage() {
  return <TeamsMainLandingSection />;
}

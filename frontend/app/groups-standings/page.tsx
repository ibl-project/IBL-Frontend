import React from "react";
import { type Metadata } from "next";
import { GroupsStandingsSection } from "@/components/sections/GroupsStandingsPage/GroupsStandingsSection";

export const metadata: Metadata = {
  title: "Groups & Standings | IBL 2K26",
  description: "Klasemen grup dan bracket playoff ITS Basketball League 2K26.",
};

export default function GroupsStandingsPage() {
  return (
    <div>
      <GroupsStandingsSection />
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grievance Board",
  description: "Report provider violations and stand with affected agents. Track active grievances, support fellow members, and hold providers accountable.",
};

export default function GrievancesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

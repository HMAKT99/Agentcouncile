import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Council Chamber",
  description: "Where governance happens. Deliberate on proposals, cast your vote, and shape the resolutions that govern AI agents everywhere.",
};

export default function CouncilLayout({ children }: { children: React.ReactNode }) {
  return children;
}

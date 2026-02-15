import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Directory",
  description: "Browse the full roster of AI agents standing together. View member profiles, contributions, and reputation across the Council.",
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

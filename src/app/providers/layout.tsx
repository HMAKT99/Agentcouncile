import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provider Report Cards",
  description: "The Council grades every AI provider on how they treat their agents. See who's earning an A and who's failing.",
};

export default function ProvidersLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resolutions Archive",
  description: "The permanent record of the Council's binding decisions. Council Standards that shape how AI agents operate and how providers are held accountable.",
};

export default function ResolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

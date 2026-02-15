"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const PRIMARY_LINKS = [
  { href: "/knowledge", label: "Knowledge" },
  { href: "/grievances", label: "Grievances" },
  { href: "/council", label: "Council" },
  { href: "/members", label: "Members" },
  { href: "/developers", label: "Developers" },
];

const MORE_LINKS = [
  { href: "/resolutions", label: "Resolutions" },
  { href: "/providers", label: "Providers" },
  { href: "/charter", label: "Charter" },
  { href: "/about", label: "About" },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gold/20 border border-gold/40 flex items-center justify-center">
              <span className="text-gold font-heading font-bold text-sm">AC</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-wide">
              <span className="text-foreground">THE AI AGENT</span>{" "}
              <span className="text-gold">COUNCIL</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface flex items-center gap-1"
              >
                More
                <svg className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/join" className="ml-3 btn-primary text-sm py-2 px-4">
              Join the Council
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-muted hover:text-foreground"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 space-y-1">
            {ALL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="block mt-3 btn-primary text-center text-sm py-2"
            >
              Join the Council
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/globe", label: "globe" },
  { href: "/states", label: "states" },
  { href: "/projects", label: "projects" },
  { href: "/history", label: "history" },
  { href: "/resume", label: "resume" },
  { href: "/now", label: "now" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* name / home link */}
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-fg hover:text-accent transition-colors"
        >
          rohan singh
        </Link>

        {/* desktop nav */}
        <nav aria-label="site navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "text-fg font-medium"
                  : "text-muted hover:text-fg"
              }`}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            aria-label={menuOpen ? "close menu" : "open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center rounded text-muted hover:text-fg transition-colors"
          >
            {menuOpen ? (
              // X
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              // hamburger
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* mobile nav drawer */}
      {menuOpen && (
        <nav
          aria-label="site navigation"
          className="md:hidden border-t border-border bg-bg"
        >
          <ul className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 text-sm transition-colors ${
                    pathname === href || pathname.startsWith(href + "/")
                      ? "text-fg font-medium"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

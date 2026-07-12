"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/projects", label: "work", paths: ["/projects"] },
  { href: "/history", label: "experience", paths: ["/history"] },
  { href: "/fitness", label: "fitness", paths: ["/fitness"] },
  { href: "/globe", label: "travel", paths: ["/globe", "/states", "/travel-list"] },
  { href: "/now", label: "now", paths: ["/now"] },
] as const;

function pathIsActive(pathname: string, paths: readonly string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
      <div className="site-container flex h-14 items-center justify-between">
        {/* name / home link */}
        <Link
          href="/"
          className="flex min-h-11 items-center font-serif text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          rohan singh
        </Link>

        {/* desktop nav */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex [&_button]:size-11">
          {navLinks.map(({ href, label, paths }) => {
            const active = pathIsActive(pathname, paths);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-full px-3 text-sm transition-colors ${
                  active
                    ? "bg-surface text-fg"
                    : "text-muted hover:bg-surface/70 hover:text-fg"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/resume"
            aria-current={pathname === "/resume" ? "page" : undefined}
            className="ml-1 flex min-h-11 items-center rounded-full border border-border px-3.5 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent-dim"
          >
            resume <span aria-hidden="true">↗</span>
          </Link>
          <ThemeToggle />
        </nav>

        {/* mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden [&_button]:size-11">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "close menu" : "open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="true"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
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
          id="mobile-navigation"
          className="border-t border-border bg-bg shadow-lg md:hidden"
        >
          <ul className="site-container flex flex-col gap-1 py-3">
            {navLinks.map(({ href, label, paths }) => {
              const active = pathIsActive(pathname, paths);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-sm transition-colors ${
                      active
                        ? "bg-surface font-medium text-fg"
                        : "text-muted hover:bg-surface/70 hover:text-fg"
                    }`}
                  >
                    {label}
                    {active && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
            <li className="pt-1">
              <Link
                href="/resume"
                aria-current={pathname === "/resume" ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center justify-between rounded-lg border border-border px-3 text-sm font-medium text-fg transition-colors hover:border-accent"
              >
                resume <span aria-hidden="true">↗</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

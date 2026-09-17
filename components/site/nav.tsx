"use client";

import Link from "next/link";
import { useState } from "react";
import { Mark } from "@/components/mark";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { LINKS, NAV } from "@/lib/site";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href={LINKS.home} className="mark flex items-center gap-2.5 text-ink" aria-label="Boxcode home">
          <Mark className="h-6 w-auto" />
          <span className="text-[15px] font-medium tracking-tight">boxcode</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
          <a href={LINKS.boxcodeRepo} className="hover:text-ink" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-[8px] border border-line md:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-line px-5 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a href={LINKS.boxcodeRepo} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

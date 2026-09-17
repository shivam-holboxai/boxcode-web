"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("boxcode-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex size-9 items-center justify-center rounded-[8px] border border-line text-ink hover:bg-canvas-2"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v1.5M12 19.5V21M4.5 12H3M21 12h-1.5M6.2 6.2l1.1 1.1M16.7 16.7l1.1 1.1M17.8 6.2l-1.1 1.1M7.3 16.7l-1.1 1.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M16 13a6 6 0 1 1-5-9.5 7 7 0 0 0 8.5 8.5A6 6 0 0 1 16 13Z" />
        </svg>
      )}
    </button>
  );
}

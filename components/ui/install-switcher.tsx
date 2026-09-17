"use client";

import { useState } from "react";
import { INSTALL } from "@/lib/site";

export function InstallSwitcher() {
  const [os, setOs] = useState<"unix" | "windows">("unix");
  const [copied, setCopied] = useState(false);
  const cmd = os === "unix" ? INSTALL.unix : INSTALL.windows;

  async function copy() {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-[8px] border border-line bg-canvas-2">
      <div className="flex border-b border-line text-sm" role="group" aria-label="Choose your platform">
        <button
          type="button"
          className={`flex-1 px-4 py-2.5 ${os === "unix" ? "bg-canvas text-ink" : "text-muted"}`}
          aria-pressed={os === "unix"}
          onClick={() => setOs("unix")}
        >
          macOS · Linux
        </button>
        <button
          type="button"
          className={`flex-1 px-4 py-2.5 ${os === "windows" ? "bg-canvas text-ink" : "text-muted"}`}
          aria-pressed={os === "windows"}
          onClick={() => setOs("windows")}
        >
          Windows
        </button>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="font-mono text-muted" aria-hidden="true">
          {os === "unix" ? "$" : ">"}
        </span>
        <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] text-ink">{cmd}</code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-[6px] border border-line px-2.5 py-1 text-xs text-muted hover:text-ink"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

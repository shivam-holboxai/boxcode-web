"use client";

import { useEffect, useState } from "react";
import type { IdeAsset, IdePlatform } from "@/lib/github-releases";
import { formatBytes } from "@/lib/github-releases";

function detectPreferred(assets: IdeAsset[]): IdePlatform | null {
  if (typeof navigator === "undefined") return assets[0]?.platform ?? null;
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const mac = /Mac|iPhone|iPad/.test(ua);
  const win = /Windows/.test(ua);
  const linux = /Linux/.test(ua) && !/Android/.test(ua);
  const arm = /arm64|aarch64/i.test(`${platform} ${ua}`);
  if (mac) {
    return (
      assets.find((a) => a.platform === "macos-arm64-dmg")?.platform ??
      assets.find((a) => a.platform.startsWith("macos"))?.platform ??
      null
    );
  }
  if (win) return assets.find((a) => a.platform === "windows")?.platform ?? null;
  if (linux) {
    if (arm) {
      return assets.find((a) => a.platform === "linux-deb-arm64")?.platform ?? assets[0]?.platform ?? null;
    }
    return (
      assets.find((a) => a.platform === "linux-deb-amd64")?.platform ??
      assets.find((a) => a.platform === "linux-appimage")?.platform ??
      null
    );
  }
  return assets[0]?.platform ?? null;
}

export function DownloadButtons({ assets }: { assets: IdeAsset[] }) {
  const [picked, setPicked] = useState<IdePlatform | null>(assets[0]?.platform ?? null);

  useEffect(() => {
    const next = detectPreferred(assets);
    if (next) setPicked(next);
  }, [assets]);

  const current = assets.find((a) => a.platform === picked) ?? assets[0];
  const windowsMissing = !assets.some((a) => a.platform === "windows");

  if (!current) {
    return <p className="text-sm text-muted">No IDE packages on this release.</p>;
  }

  return (
    <div>
      <a
        href={current.url}
        className="inline-flex items-center justify-center rounded-[8px] bg-accent px-5 py-3 text-sm font-medium text-accent-ink hover:opacity-90"
      >
        Download {current.label}
        <span className="ml-2 text-xs opacity-80">{formatBytes(current.size)}</span>
      </a>
      <ul className="mt-6 space-y-2">
        {assets.map((asset) => (
          <li key={asset.name}>
            <button
              type="button"
              onClick={() => setPicked(asset.platform)}
              className={`text-left text-sm ${
                asset.platform === current.platform ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {asset.label}
              <span className="ml-2 font-mono text-xs">{formatBytes(asset.size)}</span>
            </button>
          </li>
        ))}
      </ul>
      {windowsMissing ? (
        <p className="mt-6 max-w-md text-sm text-muted">
          No Windows IDE package is on this GitHub release yet. Use the CLI on Windows, or watch
          the releases page.
        </p>
      ) : null}
    </div>
  );
}

export type IdePlatform =
  | "macos-arm64-dmg"
  | "macos-arm64-zip"
  | "linux-deb-amd64"
  | "linux-deb-arm64"
  | "linux-appimage"
  | "linux-flatpak"
  | "linux-tarball-x64"
  | "windows";

export type IdeAsset = {
  platform: IdePlatform;
  label: string;
  name: string;
  url: string;
  size: number;
};

export type IdeRelease = {
  tag: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  assets: IdeAsset[];
};

const LABELS: Record<IdePlatform, string> = {
  "macos-arm64-dmg": "macOS (Apple Silicon) · .dmg",
  "macos-arm64-zip": "macOS (Apple Silicon) · .zip",
  "linux-deb-amd64": "Linux · .deb (x64)",
  "linux-deb-arm64": "Linux · .deb (arm64)",
  "linux-appimage": "Linux · AppImage",
  "linux-flatpak": "Linux · Flatpak",
  "linux-tarball-x64": "Linux · tarball (x64)",
  windows: "Windows",
};

function classify(name: string): IdePlatform | null {
  const n = name.toLowerCase();
  if (n.endsWith(".sha1") || n.endsWith(".sha256") || n.endsWith(".zsync")) return null;
  if (n.startsWith("boxcode-cli-")) return null;
  if (n.endsWith(".dmg") && n.includes("arm64")) return "macos-arm64-dmg";
  if (n.includes("darwin-arm64") && n.endsWith(".zip")) return "macos-arm64-zip";
  if (n.includes("win32") || n.includes("windows") || n.endsWith(".exe") || n.endsWith(".msi")) {
    return "windows";
  }
  if (n.endsWith(".deb") && n.includes("amd64")) return "linux-deb-amd64";
  if (n.endsWith(".deb") && n.includes("arm64")) return "linux-deb-arm64";
  if (n.endsWith(".appimage")) return "linux-appimage";
  if (n.endsWith(".flatpak")) return "linux-flatpak";
  if (n.includes("linux-x64") && n.endsWith(".tar.gz")) return "linux-tarball-x64";
  return null;
}

type GhAsset = { name: string; browser_download_url: string; size: number };
type GhRelease = {
  tag_name: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  html_url: string;
  assets: GhAsset[];
};

function mapRelease(rel: GhRelease): IdeRelease {
  const seen = new Set<IdePlatform>();
  const assets: IdeAsset[] = [];
  const order: IdePlatform[] = [
    "macos-arm64-dmg",
    "macos-arm64-zip",
    "linux-deb-amd64",
    "linux-deb-arm64",
    "linux-appimage",
    "linux-flatpak",
    "linux-tarball-x64",
    "windows",
  ];
  const byPlatform = new Map<IdePlatform, GhAsset>();
  for (const asset of rel.assets) {
    const platform = classify(asset.name);
    if (!platform) continue;
    if (!byPlatform.has(platform)) byPlatform.set(platform, asset);
  }
  if (byPlatform.has("macos-arm64-dmg")) {
    byPlatform.delete("macos-arm64-zip");
  }
  for (const platform of order) {
    const asset = byPlatform.get(platform);
    if (!asset || seen.has(platform)) continue;
    seen.add(platform);
    assets.push({
      platform,
      label: LABELS[platform],
      name: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
    });
  }
  return {
    tag: rel.tag_name,
    name: rel.name ?? rel.tag_name,
    publishedAt: rel.published_at,
    htmlUrl: rel.html_url,
    assets,
  };
}

export async function fetchLatestIdeRelease(): Promise<IdeRelease | null> {
  const res = await fetch("https://api.github.com/repos/HolboxAI/boxcode-ide/releases?per_page=15", {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "boxcode-web",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const releases = (await res.json()) as GhRelease[];
  const numbered = releases.find(
    (r) => !r.draft && /^\d+\.\d+/.test(r.tag_name),
  );
  if (!numbered) return null;
  return mapRelease(numbered);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

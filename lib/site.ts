export const LINKS = {
  home: "/",
  cli: "/cli",
  ide: "/ide",
  download: "/download",
  docs: "/docs",
  holbox: "https://holbox.ai",
  boxcodeSh: "https://boxcode.sh",
  boxcodeRepo: "https://github.com/HolboxAI/boxcode",
  boxcodeReadme: "https://github.com/HolboxAI/boxcode#readme",
  boxcodeReleases: "https://github.com/HolboxAI/boxcode/releases",
  ideRepo: "https://github.com/HolboxAI/boxcode-ide",
  ideReadme: "https://github.com/HolboxAI/boxcode-ide#readme",
  ideReleases: "https://github.com/HolboxAI/boxcode-ide/releases",
  githubOrg: "https://github.com/HolboxAI",
} as const;

export const INSTALL = {
  unix: "curl -fsSL https://boxcode.sh/install.sh | bash",
  windows: "irm https://boxcode.sh/install.ps1 | iex",
} as const;

export const SLASH_COMMANDS: { cmd: string; purpose: string }[] = [
  { cmd: "/plan", purpose: "Research first, then approve a plan before any file changes" },
  { cmd: "/provider", purpose: "Pick a provider, then a model" },
  { cmd: "/model", purpose: "Re-pick the model for the current provider" },
  { cmd: "/init", purpose: "Explore the project and write BOXCODE.md" },
  { cmd: "/resume", purpose: "Reload this directory's last session" },
  { cmd: "/pull", purpose: "Switch to a different project this machine has published" },
  { cmd: "/compact", purpose: "Summarize a long conversation, freeing context" },
  { cmd: "/usage", purpose: "Local token usage — today, last 7 days, all time" },
  { cmd: "/rollback", purpose: "Undo every file the model wrote this session" },
];

export const NAV = [
  { href: LINKS.cli, label: "CLI" },
  { href: LINKS.ide, label: "IDE" },
  { href: LINKS.download, label: "Download" },
  { href: LINKS.docs, label: "Docs" },
] as const;

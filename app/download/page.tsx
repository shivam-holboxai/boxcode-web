import type { Metadata } from "next";
import { DownloadButtons } from "@/components/download-buttons";
import { Button, Container } from "@/components/ui/primitives";
import { InstallSwitcher } from "@/components/ui/install-switcher";
import { fetchLatestIdeRelease } from "@/lib/github-releases";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download",
  description: "Download Boxcode IDE from GitHub Releases, and install the CLI with one command.",
};

export default async function DownloadPage() {
  const release = await fetchLatestIdeRelease();

  return (
    <>
      <section className="border-b border-line">
        <Container className="py-16 lg:py-24">
          <p className="eyebrow">Download</p>
          <h1 className="t-display mt-4 max-w-[14ch]">IDE from GitHub. CLI in one line.</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted">
            The editor is packaged on{" "}
            <a href={LINKS.ideReleases} className="text-ink underline-offset-2 hover:underline">
              HolboxAI/boxcode-ide
            </a>
            . The agent binary is a separate install from HolboxAI/boxcode.
          </p>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid gap-12 py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">IDE</p>
            <h2 className="t-title mt-3">Boxcode IDE</h2>
            {release ? (
              <>
                <p className="mt-3 text-sm text-muted">
                  {release.name} · {new Date(release.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="mt-6">
                  <DownloadButtons assets={release.assets} />
                </div>
                <p className="mt-8 max-w-md text-sm text-muted">
                  macOS builds are unsigned while the IDE is in development. After dragging into
                  Applications:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-[8px] border border-line bg-canvas-2 p-3 font-mono text-[12px]">
                  xattr -cr &quot;/Applications/Boxcode IDE.app&quot;
                </pre>
                <p className="mt-4 text-sm">
                  <a href={release.htmlUrl} className="text-ink underline-offset-2 hover:underline">
                    All assets for this release
                  </a>
                </p>
              </>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-muted">Could not load GitHub Releases right now.</p>
                <div className="mt-4">
                  <Button href={LINKS.ideReleases} variant="line" external>
                    Open releases on GitHub
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow">CLI</p>
            <h2 className="t-title mt-3">boxcode</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Checksum-verified prebuilt binary. The IDE chat participant expects this on your PATH.
            </p>
            <div className="mt-6">
              <InstallSwitcher />
            </div>
            <p className="mt-4 text-sm">
              <a href={LINKS.boxcodeReleases} className="text-ink underline-offset-2 hover:underline">
                CLI releases
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

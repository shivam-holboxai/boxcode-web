import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Docs",
  description: "Documentation for Boxcode CLI and IDE lives in the GitHub repositories.",
};

const DOCS = [
  {
    title: "CLI readme",
    body: "Install, slash commands, approval model, configuration, architecture.",
    href: LINKS.boxcodeReadme,
  },
  {
    title: "IDE readme",
    body: "Code-OSS fork, ACP transport, bundled extensions, how to build.",
    href: LINKS.ideReadme,
  },
  {
    title: "CLI releases",
    body: "Tagged binaries for macOS, Linux, and Windows.",
    href: LINKS.boxcodeReleases,
  },
  {
    title: "IDE releases",
    body: "Editor packages: dmg, deb, AppImage, Flatpak, and more as they ship.",
    href: LINKS.ideReleases,
  },
];

export default function DocsPage() {
  return (
    <section>
      <Container className="py-16 lg:py-24">
        <p className="eyebrow">Docs</p>
        <h1 className="t-display mt-4 max-w-[16ch]">The manuals are the repositories.</h1>
        <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted">
          This site does not duplicate the READMEs. Those files are what ships with the product.
        </p>
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {DOCS.map((doc) => (
            <li key={doc.href}>
              <a
                href={doc.href}
                className="block rounded-[8px] border border-line bg-canvas-2 p-6 hover:border-line-strong"
                target="_blank"
                rel="noreferrer"
              >
                <h2 className="text-lg font-medium tracking-tight">{doc.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{doc.body}</p>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

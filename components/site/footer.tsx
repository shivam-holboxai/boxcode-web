import Link from "next/link";
import { Mark } from "@/components/mark";
import { Container } from "@/components/ui/primitives";
import { LINKS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mark flex items-center gap-2.5 text-ink">
            <Mark className="h-4 w-auto" />
            <span className="text-sm font-medium">boxcode</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            An AI coding harness. The same agent in the terminal and the editor.
          </p>
          <p className="mt-4 text-sm text-muted">
            A{" "}
            <a href={LINKS.holbox} className="text-ink underline-offset-2 hover:underline">
              Holbox.ai
            </a>{" "}
            product. MIT licensed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <Link href={LINKS.cli} className="text-muted hover:text-ink">
            CLI
          </Link>
          <Link href={LINKS.ide} className="text-muted hover:text-ink">
            IDE
          </Link>
          <Link href={LINKS.download} className="text-muted hover:text-ink">
            Download
          </Link>
          <Link href={LINKS.docs} className="text-muted hover:text-ink">
            Docs
          </Link>
          <a href={LINKS.boxcodeRepo} className="text-muted hover:text-ink" target="_blank" rel="noreferrer">
            GitHub CLI
          </a>
          <a href={LINKS.ideRepo} className="text-muted hover:text-ink" target="_blank" rel="noreferrer">
            GitHub IDE
          </a>
        </div>
      </Container>
    </footer>
  );
}

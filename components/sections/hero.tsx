import { ProductFrame } from "@/components/ui/product-frame";
import { Button, Container } from "@/components/ui/primitives";
import { InstallSwitcher } from "@/components/ui/install-switcher";
import { LINKS } from "@/lib/site";

export function Hero() {
  return (
    <section className="border-b border-line">
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-24">
        <div>
          <p className="eyebrow">AI harness · CLI and IDE</p>
          <h1 className="t-display mt-5 max-w-[14ch] text-balance">
            The coding agent that waits for you.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-7 text-muted">
            Boxcode reads your files and runs your commands. Destructive actions wait for{" "}
            <strong className="font-medium text-ink">y/n</strong>. There is no allow-everything
            key — and catastrophic commands are never offered.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={LINKS.download}>Download IDE</Button>
            <Button href={LINKS.cli} variant="line">
              Explore the CLI
            </Button>
          </div>
          <div className="mt-8">
            <InstallSwitcher />
            <p className="mt-3 text-sm text-muted">
              Checksum-verified binary — no Rust toolchain. Already installed?{" "}
              <code className="font-mono text-ink">boxcode --upgrade</code>
            </p>
          </div>
        </div>
        <ProductFrame />
      </Container>
    </section>
  );
}

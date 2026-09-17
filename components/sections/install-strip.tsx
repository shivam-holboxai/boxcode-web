import { Button, Container } from "@/components/ui/primitives";
import { InstallSwitcher } from "@/components/ui/install-switcher";
import { LINKS } from "@/lib/site";

export function InstallStrip() {
  return (
    <section>
      <Container className="grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Install</p>
          <h2 className="t-title mt-3">Start in the directory you already work in.</h2>
          <p className="mt-4 text-[15px] leading-7 text-muted">
            The CLI is a checksum-verified binary. The IDE is a Code-OSS build that talks to that
            same binary. Install both, or just the one you need.
          </p>
          <div className="mt-6">
            <Button href={LINKS.download}>Download IDE for your OS</Button>
          </div>
        </div>
        <InstallSwitcher />
      </Container>
    </section>
  );
}

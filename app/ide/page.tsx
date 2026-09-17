import type { Metadata } from "next";
import { Button, Container } from "@/components/ui/primitives";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "IDE",
  description:
    "Boxcode IDE is a Code-OSS editor. The agent brain stays in the boxcode CLI and is reused over ACP.",
};

export default function IdePage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-16 lg:py-24">
          <p className="eyebrow">IDE</p>
          <h1 className="t-display mt-4 max-w-[16ch]">The same agent, in the editor.</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted">
            Boxcode IDE is a Code-OSS fork. It owns the editor surface only — the agent loop,
            tools, and approval gate stay in the Rust CLI. The chat participant launches{" "}
            <code className="font-mono text-ink">boxcode --acp</code> and speaks JSON-RPC over stdio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={LINKS.download}>Download IDE</Button>
            <Button href={LINKS.ideRepo} variant="line" external>
              Source on GitHub
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid gap-10 py-16 md:grid-cols-2">
          <article>
            <h2 className="t-title">Two repos, one brain.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              HolboxAI/boxcode is the daemon: agent loop, tool execution, approval gating.
              boxcode-ide is the face. No agent logic is reimplemented in TypeScript.
            </p>
          </article>
          <article>
            <h2 className="t-title">Chat-first landing.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              Open a folder and send a message. Ask, edit, and agent modes register boxcode as
              the default chat participant. The first message walks you through a provider and
              API key if ~/.boxcode/config.toml is not there yet.
            </p>
          </article>
          <article>
            <h2 className="t-title">Its own themes.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              Boxcode Dark and Boxcode Light ship in-tree — an amber/orange accent on Dark Modern
              and Light Modern. The site you are on uses the product’s violet for marketing; the
              editor keeps the IDE themes.
            </p>
          </article>
          <article>
            <h2 className="t-title">Browser in the editor.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              An Integrated Browser pane, check_in_browser, and auto-open of localhost dev servers
              so frontend work does not leave the window.
            </p>
          </article>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <p className="eyebrow">Install order</p>
          <h2 className="t-title mt-3">CLI first, then the editor.</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
            The chat participant shells out to a boxcode binary already on your PATH. Install the
            CLI, then download the IDE. macOS dev builds are unsigned while the IDE is still in
            development — after dragging to Applications, clear quarantine with{" "}
            <code className="font-mono text-ink">xattr -cr &quot;/Applications/Boxcode IDE.app&quot;</code>
            .
          </p>
          <div className="mt-8">
            <Button href={LINKS.download}>Go to downloads</Button>
          </div>
        </Container>
      </section>
    </>
  );
}

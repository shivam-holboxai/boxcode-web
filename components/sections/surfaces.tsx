import { Button, Container } from "@/components/ui/primitives";
import { LINKS } from "@/lib/site";

export function Surfaces() {
  return (
    <section className="border-b border-line">
      <Container className="py-20">
        <p className="eyebrow">Two surfaces. One brain.</p>
        <h2 className="t-title mt-3 max-w-xl">The same agent in the terminal and the editor.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-[8px] border border-line bg-canvas-2 p-7">
            <p className="eyebrow">CLI</p>
            <h3 className="mt-3 text-xl font-medium tracking-tight">boxcode</h3>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              A native Rust TUI. Sessions print as ordinary terminal output, so scrollback,
              selection, and search still work. MIT licensed. macOS, Linux, Windows.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li>Diffs for every write, before it lands</li>
              <li>/plan, /rollback, /provider</li>
              <li>Any OpenAI-compatible endpoint</li>
            </ul>
            <div className="mt-6">
              <Button href={LINKS.cli} variant="line">
                CLI details
              </Button>
            </div>
          </article>
          <article className="rounded-[8px] border border-line bg-canvas-2 p-7">
            <p className="eyebrow">IDE</p>
            <h3 className="mt-3 text-xl font-medium tracking-tight">Boxcode IDE</h3>
            <p className="mt-3 text-[15px] leading-7 text-muted">
              A Code-OSS editor. The chat participant shells out to the same{" "}
              <code className="font-mono text-ink">boxcode --acp</code> binary already on your PATH.
              No second agent.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li>Ask, edit, and agent chat in the editor</li>
              <li>Boxcode Light and Dark themes</li>
              <li>Integrated browser for localhost</li>
            </ul>
            <div className="mt-6">
              <Button href={LINKS.ide} variant="line">
                IDE details
              </Button>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}

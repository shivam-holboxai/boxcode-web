import type { Metadata } from "next";
import { Button, Container } from "@/components/ui/primitives";
import { InstallSwitcher } from "@/components/ui/install-switcher";
import { LINKS, SLASH_COMMANDS } from "@/lib/site";

export const metadata: Metadata = {
  title: "CLI",
  description: "Boxcode in the terminal. A native Rust coding agent that waits before anything destructive.",
};

export default function CliPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-16 lg:py-24">
          <p className="eyebrow">CLI</p>
          <h1 className="t-display mt-4 max-w-[16ch]">A coding assistant that lives in your terminal.</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-7 text-muted">
            It reads your files, runs your commands, and waits for you before every destructive
            one. Connects to any OpenAI-compatible LLM endpoint. Written in Rust. MIT licensed.
          </p>
          <div className="mt-8">
            <InstallSwitcher />
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid gap-10 py-16 md:grid-cols-2">
          <div>
            <h2 className="t-title">Every file change is a diff.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              A write is approved by looking at red and green lines with real line numbers, against
              the file as it is on disk right now. The preview is produced by the same code that
              applies the edit, so what you approve and what happens cannot differ.
            </p>
          </div>
          <div>
            <h2 className="t-title">/plan, then write.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              Research first, get an editable plan.md in your project, then approve the approach
              before any file changes. /rollback undoes every file the model wrote this session —
              your own edits are never touched.
            </p>
          </div>
          <div>
            <h2 className="t-title">Publish, auth, a database.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              Say “publish this” and get a shareable link. Add sign-up, a per-project SQLite file,
              live-reload, and change requests from the live page. Deploy to Vercel or Netlify in
              the same conversation.
            </p>
          </div>
          <div>
            <h2 className="t-title">Open endpoints.</h2>
            <p className="mt-4 text-[15px] leading-7 text-muted">
              /provider picks a provider and a model. Custom endpoints work. Existing
              DEEPSEEK_API_KEY (and the rest) are picked up automatically. Configuration lives in
              ~/.boxcode/config.toml.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16">
          <p className="eyebrow">Slash commands</p>
          <h2 className="t-title mt-3">Drive the session without leaving the prompt.</h2>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {SLASH_COMMANDS.map((row) => (
              <li key={row.cmd} className="grid gap-2 py-3 sm:grid-cols-[9rem_1fr]">
                <code className="font-mono text-sm text-accent">{row.cmd}</code>
                <span className="text-sm text-muted">{row.purpose}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section>
        <Container className="flex flex-wrap items-center justify-between gap-4 py-16">
          <p className="text-muted">Need the editor surface as well?</p>
          <Button href={LINKS.ide} variant="line">
            Boxcode IDE
          </Button>
        </Container>
      </section>
    </>
  );
}

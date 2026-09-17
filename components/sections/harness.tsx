import { Container } from "@/components/ui/primitives";

const STEPS = [
  {
    n: "01",
    title: "Describe the work",
    body: "A sentence carries the intent. There is no flag-heavy command for most of this, on purpose.",
  },
  {
    n: "02",
    title: "It plans, edits, and runs",
    body: "/plan researches first. Every file change arrives as a diff against the disk as it is right now.",
  },
  {
    n: "03",
    title: "You approve what can destroy",
    body: "/rollback undoes every file written this session. Shell commands that already ran are named, not pretended away.",
  },
];

export function Harness() {
  return (
    <section className="border-b border-line">
      <Container className="py-20">
        <p className="eyebrow">How the harness works</p>
        <h2 className="t-title mt-3 max-w-xl">Inspect, plan, edit, run — then wait where it matters.</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n}>
              <p className="font-mono text-xs text-accent">{step.n}</p>
              <h3 className="mt-3 text-lg font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

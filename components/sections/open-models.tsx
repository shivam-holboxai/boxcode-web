import { Container } from "@/components/ui/primitives";
import { LINKS } from "@/lib/site";

export function OpenModels() {
  return (
    <section className="border-b border-line">
      <Container className="py-20">
        <p className="eyebrow">Open endpoints</p>
        <h2 className="t-title mt-3 max-w-xl">Point it at any OpenAI-compatible model.</h2>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
          Run <code className="font-mono text-ink">/provider</code> and pick one, or set{" "}
          <code className="font-mono text-ink">BOXCODE_ENDPOINT</code>. Hosted, self-hosted, or a
          model you deployed yourself — nothing is hardcoded to one vendor.
        </p>
        <p className="mt-6 text-sm text-muted">
          Need GPUs for open weights?{" "}
          <a href={LINKS.holbox} className="text-ink underline-offset-2 hover:underline">
            Holbox GPU Router
          </a>{" "}
          is a separate product.
        </p>
      </Container>
    </section>
  );
}

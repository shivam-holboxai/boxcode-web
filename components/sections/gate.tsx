import { BeforeAfter } from "@/components/ui/before-after";
import { Container } from "@/components/ui/primitives";

export function Gate() {
  return (
    <section className="border-b border-line">
      <Container className="grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">The gate</p>
          <h2 className="t-title mt-3">You approve what can destroy.</h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-muted">
            Building something is dozens of ordinary steps. Prompting for every mkdir and npm
            install buries the dangerous ones. So deleting, force-pushing, publishing, and
            putting anything on the internet still wait for your yes — shown in full. Everything
            else just runs.
          </p>
        </div>
        <BeforeAfter />
      </Container>
    </section>
  );
}

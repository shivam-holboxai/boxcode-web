import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export const metadata = { title: "Promo full" };

export default function PromoFullPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg">
        <p className="eyebrow">Promo</p>
        <h1 className="t-title mt-3">Signup seats are full</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">
          The first-signup $5 credit batch is limited. Existing accounts can still sign in.
          If you already have a seat,{" "}
          <Link href="/login" className="text-ink underline-offset-2 hover:underline">
            sign in
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}

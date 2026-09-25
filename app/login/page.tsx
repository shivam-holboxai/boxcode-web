import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/primitives";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) {
    redirect(params.callbackUrl || "/account");
  }

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">Account</p>
        <h1 className="t-title mt-3">Sign in to Boxcode</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">
          Google only — the same account for the website, CLI, and IDE. First
          signups (while seats remain) get a $5 DeepSeek credit via{" "}
          <code className="font-mono text-ink">llm.boxcode.sh</code>.
        </p>
        {params.error ? (
          <p className="mt-4 rounded-[8px] border border-line bg-canvas-2 px-3 py-2 text-sm text-term-warn">
            {params.error === "SignupFailed"
              ? "Signup failed. Check proxy admin credentials and try again."
              : params.error}
          </p>
        ) : null}
        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: params.callbackUrl || "/account" });
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-4 py-3 text-sm font-medium text-canvas"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </Container>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { findUserByEmail, getUserSecret } from "@/lib/db";
import { getProxyKeyUsage, proxyChatEndpoint, proxyDefaultModel } from "@/lib/proxy";
import { Container } from "@/components/ui/primitives";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?callbackUrl=/account");

  const user = findUserByEmail(session.user.email);
  if (!user) redirect("/login");

  let spent = 0;
  let remaining: number | null = 5;
  if (user.proxy_key_id != null) {
    try {
      const usage = await getProxyKeyUsage(user.proxy_key_id);
      spent = Number(usage.key.total?.usd || 0);
      remaining =
        usage.key.lifetime_remaining ??
        (usage.key.lifetime_usd_limit != null
          ? Math.max(0, Number(usage.key.lifetime_usd_limit) - spent)
          : null);
    } catch {
      remaining = null;
    }
  }

  const apiKey = getUserSecret(user.id);
  const endpoint = proxyChatEndpoint();
  const model = proxyDefaultModel();

  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="t-title mt-3">{user.email}</h1>
          <p className="mt-2 text-sm text-muted">
            Promo credit via <code className="font-mono">llm.boxcode.sh</code>
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="rounded-[8px] border border-line px-3 py-2 text-sm">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[8px] border border-line bg-canvas-2 p-4">
          <p className="eyebrow">Spent</p>
          <p className="mt-2 font-mono text-2xl">${spent.toFixed(4)}</p>
        </div>
        <div className="rounded-[8px] border border-line bg-canvas-2 p-4">
          <p className="eyebrow">Remaining</p>
          <p className="mt-2 font-mono text-2xl">
            {remaining == null ? "—" : `$${remaining.toFixed(4)}`}
          </p>
        </div>
        <div className="rounded-[8px] border border-line bg-canvas-2 p-4">
          <p className="eyebrow">Key</p>
          <p className="mt-2 font-mono text-sm">{user.proxy_key_prefix || "—"}</p>
        </div>
      </div>

      <div className="mt-10 rounded-[8px] border border-line p-5">
        <h2 className="text-sm font-medium">CLI / IDE config</h2>
        <p className="mt-2 text-sm text-muted">
          Prefer <code className="font-mono text-ink">boxcode login</code> — or set these by hand:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[6px] bg-term p-4 font-mono text-[12px] leading-5 text-term-fg">
{`export BOXCODE_ENDPOINT=${endpoint}
export BOXCODE_MODEL=${model}
export BOXCODE_API_KEY=${apiKey || "(unavailable)"}`}
        </pre>
        <p className="mt-3 text-sm text-muted">
          IDE reads the same <code className="font-mono">~/.boxcode/config.toml</code> after CLI
          login.{" "}
          <Link href="/login/device" className="text-ink underline-offset-2 hover:underline">
            Link a device
          </Link>
        </p>
      </div>
    </Container>
  );
}

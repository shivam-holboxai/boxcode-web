import { NextResponse } from "next/server";
import { auth, isAdminEmail } from "@/lib/auth";
import {
  dauToday,
  getSettings,
  listUsers,
  liveUsers,
  setSeatLimit,
  signupCount,
} from "@/lib/db";
import { listProxyKeys, revokeProxyKey } from "@/lib/proxy";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const settings = getSettings();
  let keys: Awaited<ReturnType<typeof listProxyKeys>> = [];
  let proxyError: string | null = null;
  try {
    keys = await listProxyKeys();
  } catch (e) {
    proxyError = e instanceof Error ? e.message : String(e);
  }

  const byId = new Map(keys.map((k) => [k.id, k]));
  const users = listUsers().map((u) => {
    const k = u.proxy_key_id != null ? byId.get(u.proxy_key_id) : undefined;
    return {
      ...u,
      spend_usd: k?.total?.usd ?? null,
      lifetime_usd_limit: k?.lifetime_usd_limit ?? null,
      lifetime_remaining: k?.lifetime_remaining ?? null,
      key_revoked: Boolean(k?.revoked_at),
    };
  });

  return NextResponse.json({
    settings,
    dau_today: dauToday(),
    live_users: liveUsers(15),
    signup_count: signupCount(),
    users,
    proxy_keys: keys,
    proxy_error: proxyError,
    proxy_host: process.env.PROXY_ADMIN_URL || "https://llm.boxcode.sh",
  });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    promo_seat_limit?: number;
    revoke_proxy_key_id?: number;
  };
  if (typeof body.promo_seat_limit === "number") {
    setSeatLimit(body.promo_seat_limit);
  }
  if (typeof body.revoke_proxy_key_id === "number") {
    const keys = await listProxyKeys();
    const key = keys.find((k) => k.id === body.revoke_proxy_key_id);
    if (key?.protected || key?.name?.startsWith("system:")) {
      return NextResponse.json({ error: "protected system key" }, { status: 403 });
    }
    await revokeProxyKey(body.revoke_proxy_key_id);
  }
  return NextResponse.json({ ok: true, settings: getSettings() });
}

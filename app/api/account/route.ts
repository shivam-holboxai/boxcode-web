import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserByEmail, getUserSecret } from "@/lib/db";
import { getProxyKeyUsage, proxyChatEndpoint, proxyDefaultModel } from "@/lib/proxy";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = findUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  let usage = null;
  if (user.proxy_key_id != null) {
    try {
      usage = await getProxyKeyUsage(user.proxy_key_id);
    } catch {
      usage = null;
    }
  }

  return NextResponse.json({
    email: user.email,
    name: user.name,
    created_at: user.created_at,
    promo_granted: Boolean(user.promo_granted),
    proxy_key_name: user.proxy_key_name,
    proxy_key_prefix: user.proxy_key_prefix,
    endpoint: proxyChatEndpoint(),
    model: proxyDefaultModel(),
    // Secret only for the signed-in owner — never log this response.
    api_key: getUserSecret(user.id),
    usage,
  });
}

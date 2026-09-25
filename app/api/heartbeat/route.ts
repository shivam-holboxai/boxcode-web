import { NextResponse } from "next/server";
import {
  findSession,
  findUserById,
  getUserSecret,
  recordHeartbeat,
  touchSession,
} from "@/lib/db";
import { proxyChatEndpoint, proxyDefaultModel } from "@/lib/proxy";

export const runtime = "nodejs";

function bearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1]?.trim() || "";
}

export async function POST(req: Request) {
  const token = bearer(req);
  if (!token) return NextResponse.json({ error: "missing token" }, { status: 401 });
  const session = findSession(token);
  if (!session) return NextResponse.json({ error: "unknown session" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { client?: string };
  const client = body.client || session.client || "cli";
  touchSession(token);
  recordHeartbeat(session.user_id, client);
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const token = bearer(req);
  if (!token) return NextResponse.json({ error: "missing token" }, { status: 401 });
  const session = findSession(token);
  if (!session) return NextResponse.json({ error: "unknown session" }, { status: 401 });
  const user = findUserById(session.user_id);
  if (!user) return NextResponse.json({ error: "user missing" }, { status: 404 });
  return NextResponse.json({
    email: user.email,
    endpoint: proxyChatEndpoint(),
    model: proxyDefaultModel(),
    api_key: getUserSecret(user.id),
  });
}

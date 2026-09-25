import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  findUserById,
  getDeviceByDeviceCode,
  getUserSecret,
} from "@/lib/db";
import { proxyChatEndpoint, proxyDefaultModel } from "@/lib/proxy";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { device_code?: string };
  const deviceCode = body.device_code || "";
  if (!deviceCode) {
    return NextResponse.json({ error: "device_code required" }, { status: 400 });
  }

  const row = getDeviceByDeviceCode(deviceCode);
  if (!row) {
    return NextResponse.json({ error: "unknown device_code" }, { status: 404 });
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ status: "expired" }, { status: 410 });
  }
  if (row.status === "pending") {
    return NextResponse.json({ status: "pending" });
  }
  if (row.status !== "approved" || !row.user_id) {
    return NextResponse.json({ status: row.status });
  }

  const user = findUserById(row.user_id);
  const apiKey = getUserSecret(row.user_id);
  if (!user || !apiKey) {
    return NextResponse.json({ error: "credentials unavailable" }, { status: 500 });
  }

  // Return a fresh client session token for heartbeats. Stored hash was set at approve;
  // we also mint a plaintext token only once at approve time — recover by creating a new one
  // if poll happens with approved status: clients should use the token from first approved poll.
  // For simplicity, issue a new session token on first poll after approve.
  const sessionToken = randomBytes(32).toString("hex");
  const { createSession } = await import("@/lib/db");
  createSession(user.id, sessionToken, "cli");

  return NextResponse.json({
    status: "approved",
    email: user.email,
    endpoint: proxyChatEndpoint(),
    model: proxyDefaultModel(),
    api_key: apiKey,
    session_token: sessionToken,
  });
}

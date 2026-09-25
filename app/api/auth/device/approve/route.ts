import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveDevice, findUserByEmail } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "sign in required" }, { status: 401 });
  }
  const user = findUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { user_code?: string };
  const userCode = (body.user_code || "").trim().toUpperCase();
  if (!userCode) {
    return NextResponse.json({ error: "user_code required" }, { status: 400 });
  }

  try {
    const sessionToken = randomBytes(32).toString("hex");
    approveDevice(userCode, user.id, sessionToken);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status =
      msg === "UNKNOWN_CODE" ? 404 : msg === "EXPIRED" ? 410 : msg === "ALREADY_USED" ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

import { NextResponse } from "next/server";
import { createDeviceCode } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  const { deviceCode, userCode, expiresAt } = createDeviceCode();
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3100";
  return NextResponse.json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: `${base.replace(/\/$/, "")}/login/device`,
    verification_uri_complete: `${base.replace(/\/$/, "")}/login/device?code=${userCode}`,
    expires_at: expiresAt,
    interval: 2,
  });
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Container } from "@/components/ui/primitives";

function DeviceForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState(params.get("code") || "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/device/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent(`/login/device?code=${code}`)}`);
          return;
        }
        throw new Error(data.error || "Could not approve");
      }
      setMsg("Approved. You can return to the CLI or IDE.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label className="eyebrow" htmlFor="code">
          Device code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123-DEF456"
          className="mt-2 w-full rounded-[8px] border border-line bg-canvas-2 px-3 py-3 font-mono text-sm tracking-wider"
          required
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex rounded-[8px] bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink disabled:opacity-50"
      >
        {busy ? "Approving…" : "Approve device"}
      </button>
      {msg ? <p className="text-sm text-muted">{msg}</p> : null}
    </form>
  );
}

export default function DeviceLoginPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">CLI · IDE</p>
        <h1 className="t-title mt-3">Link this device</h1>
        <p className="mt-4 text-[15px] leading-7 text-muted">
          Sign in with Google on the website, then enter the code shown in{" "}
          <code className="font-mono text-ink">boxcode login</code>.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading…</p>}>
          <DeviceForm />
        </Suspense>
      </div>
    </Container>
  );
}

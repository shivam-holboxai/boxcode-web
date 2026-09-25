"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/primitives";

type AdminPayload = {
  settings: { promo_seat_limit: number; promo_seats_used: number };
  dau_today: number;
  live_users: number;
  signup_count: number;
  proxy_host: string;
  proxy_error: string | null;
  users: {
    id: number;
    email: string;
    created_at: string;
    proxy_key_name: string | null;
    proxy_key_id: number | null;
    spend_usd: number | null;
    lifetime_usd_limit: number | null;
    lifetime_remaining: number | null;
    key_revoked: boolean;
  }[];
  proxy_keys: {
    id: number;
    name: string;
    prefix: string;
    protected?: boolean;
    revoked_at: string | null;
    lifetime_usd_limit: number | null;
    total?: { usd: number };
    lifetime_remaining?: number | null;
  }[];
};

export default function AdminPage() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState("10");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin", { cache: "no-store" });
    if (res.status === 403) {
      setError("Admin only — add your Google email to ADMIN_EMAILS.");
      return;
    }
    if (!res.ok) {
      setError("Failed to load admin data");
      return;
    }
    const json = (await res.json()) as AdminPayload;
    setData(json);
    setLimit(String(json.settings.promo_seat_limit));
    setError("");
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
    const t = setInterval(() => load().catch(() => {}), 15000);
    return () => clearInterval(t);
  }, [load]);

  async function saveLimit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ promo_seat_limit: Number(limit) }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: number) {
    if (!confirm(`Revoke proxy key #${id}?`)) return;
    setBusy(true);
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ revoke_proxy_key_id: id }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-16">
      <p className="eyebrow">Ops</p>
      <h1 className="t-title mt-3">Boxcode dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Signups, DAU, and spend from{" "}
        <a
          className="text-ink underline-offset-2 hover:underline"
          href="https://llm.boxcode.sh/admin"
        >
          llm.boxcode.sh/admin
        </a>
        .
      </p>

      {error ? <p className="mt-6 text-sm text-term-warn">{error}</p> : null}

      {data ? (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Signups" value={String(data.signup_count)} />
            <Stat
              label="Promo seats"
              value={`${data.settings.promo_seats_used} / ${data.settings.promo_seat_limit}`}
            />
            <Stat label="DAU today" value={String(data.dau_today)} />
            <Stat label="Live (15m)" value={String(data.live_users)} />
          </div>

          <form onSubmit={saveLimit} className="mt-8 flex flex-wrap items-end gap-3">
            <div>
              <label className="eyebrow" htmlFor="limit">
                Seat limit
              </label>
              <input
                id="limit"
                type="number"
                min={0}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="mt-2 w-28 rounded-[8px] border border-line bg-canvas-2 px-3 py-2 font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-[8px] bg-accent px-4 py-2 text-sm font-medium text-accent-ink disabled:opacity-50"
            >
              Update limit
            </button>
          </form>

          {data.proxy_error ? (
            <p className="mt-4 text-sm text-term-warn">Proxy: {data.proxy_error}</p>
          ) : null}

          <h2 className="mt-12 text-sm font-medium">Users</h2>
          <div className="mt-3 overflow-x-auto rounded-[8px] border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Key</th>
                  <th className="px-3 py-2 font-medium">Spend</th>
                  <th className="px-3 py-2 font-medium">Left</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {u.proxy_key_name || "—"}
                      {u.key_revoked ? " (revoked)" : ""}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {u.spend_usd == null ? "—" : `$${u.spend_usd.toFixed(4)}`}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {u.lifetime_remaining == null
                        ? "—"
                        : `$${u.lifetime_remaining.toFixed(4)}`}
                    </td>
                    <td className="px-3 py-2">
                      {u.proxy_key_id != null && !u.key_revoked ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => revoke(u.proxy_key_id!)}
                          className="text-xs text-term-warn hover:underline"
                        >
                          Revoke
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 text-sm font-medium">Proxy keys ({data.proxy_host})</h2>
          <div className="mt-3 overflow-x-auto rounded-[8px] border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Prefix</th>
                  <th className="px-3 py-2 font-medium">Lifetime</th>
                  <th className="px-3 py-2 font-medium">Total USD</th>
                </tr>
              </thead>
              <tbody>
                {data.proxy_keys.map((k) => (
                  <tr key={k.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">
                      {k.name || "unnamed"}
                      {k.protected || k.name.startsWith("system:") ? " · protected" : ""}
                      {k.revoked_at ? " · revoked" : ""}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{k.prefix}</td>
                    <td className="px-3 py-2 font-mono">
                      {k.lifetime_usd_limit == null ? "—" : `$${k.lifetime_usd_limit}`}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {k.total?.usd == null ? "—" : `$${Number(k.total.usd).toFixed(4)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : !error ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : null}
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-line bg-canvas-2 p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-mono text-2xl">{value}</p>
    </div>
  );
}

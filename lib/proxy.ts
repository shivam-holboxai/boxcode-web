/**
 * Server-only client for https://llm.boxcode.sh admin API.
 * Never import this into client components.
 */

const DEFAULT_PROXY = "https://llm.boxcode.sh";

export function proxyBaseUrl() {
  return (process.env.PROXY_ADMIN_URL || process.env.PROXY_URL || DEFAULT_PROXY).replace(/\/$/, "");
}

export function proxyChatEndpoint() {
  return `${proxyBaseUrl()}/v1`;
}

export function proxyDefaultModel() {
  return process.env.PROXY_DEFAULT_MODEL || "deepseek-v4-flash";
}

function adminToken() {
  const token = process.env.PROXY_ADMIN_TOKEN || "";
  if (!token) throw new Error("PROXY_ADMIN_TOKEN is not set");
  return token;
}

async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${proxyBaseUrl()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${adminToken()}`,
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: { message: text } };
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data &&
      "error" in data &&
      typeof (data as { error?: { message?: string } }).error?.message === "string"
        ? (data as { error: { message: string } }).error.message
        : res.statusText;
    throw new Error(msg || `proxy admin ${res.status}`);
  }
  return data;
}

export type ProxyKey = {
  id: number;
  prefix: string;
  name: string;
  created_at: string;
  revoked_at: string | null;
  lifetime_usd_limit: number | null;
  protected?: boolean;
  today?: { calls: number; usd: number };
  total?: { calls: number; usd: number };
  lifetime_remaining?: number | null;
  token?: string;
};

export async function mintPromoKey(name: string, lifetimeUsd = 5): Promise<ProxyKey> {
  return (await adminFetch("/admin/api/keys", {
    method: "POST",
    body: JSON.stringify({ name, lifetime_usd_limit: lifetimeUsd }),
  })) as ProxyKey;
}

export async function listProxyKeys(): Promise<ProxyKey[]> {
  const data = (await adminFetch("/admin/api/keys")) as { keys: ProxyKey[] };
  return data.keys || [];
}

export async function revokeProxyKey(id: number) {
  await adminFetch(`/admin/api/keys/${id}/revoke`, { method: "POST" });
}

export async function getProxyKeyUsage(id: number) {
  return (await adminFetch(`/admin/api/keys/${id}/usage`)) as {
    key: ProxyKey;
    days: { day: string; calls: number; usd: number }[];
  };
}

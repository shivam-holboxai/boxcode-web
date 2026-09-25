# Cutover checklist — auth, promo seats, llm.boxcode.sh

## Proxy (`llm.boxcode.sh`)

1. Deploy the proxy changes (lifetime limit + protected `system:` names).
2. In [https://llm.boxcode.sh/admin](https://llm.boxcode.sh/admin), ensure the ops key is named **`system:boxcode-ops`** (cannot be deleted).
3. Confirm DeepSeek balance is topped up (manual).
4. Keep `ADMIN_TOKEN` only on the proxy box and in the website server env — never in the browser.

## Website (`boxcode-web`)

Set secrets (see `.env.example`):

- `AUTH_SECRET`, `AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (OAuth redirect: `{AUTH_URL}/api/auth/callback/google`)
- `ADMIN_EMAILS` — Holbox ops Google emails
- `PROXY_ADMIN_URL=https://llm.boxcode.sh`
- `PROXY_ADMIN_TOKEN` — same as proxy `ADMIN_TOKEN`
- `DATABASE_PATH` — persistent volume for SQLite

Promo seat limit starts at **10**; raise from `/admin`.

## Clients

- CLI `1.11.14+`: `boxcode login` / `boxcode logout`
- IDE: uses `~/.boxcode/config.toml` after CLI login (same file)
- Override site URL for device flow: `BOXCODE_AUTH_URL=https://boxcode.sh`

## Verify

1. Google sign-in creates a user and mints `user:<id>:<email>` with lifetime $5.
2. 11th new Google account hits `/promo-full`.
3. `/admin` shows seats, DAU, spend from proxy.
4. `boxcode login` writes endpoint `https://llm.boxcode.sh/v1` + key.
5. Heartbeats move DAU / live counters.

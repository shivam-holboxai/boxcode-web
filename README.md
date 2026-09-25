# boxcode-web

Marketing site for the Boxcode AI harness — CLI and IDE on one Next.js app —
plus Google SSO, promo credits via **llm.boxcode.sh**, and an ops dashboard.

```bash
cp .env.example .env.local
# fill GOOGLE_*, AUTH_SECRET, PROXY_ADMIN_TOKEN, ADMIN_EMAILS
npm install
npm run dev -- --port 3100
```

## Auth & credits

- Sign in: `/login` (Google only)
- Account: `/account` (endpoint + $5 lifetime remaining)
- Device link: `/login/device` (for `boxcode login` / IDE)
- Admin: `/admin` (seats, DAU, spend) — `ADMIN_EMAILS`
- Proxy: [https://llm.boxcode.sh/admin](https://llm.boxcode.sh/admin)
- Promo seat limit defaults to **10**; raise from the dashboard

CLI:

```bash
boxcode login   # opens browser, writes ~/.boxcode/config.toml
boxcode logout
```

IDE reads the same `~/.boxcode/config.toml`.

## Env

See [.env.example](.env.example). `PROXY_ADMIN_URL` defaults to `https://llm.boxcode.sh`.

## Links

- CLI facts: [HolboxAI/boxcode](https://github.com/HolboxAI/boxcode)
- IDE downloads: [HolboxAI/boxcode-ide](https://github.com/HolboxAI/boxcode-ide)
- Company: [holbox.ai](https://holbox.ai)

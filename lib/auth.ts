import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  createPromoUser,
  encryptSecret,
  findUserByEmail,
  findUserByGoogleSub,
  getSettings,
  PROMO_LIFETIME_USD,
} from "@/lib/db";
import { mintPromoKey } from "@/lib/proxy";

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmails().has(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider !== "google") return false;
      const email = (user.email || "").toLowerCase();
      if (!email) return false;
      const sub = String(account.providerAccountId || profile?.sub || "");
      if (!sub) return false;

      const existing = findUserByEmail(email) || findUserByGoogleSub(sub);
      if (existing) return true;

      const settings = getSettings();
      if (settings.promo_seats_used >= settings.promo_seat_limit) {
        return "/promo-full";
      }

      // Mint happens in jwt callback on first session to keep signIn fast/simple.
      // Mark pending via cookie-less path: create user here.
      try {
        const local = email.split("@")[0].replace(/[^a-z0-9._-]/gi, "").slice(0, 24) || "user";
        // provisional name before id known — mint after insert using a temp then rename pattern:
        // mint with placeholder, then we update name to user:<id>:<local>
        const provisional = `user:pending:${local}:${Date.now().toString(36)}`;
        const minted = await mintPromoKey(provisional, PROMO_LIFETIME_USD);
        if (!minted.token) throw new Error("proxy did not return token");

        const created = createPromoUser({
          email,
          name: user.name || null,
          image: user.image || null,
          googleSub: sub,
          proxyKeyId: minted.id,
          proxyKeyName: provisional,
          proxyKeyPrefix: minted.prefix,
          proxyKeyEnc: encryptSecret(minted.token),
        });

        // Best-effort rename in our DB to final convention (proxy name stays as minted).
        const finalName = `user:${created.id}:${local}`;
        const { getDb } = await import("@/lib/db");
        getDb()
          .prepare("UPDATE users SET proxy_key_name = ? WHERE id = ?")
          .run(finalName, created.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "PROMO_FULL") return "/promo-full";
        console.error("signup failed", msg);
        return "/login?error=SignupFailed";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const row = findUserByEmail(user.email);
        if (row) {
          token.uid = row.id;
          token.isAdmin = isAdminEmail(row.email);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: number }).id = Number(token.uid || 0);
        (session.user as { isAdmin?: boolean }).isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});

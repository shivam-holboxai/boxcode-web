import Database from "better-sqlite3";
import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";
import fs from "fs";
import path from "path";

const DEFAULT_SEAT_LIMIT = 10;
const PROMO_LIFETIME_USD = 5;

export type UserRow = {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  google_sub: string;
  created_at: string;
  proxy_key_id: number | null;
  proxy_key_name: string | null;
  proxy_key_prefix: string | null;
  promo_granted: number;
};

export type SettingsRow = {
  promo_seat_limit: number;
  promo_seats_used: number;
};

function dbPath() {
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "boxcode.db");
}

function encryptionKey() {
  const secret = process.env.AUTH_SECRET || "dev-only-change-me-boxcode-auth-secret!!";
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(blob: string): string {
  const [v, ivHex, tagHex, dataHex] = blob.split(":");
  if (v !== "v1") throw new Error("unknown secret format");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

let _db: Database.Database | null = null;

export function getDb() {
  if (_db) return _db;
  const dest = dbPath();
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  _db = new Database(dest);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      google_sub TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      proxy_key_id INTEGER,
      proxy_key_name TEXT,
      proxy_key_prefix TEXT,
      proxy_key_enc TEXT,
      promo_granted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      promo_seat_limit INTEGER NOT NULL DEFAULT ${DEFAULT_SEAT_LIMIT},
      promo_seats_used INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS device_codes (
      device_code TEXT PRIMARY KEY,
      user_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      user_id INTEGER,
      session_token_hash TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      client TEXT NOT NULL DEFAULT 'cli',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS heartbeats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      at TEXT NOT NULL,
      client TEXT NOT NULL DEFAULT 'cli',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_heartbeats_at ON heartbeats(at);
    CREATE INDEX IF NOT EXISTS idx_heartbeats_user_at ON heartbeats(user_id, at);
  `);

  const settings = _db.prepare("SELECT id FROM settings WHERE id = 1").get();
  if (!settings) {
    _db.prepare(
      "INSERT INTO settings (id, promo_seat_limit, promo_seats_used) VALUES (1, ?, 0)",
    ).run(DEFAULT_SEAT_LIMIT);
  }
  return _db;
}

export function getSettings(): SettingsRow {
  const row = getDb()
    .prepare("SELECT promo_seat_limit, promo_seats_used FROM settings WHERE id = 1")
    .get() as SettingsRow;
  return row;
}

export function setSeatLimit(limit: number) {
  getDb().prepare("UPDATE settings SET promo_seat_limit = ? WHERE id = 1").run(Math.max(0, limit));
}

export function findUserByEmail(email: string): UserRow | null {
  return (
    (getDb()
      .prepare(
        `SELECT id, email, name, image, google_sub, created_at, proxy_key_id, proxy_key_name,
                proxy_key_prefix, promo_granted FROM users WHERE email = ?`,
      )
      .get(email.toLowerCase()) as UserRow | undefined) || null
  );
}

export function findUserById(id: number): UserRow | null {
  return (
    (getDb()
      .prepare(
        `SELECT id, email, name, image, google_sub, created_at, proxy_key_id, proxy_key_name,
                proxy_key_prefix, promo_granted FROM users WHERE id = ?`,
      )
      .get(id) as UserRow | undefined) || null
  );
}

export function findUserByGoogleSub(sub: string): UserRow | null {
  return (
    (getDb()
      .prepare(
        `SELECT id, email, name, image, google_sub, created_at, proxy_key_id, proxy_key_name,
                proxy_key_prefix, promo_granted FROM users WHERE google_sub = ?`,
      )
      .get(sub) as UserRow | undefined) || null
  );
}

export function listUsers(): UserRow[] {
  return getDb()
    .prepare(
      `SELECT id, email, name, image, google_sub, created_at, proxy_key_id, proxy_key_name,
              proxy_key_prefix, promo_granted FROM users ORDER BY id DESC`,
    )
    .all() as UserRow[];
}

export function createPromoUser(input: {
  email: string;
  name: string | null;
  image: string | null;
  googleSub: string;
  proxyKeyId: number;
  proxyKeyName: string;
  proxyKeyPrefix: string;
  proxyKeyEnc: string;
}): UserRow {
  const db = getDb();
  const created = new Date().toISOString();
  const tx = db.transaction(() => {
    const settings = getSettings();
    if (settings.promo_seats_used >= settings.promo_seat_limit) {
      throw new Error("PROMO_FULL");
    }
    const info = db
      .prepare(
        `INSERT INTO users (email, name, image, google_sub, created_at, proxy_key_id, proxy_key_name,
          proxy_key_prefix, proxy_key_enc, promo_granted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      )
      .run(
        input.email.toLowerCase(),
        input.name,
        input.image,
        input.googleSub,
        created,
        input.proxyKeyId,
        input.proxyKeyName,
        input.proxyKeyPrefix,
        input.proxyKeyEnc,
      );
    db.prepare("UPDATE settings SET promo_seats_used = promo_seats_used + 1 WHERE id = 1").run();
    return Number(info.lastInsertRowid);
  });
  const id = tx();
  return findUserById(id)!;
}

export function getUserSecret(userId: number): string | null {
  const row = getDb()
    .prepare("SELECT proxy_key_enc FROM users WHERE id = ?")
    .get(userId) as { proxy_key_enc: string | null } | undefined;
  if (!row?.proxy_key_enc) return null;
  return decryptSecret(row.proxy_key_enc);
}

export function createDeviceCode() {
  const deviceCode = randomBytes(24).toString("hex");
  const userCode = randomBytes(3).toString("hex").toUpperCase() + "-" + randomBytes(3).toString("hex").toUpperCase();
  const created = new Date();
  const expires = new Date(created.getTime() + 15 * 60 * 1000);
  getDb()
    .prepare(
      `INSERT INTO device_codes (device_code, user_code, status, created_at, expires_at)
       VALUES (?, ?, 'pending', ?, ?)`,
    )
    .run(deviceCode, userCode, created.toISOString(), expires.toISOString());
  return { deviceCode, userCode, expiresAt: expires.toISOString() };
}

export function getDeviceByUserCode(userCode: string) {
  return getDb()
    .prepare("SELECT * FROM device_codes WHERE user_code = ?")
    .get(userCode.toUpperCase()) as
    | {
        device_code: string;
        user_code: string;
        status: string;
        user_id: number | null;
        session_token_hash: string | null;
        created_at: string;
        expires_at: string;
      }
    | undefined;
}

export function getDeviceByDeviceCode(deviceCode: string) {
  return getDb()
    .prepare("SELECT * FROM device_codes WHERE device_code = ?")
    .get(deviceCode) as
    | {
        device_code: string;
        user_code: string;
        status: string;
        user_id: number | null;
        session_token_hash: string | null;
        created_at: string;
        expires_at: string;
      }
    | undefined;
}

export function approveDevice(userCode: string, userId: number, sessionToken: string) {
  const row = getDeviceByUserCode(userCode);
  if (!row) throw new Error("UNKNOWN_CODE");
  if (new Date(row.expires_at).getTime() < Date.now()) throw new Error("EXPIRED");
  if (row.status !== "pending") throw new Error("ALREADY_USED");
  getDb()
    .prepare(
      `UPDATE device_codes SET status = 'approved', user_id = ?, session_token_hash = ? WHERE user_code = ?`,
    )
    .run(userId, hashToken(sessionToken), userCode.toUpperCase());
  createSession(userId, sessionToken, "device");
}

export function createSession(userId: number, token: string, client: string) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO sessions (token_hash, user_id, created_at, last_seen_at, client)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(hashToken(token), userId, now, now, client);
}

export function findSession(token: string) {
  const row = getDb()
    .prepare("SELECT user_id, client FROM sessions WHERE token_hash = ?")
    .get(hashToken(token)) as { user_id: number; client: string } | undefined;
  return row || null;
}

export function touchSession(token: string) {
  getDb()
    .prepare("UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?")
    .run(new Date().toISOString(), hashToken(token));
}

export function deleteSession(token: string) {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function recordHeartbeat(userId: number, client: string) {
  getDb()
    .prepare("INSERT INTO heartbeats (user_id, at, client) VALUES (?, ?, ?)")
    .run(userId, new Date().toISOString(), client);
}

export function dauToday(): number {
  const day = new Date().toISOString().slice(0, 10);
  const row = getDb()
    .prepare(
      `SELECT COUNT(DISTINCT user_id) AS n FROM heartbeats WHERE substr(at, 1, 10) = ?`,
    )
    .get(day) as { n: number };
  return Number(row.n || 0);
}

export function liveUsers(minutes = 15): number {
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const row = getDb()
    .prepare(`SELECT COUNT(DISTINCT user_id) AS n FROM heartbeats WHERE at >= ?`)
    .get(since) as { n: number };
  return Number(row.n || 0);
}

export function signupCount(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  return Number(row.n || 0);
}

export { DEFAULT_SEAT_LIMIT, PROMO_LIFETIME_USD };

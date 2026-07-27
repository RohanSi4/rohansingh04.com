import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createAdminToken(): string {
  const ts = Date.now().toString();
  const sig = sign(ts);
  return Buffer.from(`${ts}:${sig}`).toString("base64url");
}

/** Length-safe constant-time compare, so we never leak a secret byte by byte. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Constant-time check of a submitted admin password against the configured one. */
export function passwordMatches(submitted: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (typeof submitted !== "string" || submitted.length === 0) return false;
  return safeEqual(submitted, expected);
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return false;
    const ts = decoded.slice(0, colonIdx);
    const sig = decoded.slice(colonIdx + 1);
    const issuedAt = Number.parseInt(ts, 10);
    if (!Number.isFinite(issuedAt)) return false;
    if (Date.now() - issuedAt > MAX_AGE_MS) return false;
    return safeEqual(sign(ts), sig);
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  },
};

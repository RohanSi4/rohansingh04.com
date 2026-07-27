import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, passwordMatches, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MAX_TRACKED_CLIENTS = 5_000;

// Per-instance throttle. Serverless spreads traffic across warm instances, so
// this is meaningful friction rather than a hard global cap. A KV-backed
// counter is the durable version if this ever needs to be airtight.
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function prune(now: number): void {
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  if (attempts.size > MAX_TRACKED_CLIENTS) prune(now);

  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const key = clientKey(req);
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "too many attempts, try again later" },
      { status: 429 },
    );
  }

  let password: unknown;
  try {
    ({ password } = (await req.json()) as { password?: unknown });
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Constant-time, and fails closed when ADMIN_PASSWORD is not configured.
  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  attempts.delete(key);
  const token = createAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE.name, token, ADMIN_COOKIE.options);
  return res;
}

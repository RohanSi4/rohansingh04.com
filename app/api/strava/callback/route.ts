import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import {
  setStravaTokensKV,
  STRAVA_STATE_COOKIE,
  STRAVA_STATE_COOKIE_OPTIONS,
} from "@/lib/strava";

function siteUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;
}

function statesMatch(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length
    && timingSafeEqual(receivedBytes, expectedBytes);
}

function clearState(response: NextResponse): NextResponse {
  response.cookies.set(STRAVA_STATE_COOKIE, "", {
    ...STRAVA_STATE_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(STRAVA_STATE_COOKIE)?.value;

  if (!statesMatch(state, expectedState)) {
    return clearState(NextResponse.json({ error: "invalid oauth state" }, { status: 400 }));
  }

  if (error || !code) {
    return clearState(NextResponse.json({ error: error ?? "no code" }, { status: 400 }));
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return clearState(NextResponse.json({ error: "strava is not configured" }, { status: 503 }));
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    return clearState(NextResponse.json({ error: `token exchange failed: ${res.status}` }, { status: 502 }));
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    scope?: string;
  };

  const scopes = new Set((data.scope ?? "").split(/[ ,]+/).filter(Boolean));
  if (!scopes.has("activity:read_all")) {
    return clearState(NextResponse.json({ error: "missing activity:read_all scope; reconnect and approve all permissions" }, { status: 400 }));
  }
  if (!data.access_token || !data.refresh_token || !Number.isFinite(data.expires_at)) {
    return clearState(NextResponse.json({ error: "invalid token response" }, { status: 502 }));
  }

  await setStravaTokensKV({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  });

  // kick off initial sync after redirect is sent
  const baseUrl = siteUrl(req);
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    after(async () => {
      await fetch(`${baseUrl}/api/strava/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cronSecret}` },
      }).catch(() => {});
    });
  }

  return clearState(NextResponse.redirect(`${baseUrl}/?strava=connected`));
}

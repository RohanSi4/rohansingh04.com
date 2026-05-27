import { NextRequest, NextResponse } from "next/server";
import { setStravaTokensKV } from "@/lib/strava";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.json({ error: error ?? "no code" }, { status: 400 });
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `token exchange failed: ${res.status}` }, { status: 500 });
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    scope: string;
  };

  if (!data.scope.includes("activity:read_all")) {
    return NextResponse.json({ error: "missing activity:read_all scope — reconnect and approve all permissions" }, { status: 400 });
  }

  await setStravaTokensKV({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  });

  // kick off initial sync
  const syncUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/strava/sync`;
  fetch(syncUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.HEALTH_INGEST_TOKEN}` },
  }).catch(() => {});

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/?strava=connected`);
}

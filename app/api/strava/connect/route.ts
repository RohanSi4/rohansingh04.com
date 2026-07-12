import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { STRAVA_STATE_COOKIE, STRAVA_STATE_COOKIE_OPTIONS } from "@/lib/strava";

function siteUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "strava is not configured" }, { status: 503 });
  }

  const state = randomBytes(32).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${siteUrl(req)}/api/strava/callback`,
    approval_prompt: "force",
    scope: "activity:read_all",
    state,
  });

  const response = NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`);
  response.cookies.set(STRAVA_STATE_COOKIE, state, STRAVA_STATE_COOKIE_OPTIONS);
  return response;
}

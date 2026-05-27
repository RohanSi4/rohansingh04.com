import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/strava/callback`,
    approval_prompt: "force",
    scope: "activity:read_all",
  });

  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`);
}

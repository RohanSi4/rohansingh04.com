import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "deprecated: use /api/strava/sync" }, { status: 410 });
}

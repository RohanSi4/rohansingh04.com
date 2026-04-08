import { NextResponse } from "next/server";

// stub -- real implementation in phase 5
// needs: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
export async function GET() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 }
  );
}

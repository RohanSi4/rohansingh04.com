import { NextResponse } from "next/server";

// stub -- real implementation in phase 5
// needs: HEALTH_INGEST_TOKEN (set in Vercel env vars, also hardcoded in iOS shortcut)
export async function POST() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 }
  );
}

import { NextResponse } from "next/server";

// stub -- real implementation in phase 5
// needs: GITHUB_TOKEN (read-only public repos)
export async function GET() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 }
  );
}

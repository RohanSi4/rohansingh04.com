import { NextResponse } from "next/server";

// stub -- real implementation in phase 5
// needs: github oauth via next-auth, vercel kv for storage
export async function GET() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 }
  );
}

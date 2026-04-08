import { NextResponse } from "next/server";

// stub -- real implementation in phase 5
export async function GET() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 }
  );
}

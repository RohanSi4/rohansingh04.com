import { NextResponse } from "next/server";
import { getRunningDashboard } from "@/lib/running";

export async function GET() {
  const data = await getRunningDashboard();
  return NextResponse.json(data.health);
}

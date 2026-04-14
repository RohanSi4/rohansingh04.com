import { NextResponse } from "next/server";
import { getHealthKV } from "@/lib/kv-data";
import { healthMock } from "@/lib/health-mock";

export async function GET() {
  const data = await getHealthKV();
  return NextResponse.json(data ?? healthMock);
}

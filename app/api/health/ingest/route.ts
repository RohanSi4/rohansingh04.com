import { NextRequest, NextResponse } from "next/server";
import { setHealthKV } from "@/lib/kv-data";
import type { HealthSummary } from "@/lib/types";

export async function POST(req: NextRequest) {
  const token = process.env.HEALTH_INGEST_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json() as HealthSummary;
  await setHealthKV(body);
  return NextResponse.json({ ok: true });
}

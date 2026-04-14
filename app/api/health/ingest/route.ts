import { NextRequest, NextResponse } from "next/server";
import { setHealthKV, getBestStreakKV, setBestStreakKV } from "@/lib/kv-data";
import { computeHealthSummary } from "@/lib/health-compute";
import type { RawIngest } from "@/lib/health-compute";

export async function POST(req: NextRequest) {
  const token = process.env.HEALTH_INGEST_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw = await req.json() as RawIngest;
  const prevBest = await getBestStreakKV();
  const summary = computeHealthSummary(raw, prevBest);

  await Promise.all([
    setHealthKV(summary),
    setBestStreakKV(summary.streak.bestDays),
  ]);

  return NextResponse.json({ ok: true, updatedAt: summary.updatedAt });
}

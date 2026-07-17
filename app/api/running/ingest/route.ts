import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getRunningDashboard, sanitizeTrainingPlan } from "@/lib/running";
import { setRunningDashboardKV } from "@/lib/kv-data";
import type { RunningDashboard } from "@/lib/running";

const MAX_SNAPSHOT_BYTES = 1_500_000;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  return [
    process.env.RUNNING_DASHBOARD_TOKEN,
    process.env.HEALTH_INGEST_TOKEN,
    process.env.CRON_SECRET,
  ]
    .filter((token): token is string => Boolean(token))
    .some((token) => auth === `Bearer ${token}`);
}

function isDashboard(value: unknown): value is RunningDashboard {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RunningDashboard>;
  return candidate.schemaVersion === 2
    && typeof candidate.generatedAt === "string"
    && typeof candidate.dataThrough === "string"
    && Array.isArray(candidate.weeks)
    && Array.isArray(candidate.monthlyHistory)
    && Array.isArray(candidate.yearlyHistory)
    && Array.isArray(candidate.recentRuns)
    && candidate.recentRuns.length > 0
    && candidate.health != null;
}

export async function GET() {
  const data = await getRunningDashboard();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const declaredSize = Number(req.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_SNAPSHOT_BYTES) {
    return NextResponse.json({ error: "snapshot too large" }, { status: 413 });
  }

  let data: unknown;
  try {
    const body = await req.text();
    if (Buffer.byteLength(body, "utf8") > MAX_SNAPSHOT_BYTES) {
      return NextResponse.json({ error: "snapshot too large" }, { status: 413 });
    }
    const forbidden = ["start_latlng", "sourceFile", "injuryNotes", "keyRuns", "latitude", "longitude"];
    if (forbidden.some((field) => body.includes(field))) {
      return NextResponse.json({ error: "snapshot contains private fields" }, { status: 400 });
    }
    data = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!isDashboard(data)) {
    return NextResponse.json({ error: "invalid dashboard schema" }, { status: 400 });
  }

  const safeData = {
    ...data,
    trainingPlan: sanitizeTrainingPlan(data.trainingPlan),
  };
  await setRunningDashboardKV(safeData);
  revalidatePath("/");
  revalidatePath("/fitness");
  return NextResponse.json({ ok: true, updatedAt: data.generatedAt, dataThrough: data.dataThrough });
}

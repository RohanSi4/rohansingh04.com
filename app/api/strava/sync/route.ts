import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, fetchRecentActivities, setStravaActivitiesKV } from "@/lib/strava";
import { computeHealthSummary } from "@/lib/health-compute";
import { setHealthKV, getBestStreakKV, setBestStreakKV } from "@/lib/kv-data";

function matchesBearer(received: string, token: string): boolean {
  const left = Buffer.from(received, "utf8");
  const right = Buffer.from(`Bearer ${token}`, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  return [process.env.HEALTH_INGEST_TOKEN, process.env.CRON_SECRET]
    .filter((token): token is string => Boolean(token))
    .some((token) => matchesBearer(auth, token));
}

async function sync(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken();

  // fetch activities from 365 days ago
  const afterEpoch = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
  const fresh = await fetchRecentActivities(accessToken, afterEpoch);

  // The fetch is all-or-nothing and covers the full retained window. Replacing
  // the old set is important: it also removes activities that became private.
  const cutoffStr = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const activities = fresh.filter(a => a.date >= cutoffStr);

  await setStravaActivitiesKV(activities);

  const prevBest = await getBestStreakKV();
  const summary = computeHealthSummary(activities, prevBest);
  await Promise.all([setHealthKV(summary), setBestStreakKV(summary.streak.bestDays)]);

  return NextResponse.json({ ok: true, activities: activities.length, updatedAt: summary.updatedAt });
}

// Strava can be unconfigured, disconnected, rate limited, or simply down. Any of
// those threw an unhandled 500 before, which made scheduled runs opaque. Fail
// with a clear status and keep the upstream detail in the server log only.
async function handler(req: NextRequest) {
  try {
    return await sync(req);
  } catch (error) {
    console.error("strava sync failed:", error);
    return NextResponse.json({ error: "strava sync failed" }, { status: 503 });
  }
}

// Vercel Cron invokes routes with GET. Keep POST for manual/automation callers.
export const GET = handler;
export const POST = handler;

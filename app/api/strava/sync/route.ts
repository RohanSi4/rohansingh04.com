import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken, fetchRecentActivities, setStravaActivitiesKV } from "@/lib/strava";
import { computeHealthSummary } from "@/lib/health-compute";
import { setHealthKV, getBestStreakKV, setBestStreakKV } from "@/lib/kv-data";

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  return [process.env.HEALTH_INGEST_TOKEN, process.env.CRON_SECRET]
    .filter((token): token is string => Boolean(token))
    .some((token) => auth === `Bearer ${token}`);
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

// Vercel Cron invokes routes with GET. Keep POST for manual/automation callers.
export const GET = sync;
export const POST = sync;

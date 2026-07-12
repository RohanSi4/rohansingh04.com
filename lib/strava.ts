import { kv } from "@vercel/kv";

export type StravaActivity = {
  id: number;
  date: string;       // YYYY-MM-DD local date
  sport: string;      // sport_type e.g. "Run", "Ride"
  name: string;
  movingMins: number;
  distanceMi: number;
  calories: number;
  avgHR: number | null;
};

export const STRAVA_STATE_COOKIE = "strava_oauth_state";

export const STRAVA_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/strava",
  maxAge: 10 * 60,
  priority: "high" as const,
};

type StravaApiActivity = {
  id: number;
  name?: string;
  sport_type: string;
  start_date_local: string;
  moving_time: number;
  distance: number;
  kilojoules?: number | null;
  average_heartrate?: number | null;
  private?: boolean;
  visibility?: string;
};

type StravaTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix epoch seconds
};

export async function getStravaTokensKV(): Promise<StravaTokens | null> {
  return kv.get<StravaTokens>("strava:tokens");
}

export async function setStravaTokensKV(tokens: StravaTokens): Promise<void> {
  await kv.set("strava:tokens", tokens);
}

export async function getStravaActivitiesKV(): Promise<StravaActivity[]> {
  const activities = (await kv.get<StravaActivity[]>("strava:activities")) ?? [];
  // Older snapshots stored Strava's user-authored title. Always sanitize on read
  // as well as ingest so a stale KV value can never reach the public site.
  return activities.map((activity) => ({
    ...activity,
    name: genericActivityName(activity.sport),
  }));
}

export async function setStravaActivitiesKV(activities: StravaActivity[]): Promise<void> {
  await kv.set("strava:activities", activities);
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = await getStravaTokensKV();
  if (!tokens) throw new Error("Strava not connected");

  // refresh if within 5 minutes of expiry
  if (Date.now() / 1000 < tokens.expiresAt - 300) {
    return tokens.accessToken;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Strava is not configured");

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  await setStravaTokensKV({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  });

  return data.access_token;
}

function toLocalDate(isoString: string): string {
  // Strava start_date_local is already local time, just take the date part
  return isoString.split("T")[0];
}

export function genericActivityName(sport: string): string {
  const labels: Record<string, string> = {
    Run: "Run",
    TrailRun: "Trail run",
    VirtualRun: "Virtual run",
    Ride: "Ride",
    VirtualRide: "Virtual ride",
    EBikeRide: "E-bike ride",
    Walk: "Walk",
    Hike: "Hike",
    Swim: "Swim",
    WeightTraining: "Strength training",
    Workout: "Workout",
    Yoga: "Yoga",
    Rowing: "Rowing",
    Golf: "Golf",
  };
  return labels[sport] ?? "Workout";
}

/** Convert Strava's response into the intentionally small public activity shape. */
export function projectPublicStravaActivity(activity: StravaApiActivity): StravaActivity | null {
  if (activity.private === true) return null;
  if (activity.visibility && activity.visibility !== "everyone") return null;

  return {
    id: activity.id,
    date: toLocalDate(activity.start_date_local),
    sport: activity.sport_type,
    name: genericActivityName(activity.sport_type),
    movingMins: Math.round(activity.moving_time / 60),
    distanceMi: Math.round((activity.distance / 1609.34) * 100) / 100,
    calories: activity.kilojoules ? Math.round(activity.kilojoules * 0.239006) : 0,
    avgHR: activity.average_heartrate ?? null,
  };
}

export async function fetchRecentActivities(accessToken: string, afterEpoch: number): Promise<StravaActivity[]> {
  const activities: StravaActivity[] = [];
  let page = 1;

  while (true) {
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&per_page=200&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Strava activities fetch failed: ${res.status}`);

    const batch = await res.json() as StravaApiActivity[];

    if (batch.length === 0) break;

    for (const a of batch) {
      const projected = projectPublicStravaActivity(a);
      if (projected) activities.push(projected);
    }

    if (batch.length < 200) break;
    page++;
  }

  return activities;
}

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
  return (await kv.get<StravaActivity[]>("strava:activities")) ?? [];
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

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
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

export async function fetchRecentActivities(accessToken: string, afterEpoch: number): Promise<StravaActivity[]> {
  const activities: StravaActivity[] = [];
  let page = 1;

  while (true) {
    const url = `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&per_page=200&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Strava activities fetch failed: ${res.status}`);

    const batch = await res.json() as Array<{
      id: number;
      name: string;
      sport_type: string;
      start_date_local: string;
      moving_time: number;
      distance: number;
      kilojoules?: number | null;
      average_heartrate?: number | null;
    }>;

    if (batch.length === 0) break;

    for (const a of batch) {
      activities.push({
        id: a.id,
        date: toLocalDate(a.start_date_local),
        sport: a.sport_type,
        name: a.name,
        movingMins: Math.round(a.moving_time / 60),
        distanceMi: Math.round((a.distance / 1609.34) * 100) / 100,
        calories: a.kilojoules ? Math.round(a.kilojoules * 0.239006) : 0,
        avgHR: a.average_heartrate ?? null,
      });
    }

    if (batch.length < 200) break;
    page++;
  }

  return activities;
}

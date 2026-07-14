import { kv } from "@vercel/kv";
import type { Place, StateEntry, HealthSummary } from "./types";
import type { RunningDashboard } from "./running";
import placesJson from "../content/places.json";
import statesJson from "../content/states.json";
import { addSeedPhotos } from "./travel";

const PLACE_PHOTO_SEED_KEY = "places:photo-seed:v1";

export async function getPlacesKV(): Promise<Place[]> {
  const seed = placesJson as Place[];
  try {
    const data = await kv.get<Place[]>("places");
    if (data) {
      const seeded = await kv.get<boolean>(PLACE_PHOTO_SEED_KEY);
      if (seeded) return data;

      const merged = addSeedPhotos(data, seed);
      if (merged.changed) await kv.set("places", merged.places);
      await kv.set(PLACE_PHOTO_SEED_KEY, true);
      return merged.places;
    }
    await kv.set("places", seed);
    await kv.set(PLACE_PHOTO_SEED_KEY, true);
    return seed;
  } catch {
    return seed;
  }
}

export async function setPlacesKV(places: Place[]): Promise<void> {
  await kv.set("places", places);
}

export async function getStatesKV(): Promise<StateEntry[]> {
  const seed = statesJson as StateEntry[];
  try {
    const data = await kv.get<StateEntry[]>("states");
    if (data) return data;
    await kv.set("states", seed);
    return seed;
  } catch {
    return seed;
  }
}

export async function setStatesKV(states: StateEntry[]): Promise<void> {
  await kv.set("states", states);
}

export async function getHealthKV(): Promise<HealthSummary | null> {
  const data = await kv.get<HealthSummary>("health");
  // discard if it's an old schema (missing new fields)
  if (!data || !("lastActivity" in data) || !("recentActivities" in data)) return null;
  return data;
}

export async function setHealthKV(data: HealthSummary): Promise<void> {
  await kv.set("health", data);
}

export async function getRunningDashboardKV(): Promise<RunningDashboard | null> {
  return kv.get<RunningDashboard>("running:dashboard");
}

export async function setRunningDashboardKV(data: RunningDashboard): Promise<void> {
  await kv.set("running:dashboard", data);
}

export async function getBestStreakKV(): Promise<number> {
  return (await kv.get<number>("health:bestStreak")) ?? 0;
}

export async function setBestStreakKV(n: number): Promise<void> {
  await kv.set("health:bestStreak", n);
}

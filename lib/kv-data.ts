import { kv } from "@vercel/kv";
import type { Place, StateEntry, HealthSummary } from "./types";
import type { RunningDashboard } from "./running";
import placesJson from "../content/places.json";
import statesJson from "../content/states.json";
import { addSeedPhotos } from "./travel";
import {
  normalizePublicStrengthSessions,
  shouldAcceptFitnessBatch,
  type EncryptedFitnessBatch,
  type PublicStrengthSession,
} from "./fitness-sync";

const PLACE_PHOTO_SEED_KEY = "places:photo-seed:v1";
const PRIVATE_FITNESS_BATCH_KEY = "fitness:private:latest:v1";
const PUBLIC_STRENGTH_KEY = "fitness:public:strength:v1";

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

export async function setPrivateFitnessBatchIfNewer(
  batch: EncryptedFitnessBatch,
): Promise<boolean> {
  const current = await kv.get<EncryptedFitnessBatch>(PRIVATE_FITNESS_BATCH_KEY);
  if (!shouldAcceptFitnessBatch(batch, current)) return false;
  await kv.set(PRIVATE_FITNESS_BATCH_KEY, batch);
  return true;
}

export async function getPrivateFitnessBatches(_limit = 1): Promise<EncryptedFitnessBatch[]> {
  const latest = await kv.get<EncryptedFitnessBatch>(PRIVATE_FITNESS_BATCH_KEY);
  return latest ? [latest] : [];
}

export async function getPublicStrengthKV(): Promise<PublicStrengthSession[]> {
  try {
    return (await kv.get<PublicStrengthSession[]>(PUBLIC_STRENGTH_KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function setPublicStrengthKV(sessions: PublicStrengthSession[]): Promise<void> {
  await kv.set(PUBLIC_STRENGTH_KEY, normalizePublicStrengthSessions(sessions));
}

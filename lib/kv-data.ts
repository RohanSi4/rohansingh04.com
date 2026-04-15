import { kv } from "@vercel/kv";
import type { Place, StateEntry, HealthSummary } from "./types";
import type { DailyEntry } from "./health-compute";
import placesJson from "../content/places.json";
import statesJson from "../content/states.json";

export async function getPlacesKV(): Promise<Place[]> {
  const data = await kv.get<Place[]>("places");
  if (data) return data;
  const seed = placesJson as Place[];
  await kv.set("places", seed);
  return seed;
}

export async function setPlacesKV(places: Place[]): Promise<void> {
  await kv.set("places", places);
}

export async function getStatesKV(): Promise<StateEntry[]> {
  const data = await kv.get<StateEntry[]>("states");
  if (data) return data;
  const seed = statesJson as StateEntry[];
  await kv.set("states", seed);
  return seed;
}

export async function setStatesKV(states: StateEntry[]): Promise<void> {
  await kv.set("states", states);
}

export async function getHealthKV(): Promise<HealthSummary | null> {
  const data = await kv.get<HealthSummary>("health");
  // discard if it's an old schema (pre-daily-log rewrite)
  if (!data || !("exerciseMinutes" in (data.today ?? {}))) return null;
  return data;
}

export async function setHealthKV(data: HealthSummary): Promise<void> {
  await kv.set("health", data);
}

export async function getBestStreakKV(): Promise<number> {
  return (await kv.get<number>("health:bestStreak")) ?? 0;
}

export async function setBestStreakKV(n: number): Promise<void> {
  await kv.set("health:bestStreak", n);
}

export async function getDailyLogKV(): Promise<DailyEntry[]> {
  return (await kv.get<DailyEntry[]>("health:log")) ?? [];
}

export async function upsertDailyEntryKV(entry: DailyEntry): Promise<DailyEntry[]> {
  const log = await getDailyLogKV();
  const existing = log.findIndex(e => e.date === entry.date);
  if (existing >= 0) log[existing] = entry;
  else log.push(entry);
  // keep only last 365 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 364);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const trimmed = log.filter(e => e.date >= cutoffStr);
  await kv.set("health:log", trimmed);
  return trimmed;
}

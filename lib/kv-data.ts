import { kv } from "@vercel/kv";
import type { Place, StateEntry, HealthSummary } from "./types";
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
  return kv.get<HealthSummary>("health");
}

export async function setHealthKV(data: HealthSummary): Promise<void> {
  await kv.set("health", data);
}

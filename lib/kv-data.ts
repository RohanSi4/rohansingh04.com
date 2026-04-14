import { kv } from "@vercel/kv";
import type { Place, StateEntry } from "./types";

// Lazy-seed: first read from KV; if empty, load from static JSON and persist.

async function seed<T>(key: string, jsonPath: string): Promise<T> {
  const { default: data } = await import(jsonPath);
  await kv.set(key, data);
  return data as T;
}

export async function getPlacesKV(): Promise<Place[]> {
  const data = await kv.get<Place[]>("places");
  if (data) return data;
  return seed<Place[]>("places", "../content/places.json");
}

export async function setPlacesKV(places: Place[]): Promise<void> {
  await kv.set("places", places);
}

export async function getStatesKV(): Promise<StateEntry[]> {
  const data = await kv.get<StateEntry[]>("states");
  if (data) return data;
  return seed<StateEntry[]>("states", "../content/states.json");
}

export async function setStatesKV(states: StateEntry[]): Promise<void> {
  await kv.set("states", states);
}

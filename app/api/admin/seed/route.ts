import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { kv } from "@vercel/kv";
import placesJson from "@/content/places.json";
import statesJson from "@/content/states.json";

// One-time: force-seeds KV from the static JSON files.
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await kv.set("places", placesJson);
  await kv.set("states", statesJson);
  return NextResponse.json({ ok: true });
}

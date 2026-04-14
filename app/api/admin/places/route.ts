import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getPlacesKV, setPlacesKV } from "@/lib/kv-data";
import type { Place } from "@/lib/types";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getPlacesKV());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json() as Partial<Place>;
  const id = `${(body.name ?? "").toLowerCase().replace(/\s+/g, "-")}-${(body.visitedDate ?? "").slice(0, 4)}`;

  const places = await getPlacesKV();
  if (places.find((p) => p.id === id)) {
    return NextResponse.json({ error: "place with this id already exists" }, { status: 409 });
  }

  const place: Place = {
    id,
    name: body.name ?? "",
    country: body.country ?? "",
    lat: body.lat ?? 0,
    lng: body.lng ?? 0,
    visitedDate: body.visitedDate ?? "",
    notes: body.notes ?? "",
    photos: [],
    tripSlug: null,
  };
  await setPlacesKV([...places, place]);
  return NextResponse.json(place, { status: 201 });
}

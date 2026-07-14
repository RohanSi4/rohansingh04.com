import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getPlacesKV, setPlacesKV } from "@/lib/kv-data";

async function findPlace(id: string) {
  const places = await getPlacesKV();
  const index = places.findIndex((place) => place.id === id);
  return { places, index };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { url } = await req.json() as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "photo url is required" }, { status: 400 });
  }

  const { places, index } = await findPlace(id);
  if (index === -1) {
    return NextResponse.json({ error: "place not found" }, { status: 404 });
  }

  const current = places[index];
  places[index] = {
    ...current,
    photos: current.photos.includes(url) ? current.photos : [...current.photos, url],
  };
  await setPlacesKV(places);
  return NextResponse.json(places[index]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { url } = await req.json() as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "photo url is required" }, { status: 400 });
  }

  const { places, index } = await findPlace(id);
  if (index === -1) {
    return NextResponse.json({ error: "place not found" }, { status: 404 });
  }

  places[index] = {
    ...places[index],
    photos: places[index].photos.filter((photo) => photo !== url),
  };
  await setPlacesKV(places);
  return NextResponse.json(places[index]);
}

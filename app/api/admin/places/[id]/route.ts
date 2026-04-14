import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getPlacesKV, setPlacesKV } from "@/lib/kv-data";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const places = await getPlacesKV();
  const idx = places.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });

  places[idx] = { ...places[idx], ...body, id };
  await setPlacesKV(places);
  return NextResponse.json(places[idx]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const places = await getPlacesKV();
  const filtered = places.filter((p) => p.id !== id);
  if (filtered.length === places.length) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await setPlacesKV(filtered);
  return NextResponse.json({ ok: true });
}

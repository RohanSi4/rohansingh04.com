import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getStatesKV, setStatesKV } from "@/lib/kv-data";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const body = await req.json();
  const states = await getStatesKV();
  const idx = states.findIndex((s) => s.code === code.toUpperCase());
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });

  states[idx] = { ...states[idx], ...body, code: code.toUpperCase() };
  await setStatesKV(states);
  return NextResponse.json(states[idx]);
}

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folder = (form.get("folder") as string) || "photos";

  if (!file) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "file must be an image" }, { status: 415 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "image must be under 15 MB" }, { status: 413 });
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "") || "photos";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  const blob = await put(`${safeFolder}/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseEncryptedFitnessBatch } from "@/lib/fitness-sync";
import {
  getPrivateFitnessBatches,
  setPrivateFitnessBatchIfNewer,
  setPublicStrengthKV,
} from "@/lib/kv-data";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 1_300_000;

function matchesBearer(req: NextRequest, expected: string | undefined): boolean {
  if (!expected) return false;
  const received = req.headers.get("authorization") ?? "";
  const wanted = `Bearer ${expected}`;
  const left = Buffer.from(received);
  const right = Buffer.from(wanted);
  return left.length === right.length && timingSafeEqual(left, right);
}

function noStore<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...init?.headers, "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(req: NextRequest) {
  if (!matchesBearer(req, process.env.FITNESS_SYNC_WRITE_TOKEN)) {
    return noStore({ error: "unauthorized" }, { status: 401 });
  }
  const declaredSize = Number(req.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_REQUEST_BYTES) {
    return noStore({ error: "batch too large" }, { status: 413 });
  }

  let parsed: unknown;
  try {
    const body = await req.text();
    if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
      return noStore({ error: "batch too large" }, { status: 413 });
    }
    parsed = JSON.parse(body);
  } catch {
    return noStore({ error: "invalid json" }, { status: 400 });
  }

  const batch = parseEncryptedFitnessBatch(parsed);
  if (!batch) return noStore({ error: "invalid fitness sync schema" }, { status: 400 });

  const accepted = await setPrivateFitnessBatchIfNewer(batch);
  if (accepted) {
    await setPublicStrengthKV(batch.publicStrength);
    revalidatePath("/fitness");
  }
  return noStore({
    ok: true,
    accepted,
    batchId: batch.batchId,
    receivedAt: new Date().toISOString(),
  });
}

export async function GET(req: NextRequest) {
  if (!matchesBearer(req, process.env.FITNESS_SYNC_READ_TOKEN)) {
    return noStore({ error: "unauthorized" }, { status: 401 });
  }
  const requested = Number(req.nextUrl.searchParams.get("limit") ?? 500);
  const batches = await getPrivateFitnessBatches(Number.isFinite(requested) ? requested : 500);
  return noStore({ schemaVersion: 1, batches });
}

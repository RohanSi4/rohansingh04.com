import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ commit: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/kv-data", () => ({
  setPrivateFitnessBatchIfNewer: mocks.commit,
  getPrivateFitnessBatches: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { POST } from "../app/api/fitness/private-sync/route";

function request(token = "synthetic-token") {
  return new NextRequest("https://example.test/api/fitness/private-sync", {
    method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      schemaVersion: 2, batchId: "synthetic-batch", deviceId: "synthetic-device", createdAt: new Date().toISOString(),
      encryption: { algorithm: "AES-256-GCM", keyId: "synthetic-key", nonce: "AAECAwQFBgcICQoL", ciphertext: "AA==", tag: "AAECAwQFBgcICQoLDA0ODw==" },
      publicStrength: [],
    }),
  });
}

beforeEach(() => {
  vi.stubEnv("FITNESS_SYNC_WRITE_TOKEN", "synthetic-token");
  mocks.commit.mockReset(); mocks.revalidate.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

it("does not touch storage for an unauthenticated upload", async () => {
  expect((await POST(request("wrong-token"))).status).toBe(401);
  expect(mocks.commit).not.toHaveBeenCalled();
});

it("returns a retryable error when the commit outcome is unavailable", async () => {
  mocks.commit.mockRejectedValue(new Error("network failure"));
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(mocks.revalidate).not.toHaveBeenCalled();
});

it("retries cache invalidation after a committed upload returns an error", async () => {
  mocks.commit.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  mocks.revalidate.mockImplementationOnce(() => { throw new Error("cache unavailable"); });
  expect((await POST(request())).status).toBe(503);
  const retry = await POST(request());
  expect(retry.status).toBe(200);
  expect(await retry.json()).toMatchObject({ ok: true, accepted: false });
  expect(mocks.revalidate).toHaveBeenCalledTimes(2);
});

import { describe, expect, it } from "vitest";
import {
  normalizePublicStrengthSessions,
  isFitnessBatchFresh,
  parseEncryptedFitnessBatch,
  shouldAcceptFitnessBatch,
  strengthWeekSummary,
  type EncryptedFitnessBatch,
} from "./fitness-sync";

const batch: EncryptedFitnessBatch = {
  schemaVersion: 1,
  batchId: "batch_12345678",
  deviceId: "device_12345678",
  createdAt: "2026-07-21T18:00:00.000Z",
  encryption: {
    algorithm: "AES-256-GCM",
    keyId: "fitness_key_v1",
    nonce: "AAECAwQFBgcICQoL",
    ciphertext: "ZmFrZS1lbmNyeXB0ZWQtcGF5bG9hZA==",
    tag: "AAECAwQFBgcICQoLDA0ODw==",
  },
  publicStrength: [{
    id: "workout_12345678",
    date: "2026-07-21",
    kind: "upper",
    durationMinutes: 48,
    workingSets: 16,
    muscleGroups: ["upper chest", "lats", "side delts"],
    updatedAt: "2026-07-21T18:00:00.000Z",
  }],
  publicWeight: {
    asOf: "2026-07-21",
    currentPounds: 184.4,
    goalPounds: 175,
    sevenDayAverage: 184.8,
    change28Days: -2.3,
    daysLogged28: 24,
  },
};

describe("private fitness sync contract", () => {
  it("accepts an opaque encrypted batch with a safe public summary", () => {
    expect(parseEncryptedFitnessBatch(batch)).toEqual(batch);
  });

  it("rejects private fields leaking through the public summary", () => {
    const unsafe = structuredClone(batch) as unknown as Record<string, unknown>;
    const summaries = unsafe.publicStrength as Array<Record<string, unknown>>;
    summaries[0].weight = 184.4;
    expect(parseEncryptedFitnessBatch(unsafe)).toBeNull();
  });

  it("accepts only a bounded opt-in weight summary", () => {
    const unsafe = structuredClone(batch) as unknown as Record<string, unknown>;
    const weight = unsafe.publicWeight as Record<string, unknown>;
    weight.rawEntries = [{ date: "2026-07-21", pounds: 184.4 }];
    expect(parseEncryptedFitnessBatch(unsafe)).toBeNull();
  });

  it("normalizes duplicate snapshots idempotently", () => {
    const first = normalizePublicStrengthSessions(batch.publicStrength);
    const unchanged = normalizePublicStrengthSessions([...first, ...batch.publicStrength]);
    expect(unchanged).toEqual(first);
  });

  it("summarizes only the requested training week", () => {
    const sessions = normalizePublicStrengthSessions(batch.publicStrength);
    expect(strengthWeekSummary(sessions, "2026-07-20")).toMatchObject({
      days: 1,
      workingSets: 16,
      topMuscles: ["lats", "side delts", "upper chest"],
    });
    expect(strengthWeekSummary(sessions, "2026-07-27").days).toBe(0);
  });
});

describe("shouldAcceptFitnessBatch", () => {
  const batch = (batchId: string, createdAt: string) => ({
    schemaVersion: 1 as const,
    batchId,
    deviceId: "device_12345678",
    createdAt,
    encryption: {
      algorithm: "AES-256-GCM" as const,
      keyId: "today-2026-v1",
      nonce: "YWJjZA==",
      ciphertext: "YWJjZA==",
      tag: "YWJjZA==",
    },
    publicStrength: [],
  });

  it("accepts only snapshots newer than the current one", () => {
    const current = batch("batch_current1", "2026-07-21T18:00:00.000Z");
    expect(shouldAcceptFitnessBatch(batch("batch_newer001", "2026-07-21T18:00:01.000Z"), current)).toBe(true);
    expect(shouldAcceptFitnessBatch(batch("batch_older001", "2026-07-21T17:59:59.000Z"), current)).toBe(false);
    expect(shouldAcceptFitnessBatch(current, current)).toBe(false);
    expect(shouldAcceptFitnessBatch(current, null)).toBe(true);
  });

  it("rejects timestamps that could pin the latest snapshot in the future", () => {
    const now = Date.parse("2026-07-21T18:00:00.000Z");
    expect(isFitnessBatchFresh(batch("batch_fresh001", "2026-07-21T18:09:59.000Z"), now)).toBe(true);
    expect(isFitnessBatchFresh(batch("batch_future01", "2026-07-21T19:00:00.000Z"), now)).toBe(false);
  });
});

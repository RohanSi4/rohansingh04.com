import { execFileSync, spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { commitFitnessBatch, FITNESS_KEYS, type FitnessStorage } from "./fitness-storage";
import type { EncryptedFitnessBatch } from "./fitness-sync";

const hasRedis = spawnSync("redis-server", ["--version"]).status === 0;
if (process.env.CI && !hasRedis) throw new Error("Redis is required for fitness storage integration tests in CI");

describe.skipIf(!hasRedis)("fitness storage against isolated Redis", () => {
  let directory: string;
  let socket: string;
  let server: ChildProcess;
  const command = (...args: string[]) => execFileSync("redis-cli", ["-s", socket, "--raw", ...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  const storage: FitnessStorage = {
    async get<T>(key: string) { const raw = command("GET", key); return raw ? JSON.parse(raw) as T : null; },
    async eval(script, keys, args) { return Number(command("EVAL", script, String(keys.length), ...keys, ...args)); },
  };
  const batch = (id: string, timestamp: string): EncryptedFitnessBatch => ({
    schemaVersion: 2, batchId: id, deviceId: "synthetic-device", createdAt: timestamp,
    encryption: { algorithm: "AES-256-GCM", keyId: "test-key", nonce: "AA==", ciphertext: "AA==", tag: "AA==" },
    publicStrength: [{ id, date: "2026-09-09", kind: "upper", durationMinutes: 30, workingSets: 8, muscleGroups: ["lats"], updatedAt: timestamp }],
  });

  beforeAll(async () => {
    directory = mkdtempSync(join(tmpdir(), "fitness-redis-"));
    socket = join(directory, "redis.sock");
    server = spawn("redis-server", ["--port", "0", "--unixsocket", socket, "--save", "", "--appendonly", "no"], { stdio: "ignore" });
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if (command("PING") === "PONG") return; } catch { /* wait for our isolated socket */ }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error("Isolated Redis did not start");
  });
  beforeEach(() => { command("FLUSHDB"); });
  afterAll(async () => {
    if (server && server.exitCode === null) {
      await new Promise<void>(resolve => { server.once("exit", () => resolve()); server.kill("SIGTERM"); });
    }
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  it("rejects an older writer that read before a newer writer committed", async () => {
    const older = batch("older-batch", "2026-09-09T12:01:00Z");
    const newer = batch("newer-batch", "2026-09-09T12:02:00Z");
    let release!: () => void;
    const newerCommitted = new Promise<void>(resolve => { release = resolve; });
    const delayed: FitnessStorage = {
      get: key => storage.get(key),
      async eval(script, keys, args) {
        await newerCommitted;
        return storage.eval(script, keys, args);
      },
    };
    const pendingOld = commitFitnessBatch(delayed, older);
    expect(await commitFitnessBatch(storage, newer)).toBe(true);
    release();
    expect(await pendingOld).toBe(false);
    expect(await storage.get(FITNESS_KEYS[0])).toEqual(newer);
    expect(await storage.get(FITNESS_KEYS[1])).toEqual(newer.publicStrength);
  });

  it("commits matching public/private projections and retires plaintext weight", async () => {
    command("SET", FITNESS_KEYS[2], JSON.stringify({ currentPounds: 180 }));
    const incoming = { ...batch("initial-batch", "2026-09-09T12:00:00Z"), publicWeight: null };
    expect(await commitFitnessBatch(storage, incoming)).toBe(true);
    expect(await storage.get(FITNESS_KEYS[0])).not.toHaveProperty("publicWeight");
    expect(await storage.get(FITNESS_KEYS[1])).toEqual(incoming.publicStrength);
    expect(await storage.get(FITNESS_KEYS[2])).toBeNull();
    command("SET", FITNESS_KEYS[2], "{}");
    expect(await commitFitnessBatch(storage, incoming)).toBe(false);
    expect(await storage.get(FITNESS_KEYS[2])).toBeNull();
  });

  it("preserves ordering for legacy timestamps with UTC offsets", async () => {
    const current = batch("legacy-batch", "2026-09-09T08:00:00-04:00");
    command("SET", FITNESS_KEYS[0], JSON.stringify(current));
    expect(await commitFitnessBatch(storage, batch("earlier-batch", "2026-09-09T11:59:00Z"))).toBe(false);
    expect(await commitFitnessBatch(storage, batch("later-batch", "2026-09-09T12:01:00Z"))).toBe(true);
  });

  it("never acknowledges an unavailable store or exhausted contention", async () => {
    const incoming = batch("retry-batch", "2026-09-09T12:00:00Z");
    await expect(commitFitnessBatch({ ...storage, eval: async () => { throw new Error("offline"); } }, incoming)).rejects.toThrow("offline");
    let attempts = 0;
    await expect(commitFitnessBatch({ ...storage, eval: async () => { attempts++; return -1; } }, incoming)).rejects.toThrow("contention");
    expect(attempts).toBe(5);
    expect(await storage.get(FITNESS_KEYS[0])).toBeNull();
  });
});

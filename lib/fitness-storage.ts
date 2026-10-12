import { normalizePublicStrengthSessions, shouldAcceptFitnessBatch, type EncryptedFitnessBatch } from "./fitness-sync";

export const FITNESS_KEYS = [
  "fitness:private:latest:v1",
  "fitness:public:strength:v1",
  "fitness:public:weight:v1",
];

// Compare the version read by the caller before committing both projections.
// Timestamp ordering stays in JS so legacy ISO offsets retain Date.parse semantics.
// No other writer can interleave between the comparison and the MSET.
export const COMMIT_FITNESS_BATCH = `
local raw = redis.call('GET', KEYS[1])
if ARGV[1] == 'missing' then
  if raw then return -1 end
else
  if not raw then return -1 end
  local current = cjson.decode(raw)
  if current.batchId ~= ARGV[2] or current.createdAt ~= ARGV[3] then return -1 end
end
if ARGV[4] == '1' then
  redis.call('MSET', KEYS[1], ARGV[5], KEYS[2], ARGV[6])
end
redis.call('DEL', KEYS[3])
return tonumber(ARGV[4])
`;

export interface FitnessStorage {
  get<T>(key: string): Promise<T | null>;
  eval(script: string, keys: string[], args: string[]): Promise<unknown>;
}

export async function commitFitnessBatch(storage: FitnessStorage, batch: EncryptedFitnessBatch): Promise<boolean> {
  // Retire plaintext weight even for callers other than the HTTP endpoint.
  const { publicWeight: _retired, ...privateBatch } = batch;
  const privateJSON = JSON.stringify(privateBatch);
  const publicJSON = JSON.stringify(normalizePublicStrengthSessions(batch.publicStrength));
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await storage.get<EncryptedFitnessBatch>(FITNESS_KEYS[0]);
    const accept = shouldAcceptFitnessBatch(batch, current);
    const result = await storage.eval(COMMIT_FITNESS_BATCH, FITNESS_KEYS, [
      current ? "present" : "missing", current?.batchId ?? "", current?.createdAt ?? "",
      accept ? "1" : "0", privateJSON, publicJSON,
    ]);
    if (result === 1) return true;
    if (result === 0) return false;
    if (result !== -1) throw new Error("Unexpected fitness storage response");
  }
  // Return a retryable failure rather than acknowledge data we never committed.
  throw new Error("Fitness sync contention; retry the upload");
}

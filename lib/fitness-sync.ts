export const FITNESS_SYNC_SCHEMA_VERSION = 1 as const;

export const strengthKinds = [
  "upper",
  "lower",
  "push",
  "pull",
  "legs",
  "chest",
  "back",
  "other",
] as const;

export type PublicStrengthKind = (typeof strengthKinds)[number];

export type PublicStrengthSession = {
  id: string;
  date: string;
  kind: PublicStrengthKind;
  durationMinutes: number;
  workingSets: number;
  muscleGroups: string[];
  updatedAt: string;
};

export type EncryptedFitnessBatch = {
  schemaVersion: typeof FITNESS_SYNC_SCHEMA_VERSION;
  batchId: string;
  deviceId: string;
  createdAt: string;
  encryption: {
    algorithm: "AES-256-GCM";
    keyId: string;
    nonce: string;
    ciphertext: string;
    tag: string;
  };
  publicStrength: PublicStrengthSession[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const IDENTIFIER_PATTERN = /^[a-zA-Z0-9:_-]{8,120}$/;
const BASE64_PATTERN = /^[a-zA-Z0-9+/_=-]+$/;
const strengthKindSet = new Set<string>(strengthKinds);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  const allowedSet = new Set(allowed);
  return Object.keys(value).every((key) => allowedSet.has(key));
}

function isISODateTime(value: unknown): value is string {
  return typeof value === "string"
    && value.length <= 40
    && Number.isFinite(Date.parse(value));
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function isBase64(value: unknown, maxLength: number): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= maxLength
    && BASE64_PATTERN.test(value);
}

function isPublicStrengthSession(value: unknown): value is PublicStrengthSession {
  if (!isRecord(value) || !isIdentifier(value.id) || !isISODateTime(value.updatedAt)) {
    return false;
  }
  return hasOnlyKeys(value, [
    "id",
    "date",
    "kind",
    "durationMinutes",
    "workingSets",
    "muscleGroups",
    "updatedAt",
  ])
    && typeof value.date === "string"
    && DATE_PATTERN.test(value.date)
    && typeof value.kind === "string"
    && strengthKindSet.has(value.kind)
    && typeof value.durationMinutes === "number"
    && Number.isInteger(value.durationMinutes)
    && value.durationMinutes >= 0
    && value.durationMinutes <= 600
    && typeof value.workingSets === "number"
    && Number.isInteger(value.workingSets)
    && value.workingSets >= 0
    && value.workingSets <= 200
    && Array.isArray(value.muscleGroups)
    && value.muscleGroups.length <= 12
    && value.muscleGroups.every((muscle) =>
      typeof muscle === "string" && muscle.length > 0 && muscle.length <= 40,
    );
}

export function parseEncryptedFitnessBatch(value: unknown): EncryptedFitnessBatch | null {
  if (!isRecord(value) || value.schemaVersion !== FITNESS_SYNC_SCHEMA_VERSION) return null;
  if (!hasOnlyKeys(value, [
    "schemaVersion",
    "batchId",
    "deviceId",
    "createdAt",
    "encryption",
    "publicStrength",
  ])) return null;
  if (!isIdentifier(value.batchId) || !isIdentifier(value.deviceId) || !isISODateTime(value.createdAt)) {
    return null;
  }
  if (!isRecord(value.encryption)) return null;
  if (
    !hasOnlyKeys(value.encryption, ["algorithm", "keyId", "nonce", "ciphertext", "tag"])
    || value.encryption.algorithm !== "AES-256-GCM"
    || !isIdentifier(value.encryption.keyId)
    || !isBase64(value.encryption.nonce, 64)
    || !isBase64(value.encryption.tag, 64)
    || !isBase64(value.encryption.ciphertext, 1_200_000)
  ) {
    return null;
  }
  if (
    !Array.isArray(value.publicStrength)
    || value.publicStrength.length > 400
    || !value.publicStrength.every(isPublicStrengthSession)
  ) {
    return null;
  }
  return value as EncryptedFitnessBatch;
}

export function normalizePublicStrengthSessions(
  sessions: PublicStrengthSession[],
  maximum = 400,
): PublicStrengthSession[] {
  const byId = new Map<string, PublicStrengthSession>();
  for (const session of sessions) {
    const existing = byId.get(session.id);
    if (!existing || existing.updatedAt <= session.updatedAt) byId.set(session.id, session);
  }
  return [...byId.values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, maximum);
}

export function shouldAcceptFitnessBatch(
  incoming: EncryptedFitnessBatch,
  current: EncryptedFitnessBatch | null,
): boolean {
  if (!current) return true;
  if (incoming.batchId === current.batchId) return false;
  return Date.parse(incoming.createdAt) > Date.parse(current.createdAt);
}

export function strengthWeekSummary(
  sessions: PublicStrengthSession[],
  weekStart: string,
): {
  sessions: PublicStrengthSession[];
  days: number;
  workingSets: number;
  topMuscles: string[];
} {
  const end = new Date(`${weekStart}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  const weekEnd = end.toISOString().slice(0, 10);
  const weekSessions = sessions.filter((session) => session.date >= weekStart && session.date <= weekEnd);
  const muscleCounts = new Map<string, number>();
  for (const session of weekSessions) {
    for (const muscle of session.muscleGroups) {
      muscleCounts.set(muscle, (muscleCounts.get(muscle) ?? 0) + 1);
    }
  }
  return {
    sessions: weekSessions,
    days: new Set(weekSessions.map((session) => session.date)).size,
    workingSets: weekSessions.reduce((sum, session) => sum + session.workingSets, 0),
    topMuscles: [...muscleCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([muscle]) => muscle),
  };
}

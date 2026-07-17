const STATUS_URL =
  "https://raw.githubusercontent.com/RohanSi4/rohansingh04.com/status/status.json";

export type DemoStatusEntry = {
  ok: boolean;
  generatedAt: string;
};

export type DemoStatusMap = Map<string, DemoStatusEntry>;

// trailing-slash tolerant: meta.liveUrl and check-live URLs disagree on it
export function normalizeDemoUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

// pure so tests can cover it without network access
export function parseStatus(json: unknown): DemoStatusMap | null {
  if (!json || typeof json !== "object") return null;
  const payload = json as { generatedAt?: unknown; results?: unknown };
  if (typeof payload.generatedAt !== "string") return null;
  if (Number.isNaN(Date.parse(payload.generatedAt))) return null;
  if (!Array.isArray(payload.results)) return null;

  const map: DemoStatusMap = new Map();
  for (const entry of payload.results) {
    if (!entry || typeof entry !== "object") continue;
    const { url, ok } = entry as { url?: unknown; ok?: unknown };
    if (typeof url !== "string" || typeof ok !== "boolean") continue;
    map.set(normalizeDemoUrl(url), { ok, generatedAt: payload.generatedAt });
  }
  return map.size > 0 ? map : null;
}

export async function getDemoStatus(): Promise<DemoStatusMap | null> {
  try {
    const response = await fetch(STATUS_URL, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return parseStatus(await response.json());
  } catch {
    // the status branch may not exist yet; pages must render fine without it
    return null;
  }
}

export function relativeCheckTime(generatedAt: string, now = Date.now()): string {
  const elapsedMs = now - Date.parse(generatedAt);
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return "recently";
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

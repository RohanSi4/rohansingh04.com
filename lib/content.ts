import fs from "fs";
import path from "path";
import type {
  HistoryEntry,
  Place,
  ProjectMeta,
  SiteConfig,
  StateEntry,
} from "./types";

const contentDir = path.join(process.cwd(), "content");

function readJson<T>(relPath: string): T {
  const abs = path.join(contentDir, relPath);
  return JSON.parse(fs.readFileSync(abs, "utf-8")) as T;
}

export function getSiteConfig(): SiteConfig {
  return readJson<SiteConfig>("site-config.json");
}

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>("history.json");
}

export async function getPlaces(): Promise<Place[]> {
  const { getPlacesKV } = await import("./kv-data");
  return getPlacesKV();
}

export async function getStates(): Promise<StateEntry[]> {
  const { getStatesKV } = await import("./kv-data");
  return getStatesKV();
}

/** Return all project meta.json files, sorted by startDate desc.
 *  Featured projects come first within the sort. */
export function getAllProjects(): ProjectMeta[] {
  const projectsDir = path.join(contentDir, "projects");
  const slugs = fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const metas = slugs.map((slug) =>
    readJson<ProjectMeta>(`projects/${slug}/meta.json`)
  );

  return metas.sort((a, b) => {
    // featured first, then by startDate desc
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.startDate.localeCompare(a.startDate);
  });
}

export function getFeaturedProjects(): ProjectMeta[] {
  const preferredOrder = [
    "marathon-prep-bot",
    "movie-recommender",
    "personal-site",
  ];

  return getAllProjects()
    .filter((project) => project.featured)
    .sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.slug);
      const bIndex = preferredOrder.indexOf(b.slug);
      if (aIndex === -1 && bIndex === -1) return b.startDate.localeCompare(a.startDate);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
}

export function getProjectMeta(slug: string): ProjectMeta | null {
  try {
    return readJson<ProjectMeta>(`projects/${slug}/meta.json`);
  } catch {
    return null;
  }
}

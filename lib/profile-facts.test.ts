import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HistoryEntry, SiteConfig } from "./types";

const root = process.cwd();

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as T;
}

describe("current profile facts", () => {
  it("keeps the homepage status aligned with the current school year", () => {
    const site = readJson<SiteConfig>("content/site-config.json");

    expect(site.currentLocation).toBe("Charlottesville, VA");
    expect(site.currentChapter).toBe("fall 2026");
    expect(site.currentRole).toEqual({ title: "CS student", org: "UVA" });
    expect(site.graduationDate).toBe("2026-12");
  });

  it("keeps Expedia completed while preserving San Jose as historical context", () => {
    const history = readJson<HistoryEntry[]>("content/history.json");
    const expedia = history.find((entry) => entry.id === "expedia-2026");

    expect(expedia).toMatchObject({
      startDate: "2026-06",
      endDate: "2026-08",
      location: "San Jose, CA",
    });
  });
});

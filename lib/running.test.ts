import { describe, expect, it } from "vitest";
import snapshot from "@/content/running-dashboard.json";
import { formatPace, formatRunDate, getRunningDashboard } from "./running";

describe("running dashboard snapshot", () => {
  it("matches the public dashboard contract", () => {
    const data = getRunningDashboard();

    expect(data.schemaVersion).toBe(1);
    expect(data.weeks.length).toBeGreaterThan(0);
    expect(data.recentRuns.length).toBeGreaterThan(0);
    expect(data.currentWeek).toEqual(data.weeks.at(-1));
    expect(data.recentRuns[0].date <= data.dataThrough).toBe(true);
  });

  it("keeps private source fields out of the committed snapshot", () => {
    const publicJson = JSON.stringify(snapshot);
    const forbidden = [
      "start_latlng",
      "sourceFile",
      "injuryNotes",
      "keyRuns",
      "latitude",
      "longitude",
    ];

    for (const field of forbidden) {
      expect(publicJson).not.toContain(field);
    }
  });

  it("keeps recent runs newest first", () => {
    const dates = getRunningDashboard().recentRuns.map((run) => run.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("running formatters", () => {
  it("formats pace as minutes per mile", () => {
    expect(formatPace(583)).toBe("9:43");
  });

  it("formats date-only values without timezone drift", () => {
    expect(formatRunDate("2026-07-11", true)).toBe("Jul 11, 2026");
  });
});

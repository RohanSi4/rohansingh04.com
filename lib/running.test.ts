import { describe, expect, it } from "vitest";
import snapshot from "@/content/running-dashboard.json";
import {
  formatPace,
  formatRunDate,
  getStaticRunningDashboard,
  mergeLiveRuns,
} from "./running";

describe("running dashboard snapshot", () => {
  it("matches the public dashboard contract", () => {
    const data = getStaticRunningDashboard();

    expect(data.schemaVersion).toBe(2);
    expect(data.weeks.length).toBeGreaterThan(0);
    expect(data.recentRuns.length).toBeGreaterThan(0);
    expect(data.currentWeek).toEqual(data.weeks.at(-1));
    expect(data.recentRuns[0].date <= data.dataThrough).toBe(true);
    expect(data.yearlyHistory.map((year) => year.year)).toEqual([
      "2022", "2023", "2024", "2025", "2026",
    ]);
    expect(data.totals.totalActivities).toBeGreaterThan(1_000);
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
    const dates = getStaticRunningDashboard().recentRuns.map((run) => run.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("merges a newer live run without double-counting the archive", () => {
    const data = getStaticRunningDashboard();
    const updated = mergeLiveRuns(data, [{
      id: 999,
      date: "2026-07-13",
      sport: "Run",
      name: "Morning Run",
      movingMins: 30,
      distanceMi: 3.1,
      calories: 300,
      avgHR: 142,
    }]);

    expect(updated.dataThrough).toBe("2026-07-13");
    expect(updated.totals.totalRuns).toBe(data.totals.totalRuns + 1);
    expect(updated.totals.runMiles).toBe(data.totals.runMiles + 3.1);
    expect(updated.recentRuns[0].id).toBe("live-999");
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

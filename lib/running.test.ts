import { describe, expect, it } from "vitest";
import snapshot from "@/content/running-dashboard.json";
import {
  formatPace,
  formatRunDate,
  fitnessTimeZone,
  getPlanWeekDays,
  getStaticRunningDashboard,
  mergeLiveHealth,
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
    expect(data.health.recentActivities.every((activity) => (
      activity.averageHeartRate === null
      || (typeof activity.averageHeartRate === "number" && activity.averageHeartRate > 0)
    ))).toBe(true);
    expect(data.health.recentActivities.some((activity) => (activity.averageHeartRate ?? 0) > 0)).toBe(true);
    expect(data.trainingPlan?.days.length).toBeGreaterThan(0);
    expect(data.race.trainingStart).toBe("2026-06-22");
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
      "\u2014",
    ];

    for (const field of forbidden) {
      expect(publicJson).not.toContain(field);
    }
  });

  it("keeps recent runs newest first", () => {
    const dates = getStaticRunningDashboard().recentRuns.map((run) => run.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("keeps the public plan inside its stated week", () => {
    const plan = getStaticRunningDashboard().trainingPlan;
    expect(plan).not.toBeNull();
    if (!plan) return;

    const days = getPlanWeekDays(plan);
    expect(days[0]?.date).toBe(plan.weekStart);
    expect(days.at(-1)?.date).toBe(plan.weekEnd);
    expect(days.every((day) => (
      (!plan.weekStart || day.date >= plan.weekStart)
      && (!plan.weekEnd || day.date <= plan.weekEnd)
    ))).toBe(true);
  });

  it("merges a newer live run without double-counting the archive", () => {
    const data = getStaticRunningDashboard();
    const nextDate = new Date(`${data.dataThrough}T12:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const liveDate = nextDate.toISOString().slice(0, 10);
    const updated = mergeLiveRuns(data, [{
      id: 999,
      date: liveDate,
      sport: "Run",
      name: "Morning Run",
      movingMins: 30,
      distanceMi: 3.1,
      calories: 300,
      avgHR: 142,
    }]);

    expect(updated.dataThrough).toBe(liveDate);
    expect(updated.totals.totalRuns).toBe(data.totals.totalRuns + 1);
    expect(updated.totals.runMiles).toBe(data.totals.runMiles + 3.1);
    expect(updated.recentRuns[0].id).toBe("live-999");
  });

  it("preserves lifetime health history when live health only covers 365 days", () => {
    const archive = getStaticRunningDashboard().health;
    const nextDate = "2099-01-02";
    const live = {
      ...archive,
      updatedAt: "2099-01-02T12:00:00.000Z",
      lastActivity: archive.lastActivity
        ? { ...archive.lastActivity, date: nextDate, name: "Private route title" }
        : null,
      recentActivities: archive.recentActivities.map((activity, index) => index === 0
        ? { ...activity, name: "Private route title" }
        : activity),
      streak: { currentDays: 1, bestDays: 1 },
      allTime: { activeDays: 1, sinceDate: "2098-01-03" },
      heatmap: [
        ...archive.heatmap,
        {
          date: nextDate,
          intensity: 2,
          exerciseMinutes: 30,
          sport: "Run",
          distanceMi: 3.1,
        },
      ],
    };

    const merged = mergeLiveHealth(archive, live);

    expect(merged.allTime.activeDays).toBe(archive.allTime.activeDays + 1);
    expect(merged.allTime.sinceDate).toBe(archive.allTime.sinceDate);
    expect(merged.streak.bestDays).toBe(archive.streak.bestDays);
    expect(merged.today).toBe(live.today);
    expect(merged.lastActivity?.name).not.toBe("Private route title");
    expect(merged.recentActivities[0]?.name).not.toBe("Private route title");
  });
});

describe("running formatters", () => {
  it("formats pace as minutes per mile", () => {
    expect(formatPace(583)).toBe("9:43");
  });

  it("carries rounded seconds into the next minute", () => {
    expect(formatPace(599.6)).toBe("10:00");
  });

  it("formats date-only values without timezone drift", () => {
    expect(formatRunDate("2026-07-11", true)).toBe("Jul 11, 2026");
  });

  it("switches the fitness timezone when the summer move ends", () => {
    expect(fitnessTimeZone(new Date("2026-07-12T12:00:00Z"))).toBe("America/Los_Angeles");
    expect(fitnessTimeZone(new Date("2026-08-30T12:00:00Z"))).toBe("America/New_York");
  });
});

import { describe, expect, it } from "vitest";
import { buildWeekPlanRows } from "./weekly-plan";

describe("weekly plan rows", () => {
  it("splits the plan into run and lift columns and shows synced actuals", () => {
    const rows = buildWeekPlanRows([{
      date: "2026-07-13",
      dayLabel: "Mon 7/13",
      text: "Easy 5 miles at an easy effort + 4×20s strides (flat, relaxed, full walk recovery) + upper body lift",
      isKeyDay: false,
    }], [{
      date: "2026-07-13",
      sport: "Run",
      name: "Outdoor run",
      movingMins: 47,
      distanceMi: 5.1,
    }, {
      date: "2026-07-13",
      sport: "WeightTraining",
      name: "Strength training",
      movingMins: 62,
      distanceMi: 0,
    }], "2026-07-13");

    expect(rows[0].runTasks).toEqual([
      { id: "2026-07-13:run:0", text: "5 mile run", actual: "5.1 mi · 47 min", trackable: true, isExtra: false },
    ]);
    expect(rows[0].otherTasks).toEqual([
      { id: "2026-07-13:other:1", text: "upper body lift", actual: "62 min", trackable: true, isExtra: false },
    ]);
  });

  it("keeps rest in the run column and surfaces an unplanned activity", () => {
    const rows = buildWeekPlanRows([{
      date: "2026-07-17",
      dayLabel: "Fri 7/17",
      text: "Rest + optional walk/golf",
      isKeyDay: false,
    }], [{
      date: "2026-07-17",
      sport: "Basketball",
      name: "Basketball",
      movingMins: 45,
      distanceMi: 0,
    }], "2026-07-18");

    expect(rows[0].runTasks[0].text).toBe("rest");
    expect(rows[0].runTasks[0].trackable).toBe(false);
    expect(rows[0].otherTasks).toEqual([
      { id: "2026-07-17:other:1", text: "optional walk or golf", actual: null, trackable: true, isExtra: false },
      { id: "2026-07-17:actual:Basketball", text: "basketball", actual: "45 min", trackable: true, isExtra: true },
    ]);
  });

  it("uses a HealthFit workout to fill in circuit work", () => {
    const rows = buildWeekPlanRows([{
      date: "2026-07-19",
      dayLabel: "Sun 7/19",
      text: "Rest + circuit",
      isKeyDay: false,
    }], [{
      date: "2026-07-19",
      sport: "Workout",
      name: "Workout",
      movingMins: 24,
      distanceMi: 0,
    }], "2026-07-19");

    expect(rows[0].otherTasks[0]).toEqual({
      id: "2026-07-19:other:1",
      text: "circuit",
      actual: "24 min",
      trackable: true,
      isExtra: false,
    });
  });

  it("ticks off-watch work from coach-logged completions", () => {
    const rows = buildWeekPlanRows([{
      date: "2026-07-15",
      dayLabel: "Wed 7/15",
      text: "Recovery 3 miles at an easy effort + circuit",
      isKeyDay: false,
    }], [{
      date: "2026-07-15",
      sport: "Run",
      name: "Outdoor run",
      movingMins: 32,
      distanceMi: 3.5,
    }], "2026-07-16", { "2026-07-15": ["circuit"] });

    expect(rows[0].otherTasks[0]).toEqual({
      id: "2026-07-15:other:1",
      text: "circuit",
      actual: "done · coach-logged",
      trackable: true,
      isExtra: false,
    });
    // A recorded activity still wins over a manual tick.
    expect(rows[0].runTasks[0].actual).toBe("3.5 mi · 32 min");
  });

  it("does not tick a completion for a different day or unmatched task", () => {
    const rows = buildWeekPlanRows([{
      date: "2026-07-16",
      dayLabel: "Thu 7/16",
      text: "Easy 6 miles at an easy effort + circuit",
      isKeyDay: false,
    }], [], "2026-07-16", { "2026-07-15": ["circuit"] });

    expect(rows[0].otherTasks[0].actual).toBeNull();
  });
});

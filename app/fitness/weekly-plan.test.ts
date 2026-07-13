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
      { id: "2026-07-13:run:0", text: "Easy 5 miles at an easy effort", actual: "5.1 mi · 47 min" },
      { id: "2026-07-13:run:1", text: "4×20s strides (flat, relaxed, full walk recovery)", actual: null },
    ]);
    expect(rows[0].otherTasks).toEqual([
      { id: "2026-07-13:other:2", text: "upper body lift", actual: "62 min" },
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

    expect(rows[0].runTasks[0].text).toBe("Rest");
    expect(rows[0].otherTasks).toEqual([
      { id: "2026-07-17:other:1", text: "optional walk/golf", actual: null },
      { id: "2026-07-17:actual:Basketball", text: "basketball", actual: "45 min" },
    ]);
  });
});

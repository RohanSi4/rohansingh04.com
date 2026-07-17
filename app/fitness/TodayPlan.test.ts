import { describe, expect, it } from "vitest";
import { summarizeDayActivities, todayPlanDisplay } from "./TodayPlan";

describe("today plan display", () => {
  it("keeps only the public workout and supporting task", () => {
    expect(todayPlanDisplay(
      "Easy 5 miles at an easy effort + 4×20s strides (flat, relaxed ~7:00-7:15 feel, full walk recovery) + upper body lift",
    )).toEqual({
      title: "5 mile run",
      details: [
        { label: "upper body lift", note: null },
      ],
    });
  });

  it("removes execution notes from the public long-run card", () => {
    expect(todayPlanDisplay(
      "long run 11.5 miles easy, outdoors, morning. Keep it conversational. Bring water.",
    )).toEqual({
      title: "11.5 mile long run",
      details: [],
    });
  });

  it("combines same-day HealthFit runs and strength work", () => {
    expect(summarizeDayActivities([{
      date: "2026-07-13",
      sport: "Run",
      name: "Run",
      movingMins: 19,
      distanceMi: 2,
    }, {
      date: "2026-07-13",
      sport: "Run",
      name: "Run",
      movingMins: 40,
      distanceMi: 4.33,
    }, {
      date: "2026-07-13",
      sport: "WeightTraining",
      name: "Strength training",
      movingMins: 98,
      distanceMi: 0,
    }], "2026-07-13")).toEqual({
      runCount: 2,
      runDistanceMi: 6.3,
      runMinutes: 59,
      strengthMinutes: 98,
    });
  });
});

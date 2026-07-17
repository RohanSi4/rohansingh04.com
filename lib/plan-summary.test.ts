import { describe, expect, it } from "vitest";
import { summarizePlanDayText } from "./plan-summary";

describe("public plan summaries", () => {
  it("keeps only the run and lift from a detailed coaching prescription", () => {
    expect(summarizePlanDayText(
      "Easy 5mi ≤150 + 4×20s strides (flat, relaxed, full walk recovery) + UPPER #1",
    )).toBe("5 mile run + upper body lift");
  });

  it("reduces a detailed long run to its public checklist label", () => {
    expect(summarizePlanDayText(
      "LR 12.0mi easy, OUTDOORS, morning (top of the progression gate) — sub-148 · WATER MANDATORY · 3 gels",
    )).toBe("12 mile long run");
  });

  it("keeps simple supporting work but removes the recovery valve", () => {
    expect(summarizePlanDayText(
      "Recovery 3mi ≤145 + circuit — ⚠ VALVE: any right-side signal becomes REST",
    )).toBe("3 mile run + circuit");
  });

  it("shows a changed and skipped run day as rest", () => {
    expect(summarizePlanDayText(
      "CHANGED (fatigue valve): run + strides + UPPER #2 skipped; easy social pickleball and hoops",
    )).toBe("rest");
  });

  it("keeps rest-day work concise", () => {
    expect(summarizePlanDayText("Rest + LOWER #2 + circuit")).toBe(
      "rest + lower body lift + circuit",
    );
    expect(summarizePlanDayText("Rest + optional walk/golf")).toBe(
      "rest + optional walk or golf",
    );
  });

  it("keeps an already concise public plan unchanged", () => {
    expect(summarizePlanDayText("5 mile run + upper body lift")).toBe(
      "5 mile run + upper body lift",
    );
    expect(summarizePlanDayText("12 mile long run")).toBe("12 mile long run");
  });
});

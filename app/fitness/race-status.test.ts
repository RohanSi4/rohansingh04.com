import { describe, expect, it } from "vitest";
import type { RaceResult } from "@/lib/types";
import { raceStatus } from "./race-status";

const richmond: RaceResult = {
  id: "richmond-2026",
  name: "Allianz Richmond Marathon",
  date: "2026-11-14",
  location: "Richmond, VA",
  distance: "marathon",
  chipTime: "3:34:43",
  goalTime: "3:20",
  summary: "My first marathon.",
  noteSlug: "first-marathon-richmond",
};

describe("race status", () => {
  it("keeps counting down before and on race day", () => {
    expect(raceStatus("2026-11-13", "2026-11-14", [richmond])).toEqual({ phase: "upcoming" });
    expect(raceStatus("2026-11-14", "2026-11-14", [richmond])).toEqual({ phase: "upcoming" });
  });

  it("shows the matching result once race day has passed", () => {
    expect(raceStatus("2026-11-15", "2026-11-14", [richmond])).toEqual({
      phase: "finished",
      result: richmond,
    });
  });

  it("still flips to finished when the result has not been written up yet", () => {
    expect(raceStatus("2026-11-15", "2026-11-14", [])).toEqual({ phase: "finished", result: null });
    expect(
      raceStatus("2027-04-01", "2027-03-20", [richmond]),
    ).toEqual({ phase: "finished", result: null });
  });
});

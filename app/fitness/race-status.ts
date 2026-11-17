import type { RaceResult } from "@/lib/types";

export type RaceStatus =
  | { phase: "upcoming" }
  | { phase: "finished"; result: RaceResult | null };

/** The hero counts down until race day and flips to the result once the date has
 *  passed. Race day itself still reads as upcoming, since the result is not in yet.
 *  A finished race without a races.json entry still flips, just without a time. */
export function raceStatus(today: string, raceDate: string, races: RaceResult[]): RaceStatus {
  if (today <= raceDate) return { phase: "upcoming" };
  return { phase: "finished", result: races.find((race) => race.date === raceDate) ?? null };
}

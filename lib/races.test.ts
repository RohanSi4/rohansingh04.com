import { describe, expect, it } from "vitest";
import { getRaces } from "./content";
import { getNoteSource } from "./notes";

describe("race results content", () => {
  const races = getRaces();

  it("keeps every race complete and ids unique", () => {
    const ids = new Set<string>();
    for (const race of races) {
      expect(race.name.trim().length, `${race.id} has an empty name`).toBeGreaterThan(0);
      expect(race.date, `${race.id} has an invalid date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(race.chipTime, `${race.id} chip time is not H:MM:SS`).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
      expect(ids.has(race.id), `duplicate race id: ${race.id}`).toBe(false);
      ids.add(race.id);
    }
  });

  it("sorts newest first", () => {
    const dates = races.map((race) => race.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("points every race recap at a note that exists", () => {
    for (const race of races) {
      if (race.noteSlug === null) continue;
      expect(getNoteSource(race.noteSlug), `${race.id} recap note is missing`).not.toBeNull();
    }
  });

  // Written in Rohan's name, so the same rule as the notes applies.
  it("contains no em or en dashes", () => {
    for (const race of races) {
      const copy = `${race.name} ${race.location} ${race.summary}`;
      expect(/[–—]/.test(copy), `${race.id} contains an em or en dash`).toBe(false);
    }
  });
});

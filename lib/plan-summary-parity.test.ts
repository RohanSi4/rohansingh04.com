import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { summarizePlanDayText } from "./plan-summary";

// ─── The two summarizers must agree ───────────────────────────────────────────
// This vocabulary exists in THREE places: here, scripts/sync-running-data.mjs,
// and the coach's own lib/public-plan.ts. The exporter runs last and re-derives
// the summary from the coach's text, so a gap in either site copy silently
// deletes a task the coach already published correctly. That is exactly what
// happened on 2026-08-05: the coach published "4 mile run + swim" and the live
// card read "4 mile run", because neither site copy knew the word.
//
// Extracting the shared implementation across a .mjs script and TypeScript is a
// bigger change than it looks; asserting the two agree is cheap and catches the
// drift that actually bites.
const mjs = readFileSync(
  path.join(process.cwd(), "scripts", "sync-running-data.mjs"),
  "utf8",
);

const CORPUS = [
  "Easy 4mi ≤145, 10:45-11:30/mi outdoors + SWIM 35-40min, TECHNIQUE ONLY, no hard sets — target 14 strokes per 25yd",
  "Rest from running + UPPER #2 — deliberately the one day with NO swim: upper lifting and swimming stack on the same joint",
  "Easy 5mi ≤150 + 4×20s strides (flat, relaxed) + UPPER #1",
  "LR 13mi easy, OUTDOORS, ROLLING BY 7:00AM + LOWER #2 in the evening",
  "CHANGED (fatigue valve): run + strides + UPPER #2 skipped; easy social pickleball and hoops",
  "6mi total — 4×1000m at 4:28 per rep. TREADMILL, evening + UPPER #1 after",
  "Rest — complete recovery",
  "Easy 6mi + LOWER #1 + optional walk or golf if it happens",
];

describe("the two plan summarizers", () => {
  it("both know every task word the other does", () => {
    // Pull the pushed task literals out of the .mjs and compare vocabularies.
    const words = (src: string) =>
      new Set([...src.matchAll(/tasks\.push\(\s*[`"']([a-z ]+)[`"']/g)].map((m) => m[1]));
    const tsSrc = readFileSync(path.join(process.cwd(), "lib", "plan-summary.ts"), "utf8");
    const mjsWords = words(mjs);
    const tsWords = words(tsSrc);
    expect([...mjsWords].sort()).toEqual([...tsWords].sort());
    expect(mjsWords.has("swim")).toBe(true);
  });

  it("agrees with the exporter on a corpus of real day lines", async () => {
    // Import the .mjs copy by evaluating just its summarizer, so the two run
    // side by side on identical input.
    const start = mjs.indexOf("function concisePlanDayText");
    expect(start).toBeGreaterThan(-1);
    const helperStart = mjs.indexOf("function planIncludesSkippedTask");
    const helperEnd = mjs.indexOf("\n}", helperStart) + 2;
    const milesStart = mjs.indexOf("function planMilesLabel");
    const milesEnd = mjs.indexOf("\n}", milesStart) + 2;
    const end = mjs.indexOf("\n}", start) + 2;
    const src = mjs.slice(helperStart, helperEnd)
      + mjs.slice(milesStart, milesEnd)
      + mjs.slice(start, end)
      + "\nreturn concisePlanDayText;";
    const concise = new Function(src)() as (v: string) => string;
    for (const line of CORPUS) {
      expect(concise(line), `mismatch on: ${line}`).toBe(summarizePlanDayText(line));
    }
  });
});

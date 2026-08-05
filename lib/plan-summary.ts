function milesLabel(value: string): string {
  const miles = Number(value);
  return Number.isFinite(miles) ? String(miles) : value;
}

function includesSkippedTask(text: string, task: RegExp): boolean {
  const parts = text.split(/[.;]/);
  return parts.some((part) => task.test(part) && /\bskipped\b/i.test(part));
}

/**
 * Turn the coach's private prescription into the small public checklist.
 * Effort caps, pacing cues, fueling, gates, and coaching notes stay out.
 */
export function summarizePlanDayText(value: string): string {
  const text = value
    .replace(/\*\*/g, "")
    .replace(/[\u2013\u2014]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
  const supportText = text.replace(/\([^)]*\)/g, "");
  const tasks: string[] = [];
  const runWasSkipped = includesSkippedTask(text, /\b(?:run|running)\b/i);
  const longRun = text.match(/\b(?:LR|long run)\s*(\d+(?:\.\d+)?)\s*(?:mi|miles?)\b/i)
    ?? text.match(/\b(\d+(?:\.\d+)?)\s*(?:mi|miles?)\b[^+.;]{0,24}\blong run\b/i);
  const run = text.match(/\b(\d+(?:\.\d+)?)\s*(?:mi|miles?)\b/i);

  if (!runWasSkipped && longRun) {
    tasks.push(`${milesLabel(longRun[1])} mile long run`);
  } else if (!runWasSkipped && run) {
    const optional = /\boptional\b/i.test(text.slice(0, run.index ?? 0));
    tasks.push(`${optional ? "optional " : ""}${milesLabel(run[1])} mile run`);
  } else if (/\brest\b/i.test(text) || runWasSkipped) {
    tasks.push("rest");
  }

  const upper = /\b(?:UPPER\s*#[12]|upper body lift)\b/i;
  const lower = /\b(?:LOWER\s*#[12]|lower body lift)\b/i;
  if (upper.test(supportText) && !includesSkippedTask(supportText, upper)) tasks.push("upper body lift");
  if (lower.test(supportText) && !includesSkippedTask(supportText, lower)) tasks.push("lower body lift");
  if (/\bcircuit\b/i.test(supportText) && !includesSkippedTask(supportText, /\bcircuit\b/i)) tasks.push("circuit");
  // Swimming entered the plan 2026-08-05. Both this file and
  // scripts/sync-running-data.mjs re-derive the summary from the coach text, so a
  // vocabulary gap HERE silently deletes a task the coach already published
  // correctly - which is exactly what happened to the first swim day. The
  // negation check is adjacency-based on purpose: the swim prescription itself
  // says "no hard sets", and a clause-level test would negate every swim.
  const swimRe = /\bswim(?:ming)?\b/i;
  const swimNegated = /\bno\s+swim(?:ming)?/i.test(supportText);
  if (swimRe.test(supportText) && !includesSkippedTask(supportText, swimRe) && !swimNegated) tasks.push("swim");


  if (!runWasSkipped) {
    const hasWalk = /\bwalk(?:ing)?\b/i.test(supportText);
    const hasGolf = /\bgolf\b/i.test(supportText);
    if (hasWalk || hasGolf) {
      const activity = hasWalk && hasGolf ? "walk or golf" : hasWalk ? "walk" : "golf";
      tasks.push(`${/\boptional\b/i.test(supportText) ? "optional " : ""}${activity}`);
    }
    if (/\b(?:basketball|hoops)\b/i.test(supportText)) tasks.push("basketball");
    if (/\bpickleball\b/i.test(supportText)) tasks.push("pickleball");
  }

  return [...new Set(tasks)].join(" + ") || "rest";
}

// The published plan's per-day instruction cap, in ONE place.
//
// This number lived as three independent literals — here in the exporter, in
// lib/running.ts, and in the coach's own lib/public-plan.ts over in
// marathon-prep-bot — and it silently truncated a real day twice. The first time
// a long run lost its fueling line; the second, a threshold session lost its
// cooldown AND its lift, because the exporter runs last and re-clipped a payload
// the coach had already built correctly. Raising one copy accomplished nothing
// both times, and nothing failed: the card just quietly got shorter.
//
// A plain .mjs so the Node exporter script and the TypeScript both read the same
// binding (tsconfig has allowJs).
//
// 12 is the Today iOS app's `isPlausible` limit. That check rejects the WHOLE
// PLAN when any single day exceeds it, which blanks his phone the way the
// Aug 1-2 2026 plan outage did — so this is a ceiling to respect, not one to
// raise casually. marathon-prep-bot's lib/public-plan.ts holds the fourth copy
// and must move with this one.
export const MAX_PLAN_DETAILS = 12;

// A single instruction longer than this is prose that escaped the allowlist, not
// an instruction. Kept here for the same reason.
export const MAX_PLAN_DETAIL_LENGTH = 180;

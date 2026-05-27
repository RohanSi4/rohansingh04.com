import type { HealthSummary } from "./types";
import type { StravaActivity } from "./strava";

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function minutesToIntensity(mins: number): number {
  if (mins === 0) return 0;
  if (mins < 21) return 1;
  if (mins < 41) return 2;
  if (mins < 61) return 3;
  return 4;
}

type DayBucket = {
  movingMins: number;
  distanceMi: number;
  calories: number;
  sports: string[];
};

function bucketByDate(activities: StravaActivity[]): Record<string, DayBucket> {
  const by: Record<string, DayBucket> = {};
  for (const a of activities) {
    if (!by[a.date]) by[a.date] = { movingMins: 0, distanceMi: 0, calories: 0, sports: [] };
    by[a.date].movingMins += a.movingMins;
    by[a.date].distanceMi += a.distanceMi;
    by[a.date].calories += a.calories;
    by[a.date].sports.push(a.sport);
  }
  return by;
}

function computeStreak(by: Record<string, DayBucket>, now: Date): number {
  let streak = 0;
  const d = new Date(now);
  if (!by[toDateStr(d)]?.movingMins) d.setDate(d.getDate() - 1);
  while (by[toDateStr(d)]?.movingMins > 0) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function buildHeatmap(by: Record<string, DayBucket>, now: Date): HealthSummary["heatmap"] {
  const entries: HealthSummary["heatmap"] = [];
  const d = new Date(now);
  d.setDate(d.getDate() - 364);
  for (let i = 0; i < 365; i++) {
    const date = toDateStr(d);
    const bucket = by[date];
    const mins = bucket?.movingMins ?? 0;
    entries.push({ date, intensity: minutesToIntensity(mins), exerciseMinutes: mins });
    d.setDate(d.getDate() + 1);
  }
  return entries;
}

function weeklyMinutesForMonth(by: Record<string, DayBucket>, monthStart: Date): number[] {
  const bars = [0, 0, 0, 0];
  const monthStr = toDateStr(monthStart).slice(0, 7);
  for (const [date, bucket] of Object.entries(by)) {
    if (!date.startsWith(monthStr)) continue;
    const day = new Date(date + "T12:00:00Z").getUTCDate() - 1;
    bars[Math.min(Math.floor(day / 7), 3)] += bucket.movingMins;
  }
  return bars;
}

export function computeHealthSummary(activities: StravaActivity[], prevBestStreak: number): HealthSummary {
  const now = new Date();
  const by = bucketByDate(activities);
  const todayStr = toDateStr(now);
  const todayBucket = by[todayStr];

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const activeDates = Object.keys(by).filter(d => by[d].movingMins > 0);

  const thisMonthActive = activeDates.filter(d => new Date(d + "T12:00:00Z") >= thisMonthStart);
  const lastMonthActive = activeDates.filter(d => {
    const dt = new Date(d + "T12:00:00Z");
    return dt >= lastMonthStart && dt < thisMonthStart;
  });
  const thisYearActive = activeDates.filter(d => new Date(d + "T12:00:00Z") >= thisYearStart);

  const thisMonthDistanceMi = Object.entries(by)
    .filter(([d]) => new Date(d + "T12:00:00Z") >= thisMonthStart)
    .reduce((s, [, b]) => s + b.distanceMi, 0);

  const thisMonthCalories = Object.entries(by)
    .filter(([d]) => new Date(d + "T12:00:00Z") >= thisMonthStart)
    .reduce((s, [, b]) => s + b.calories, 0);

  const thisYearDistanceMi = Object.entries(by)
    .filter(([d]) => new Date(d + "T12:00:00Z") >= thisYearStart)
    .reduce((s, [, b]) => s + b.distanceMi, 0);

  const currentStreak = computeStreak(by, now);
  const bestStreak = Math.max(prevBestStreak, currentStreak);

  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const last = sorted[0] ?? null;
  const sinceDate = sorted[sorted.length - 1]?.date ?? todayStr;

  return {
    updatedAt: now.toISOString(),

    today: {
      exerciseMinutes: todayBucket?.movingMins ?? 0,
      activeCalories: todayBucket?.calories ?? 0,
      distanceMi: Math.round((todayBucket?.distanceMi ?? 0) * 100) / 100,
      sport: todayBucket?.sports.at(-1) ?? null,
    },

    lastActivity: last ? {
      date: last.date,
      sport: last.sport,
      name: last.name,
      movingMins: last.movingMins,
      distanceMi: last.distanceMi,
    } : null,

    streak: { currentDays: currentStreak, bestDays: bestStreak },

    thisMonth: {
      activeDays: thisMonthActive.length,
      activeDaysDeltaVsLastMonth: thisMonthActive.length - lastMonthActive.length,
      distanceMi: Math.round(thisMonthDistanceMi * 10) / 10,
      activeCalories: Math.round(thisMonthCalories),
      weeklyMinutes: weeklyMinutesForMonth(by, thisMonthStart),
    },

    thisYear: {
      distanceMi: Math.round(thisYearDistanceMi * 10) / 10,
      activeDays: thisYearActive.length,
    },

    allTime: {
      activeDays: activeDates.length,
      sinceDate,
    },

    heatmap: buildHeatmap(by, now),
  };
}

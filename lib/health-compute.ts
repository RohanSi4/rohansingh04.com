import type { HealthSummary } from "./types";

export type DailyEntry = {
  date: string; // YYYY-MM-DD
  steps: number;
  exerciseMinutes: number;
  activeCalories: number;
  distanceMi: number;
  restingHeartRate: number | null;
};

// What the iOS shortcut sends
export type RawIngest = DailyEntry;

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

function computeStreak(byDate: Record<string, DailyEntry>, now: Date): number {
  let streak = 0;
  const d = new Date(now);
  if (!byDate[toDateStr(d)]?.exerciseMinutes) d.setDate(d.getDate() - 1);
  while (byDate[toDateStr(d)]?.exerciseMinutes > 0) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function buildHeatmap(byDate: Record<string, DailyEntry>, now: Date): HealthSummary["heatmap"] {
  const entries: HealthSummary["heatmap"] = [];
  const d = new Date(now);
  d.setDate(d.getDate() - 364);
  for (let i = 0; i < 365; i++) {
    const date = toDateStr(d);
    const entry = byDate[date];
    const mins = entry?.exerciseMinutes ?? 0;
    entries.push({ date, intensity: minutesToIntensity(mins), exerciseMinutes: mins });
    d.setDate(d.getDate() + 1);
  }
  return entries;
}

function weeklyMinutesForMonth(entries: DailyEntry[]): number[] {
  const bars = [0, 0, 0, 0];
  for (const e of entries) {
    const day = new Date(e.date + "T12:00:00Z").getUTCDate() - 1;
    bars[Math.min(Math.floor(day / 7), 3)] += e.exerciseMinutes;
  }
  return bars;
}

export function computeHealthSummary(log: DailyEntry[], prevBestStreak: number): HealthSummary {
  const now = new Date();
  const byDate: Record<string, DailyEntry> = {};
  for (const e of log) byDate[e.date] = e;

  const today = byDate[toDateStr(now)];

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const thisMonth = log.filter(e => new Date(e.date + "T12:00:00Z") >= thisMonthStart);
  const lastMonth = log.filter(e => {
    const d = new Date(e.date + "T12:00:00Z");
    return d >= lastMonthStart && d < thisMonthStart;
  });
  const thisYear = log.filter(e => new Date(e.date + "T12:00:00Z") >= thisYearStart);

  const thisMonthActive = thisMonth.filter(e => e.exerciseMinutes > 0);
  const lastMonthActive = lastMonth.filter(e => e.exerciseMinutes > 0);

  const currentStreak = computeStreak(byDate, now);
  const bestStreak = Math.max(prevBestStreak, currentStreak);

  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date));
  const sinceDate = sorted[0]?.date ?? toDateStr(now);

  return {
    updatedAt: now.toISOString(),

    today: {
      steps: today?.steps ?? 0,
      exerciseMinutes: today?.exerciseMinutes ?? 0,
      activeCalories: today?.activeCalories ?? 0,
      distanceMi: today?.distanceMi ?? 0,
      restingHeartRate: today?.restingHeartRate ?? null,
    },

    streak: { currentDays: currentStreak, bestDays: bestStreak },

    thisMonth: {
      activeDays: thisMonthActive.length,
      activeDaysDeltaVsLastMonth: thisMonthActive.length - lastMonthActive.length,
      distanceMi: Math.round(thisMonth.reduce((s, e) => s + e.distanceMi, 0) * 10) / 10,
      activeCalories: Math.round(thisMonth.reduce((s, e) => s + e.activeCalories, 0)),
      weeklyMinutes: weeklyMinutesForMonth(thisMonth),
    },

    thisYear: {
      distanceMi: Math.round(thisYear.reduce((s, e) => s + e.distanceMi, 0) * 10) / 10,
      activeDays: thisYear.filter(e => e.exerciseMinutes > 0).length,
    },

    allTime: {
      activeDays: log.filter(e => e.exerciseMinutes > 0).length,
      sinceDate,
    },

    heatmap: buildHeatmap(byDate, now),
  };
}

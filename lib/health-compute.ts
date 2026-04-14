import type { HealthSummary } from "./types";

export type RawWorkout = {
  type: string;
  durationMin: number;
  distanceMi: number | null;
  endedAt: string; // ISO timestamp
};

export type RawIngest = {
  steps: number;
  workouts: RawWorkout[];
};

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function computeStreak(workoutDates: Set<string>, now: Date): number {
  let streak = 0;
  const d = new Date(now);
  // if no workout today yet, start from yesterday
  if (!workoutDates.has(toDateStr(d))) d.setDate(d.getDate() - 1);
  while (workoutDates.has(toDateStr(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeIntensity(workouts: RawWorkout[]): number {
  if (workouts.length === 0) return 0;
  const totalMin = workouts.reduce((s, w) => s + w.durationMin, 0);
  if (workouts.length >= 2 || totalMin >= 90) return 4;
  if (totalMin >= 60) return 3;
  if (totalMin >= 30) return 2;
  return 1;
}

function buildHeatmap(byDate: Record<string, RawWorkout[]>, now: Date): HealthSummary["heatmap"] {
  const entries: HealthSummary["heatmap"] = [];
  const d = new Date(now);
  d.setDate(d.getDate() - 364);
  for (let i = 0; i < 365; i++) {
    const date = toDateStr(d);
    const day = byDate[date] ?? [];
    entries.push({ date, intensity: computeIntensity(day), primaryType: day[0]?.type ?? null });
    d.setDate(d.getDate() + 1);
  }
  return entries;
}

function weeklyBarsForMonth(workouts: RawWorkout[], now: Date): number[] {
  const bars = [0, 0, 0, 0];
  for (const w of workouts) {
    const day = new Date(w.endedAt).getDate() - 1; // 0-indexed
    bars[Math.min(Math.floor(day / 7), 3)]++;
  }
  return bars;
}

export function computeHealthSummary(raw: RawIngest, prevBestStreak: number): HealthSummary {
  const now = new Date();

  // sort newest first
  const sorted = [...raw.workouts].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
  );

  // group by date
  const byDate: Record<string, RawWorkout[]> = {};
  for (const w of sorted) {
    const date = toDateStr(new Date(w.endedAt));
    (byDate[date] ??= []).push(w);
  }
  const workoutDates = new Set(Object.keys(byDate));

  // streak
  const currentStreak = computeStreak(workoutDates, now);
  const bestStreak = Math.max(prevBestStreak, currentStreak);

  // month boundaries
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const ago90 = new Date(now); ago90.setDate(ago90.getDate() - 90);

  const thisMonth = sorted.filter(w => new Date(w.endedAt) >= thisMonthStart);
  const lastMonth = sorted.filter(w => {
    const d = new Date(w.endedAt);
    return d >= lastMonthStart && d < thisMonthStart;
  });
  const thisYear = sorted.filter(w => new Date(w.endedAt) >= thisYearStart);
  const last90 = sorted.filter(w => new Date(w.endedAt) >= ago90);

  const sportBreakdown: Record<string, number> = {};
  for (const w of thisMonth) sportBreakdown[w.type] = (sportBreakdown[w.type] ?? 0) + 1;

  const sportMix90d: Record<string, number> = {};
  for (const w of last90) sportMix90d[w.type] = (sportMix90d[w.type] ?? 0) + 1;

  const sinceDate = sorted.length > 0
    ? toDateStr(new Date(sorted[sorted.length - 1].endedAt))
    : toDateStr(now);

  return {
    updatedAt: now.toISOString(),

    today: {
      steps: raw.steps,
      lastWorkout: sorted[0]
        ? { type: sorted[0].type, durationMin: sorted[0].durationMin, endedAt: sorted[0].endedAt }
        : null,
    },

    streak: { currentDays: currentStreak, bestDays: bestStreak },

    thisMonth: {
      workouts: thisMonth.length,
      workoutsDeltaVsLastMonth: thisMonth.length - lastMonth.length,
      miles: Math.round(thisMonth.reduce((s, w) => s + (w.distanceMi ?? 0), 0) * 10) / 10,
      sportBreakdown,
      weeklyBars: weeklyBarsForMonth(thisMonth, now),
    },

    thisYear: {
      miles: Math.round(thisYear.reduce((s, w) => s + (w.distanceMi ?? 0), 0) * 10) / 10,
      workouts: thisYear.length,
    },

    allTime: {
      workouts: sorted.length,
      sinceDate,
    },

    heatmap: buildHeatmap(byDate, now),
    sportMix90d,

    recentWorkouts: sorted.slice(0, 5).map(w => ({
      type: w.type,
      durationMin: w.durationMin,
      distanceMi: w.distanceMi,
      endedAt: w.endedAt,
    })),
  };
}

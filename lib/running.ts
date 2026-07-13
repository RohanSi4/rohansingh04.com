import snapshot from "@/content/running-dashboard.json";
import { getHealthKV, getRunningDashboardKV } from "./kv-data";
import {
  genericActivityName,
  getStravaActivitiesKV,
  type StravaActivity,
} from "./strava";
import type { HealthSummary } from "./types";

export type RunningWeek = {
  weekStart: string;
  runMiles: number;
  runDays: number;
  longRunMiles: number;
  liftDays: number;
  qualityRuns: number;
  averageHeartRate: number | null;
  trainingLoad: number;
};

export type PublicRun = {
  id: string;
  date: string;
  surface: "outdoor" | "treadmill";
  distanceMi: number;
  movingMinutes: number;
  paceSecondsPerMile: number;
  averageHeartRate: number | null;
  elevationFeet: number | null;
  temperatureF: number | null;
  trainingLoad: number | null;
  aerobicDecouplingPct: number | null;
  easyZonePct: number | null;
};

export type PublicPlanDay = {
  date: string;
  dayLabel: string;
  text: string;
  isKeyDay: boolean;
};

export type PublicTrainingPlan = {
  heading: string;
  weekStart: string | null;
  weekEnd: string | null;
  prescribedMiles: number | null;
  days: PublicPlanDay[];
};

export function getPlanWeekDays(plan: PublicTrainingPlan): PublicPlanDay[] {
  const uniqueDays = new Map<string, PublicPlanDay>();
  for (const day of plan.days) {
    if (plan.weekStart && day.date < plan.weekStart) continue;
    if (plan.weekEnd && day.date > plan.weekEnd) continue;
    uniqueDays.set(day.date, day);
  }
  return [...uniqueDays.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type RunningMonth = {
  month: string;
  runMiles: number;
  runs: number;
  longestRunMiles: number;
};

export type RunningYear = {
  year: string;
  runMiles: number;
  runs: number;
  runDays: number;
  longestRunMiles: number;
  activities: number;
};

export type RunningDashboard = {
  schemaVersion: number;
  generatedAt: string;
  dataThrough: string;
  race: {
    name: string;
    date: string;
    distanceMi: number;
    goalTime: string;
    goalPace: string;
    trainingStart: string;
  };
  totals: {
    runMiles: number;
    totalRuns: number;
    runDays: number;
    activeWeeks: number;
    trackedSince: string;
    longestRunMiles: number;
    longestRunDate: string;
    peakWeekMiles: number;
    peakWeekStart: string;
    totalActivities: number;
  };
  currentWeek: RunningWeek;
  recentFourWeekMiles: number;
  weeks: RunningWeek[];
  monthlyHistory: RunningMonth[];
  yearlyHistory: RunningYear[];
  recentRuns: PublicRun[];
  trainingPlan: PublicTrainingPlan | null;
  health: HealthSummary;
};

export function getStaticRunningDashboard(): RunningDashboard {
  return snapshot as unknown as RunningDashboard;
}

function sanitizeHealthActivityNames(summary: HealthSummary): HealthSummary {
  return {
    ...summary,
    lastActivity: summary.lastActivity
      ? {
          ...summary.lastActivity,
          name: genericActivityName(summary.lastActivity.sport),
        }
      : null,
    recentActivities: summary.recentActivities.map((activity) => ({
      ...activity,
      name: genericActivityName(activity.sport),
    })),
  };
}

/**
 * Prefer fresh rolling health fields without replacing lifetime history with
 * Strava's deliberately bounded 365-day cache.
 */
export function mergeLiveHealth(
  archive: HealthSummary,
  live: HealthSummary,
): HealthSummary {
  const safeLive = sanitizeHealthActivityNames(live);
  const archiveCutoff = archive.lastActivity?.date ?? archive.allTime.sinceDate;
  const newActiveDates = new Set(
    safeLive.heatmap
      .filter((entry) => entry.date > archiveCutoff && entry.exerciseMinutes > 0)
      .map((entry) => entry.date),
  );

  return {
    ...safeLive,
    streak: {
      currentDays: safeLive.streak.currentDays,
      bestDays: Math.max(archive.streak.bestDays, safeLive.streak.bestDays),
    },
    allTime: {
      activeDays: Math.max(
        safeLive.allTime.activeDays,
        archive.allTime.activeDays + newActiveDates.size,
      ),
      sinceDate: archive.allTime.sinceDate < safeLive.allTime.sinceDate
        ? archive.allTime.sinceDate
        : safeLive.allTime.sinceDate,
    },
  };
}

function dateKey(activity: StravaActivity): string {
  return `${activity.date}-${activity.distanceMi.toFixed(1)}`;
}

function mondayFor(date: string): string {
  const value = new Date(`${date}T12:00:00Z`);
  const offset = (value.getUTCDay() + 6) % 7;
  value.setUTCDate(value.getUTCDate() - offset);
  return value.toISOString().slice(0, 10);
}

function stravaRun(activity: StravaActivity): PublicRun {
  const seconds = activity.distanceMi > 0
    ? Math.round((activity.movingMins * 60) / activity.distanceMi)
    : 0;
  return {
    id: `live-${activity.id}`,
    date: activity.date,
    surface: "outdoor",
    distanceMi: activity.distanceMi,
    movingMinutes: activity.movingMins,
    paceSecondsPerMile: seconds,
    averageHeartRate: activity.avgHR,
    elevationFeet: null,
    temperatureF: null,
    trainingLoad: null,
    aerobicDecouplingPct: null,
    easyZonePct: null,
  };
}

/** Add any runs that arrived through the daily Strava sync after the rich FIT snapshot. */
export function mergeLiveRuns(
  dashboard: RunningDashboard,
  activities: StravaActivity[],
): RunningDashboard {
  const newActivities = activities
    .filter((activity) => activity.sport === "Run" && activity.date > dashboard.dataThrough)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (newActivities.length === 0) return dashboard;

  const additions = newActivities.map(stravaRun);
  const known = new Set(dashboard.recentRuns.map((run) => `${run.date}-${run.distanceMi.toFixed(1)}`));
  const uniqueAdditions = additions.filter((run, index) => {
    const key = dateKey(newActivities[index]);
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
  if (uniqueAdditions.length === 0) return dashboard;

  const weeks = dashboard.weeks.map((week) => ({ ...week }));
  const existingWeekStarts = new Set(weeks.map((week) => week.weekStart));
  const addedDatesByWeek = new Map<string, Set<string>>();
  for (const run of uniqueAdditions) {
    const weekStart = mondayFor(run.date);
    let week = weeks.find((entry) => entry.weekStart === weekStart);
    if (!week) {
      week = {
        weekStart,
        runMiles: 0,
        runDays: 0,
        longRunMiles: 0,
        liftDays: 0,
        qualityRuns: 0,
        averageHeartRate: null,
        trainingLoad: 0,
      };
      weeks.push(week);
    }
    const addedDates = addedDatesByWeek.get(weekStart) ?? new Set<string>();
    week.runMiles = Math.round((week.runMiles + run.distanceMi) * 10) / 10;
    if (!addedDates.has(run.date)) week.runDays += 1;
    addedDates.add(run.date);
    addedDatesByWeek.set(weekStart, addedDates);
    week.longRunMiles = Math.max(week.longRunMiles, run.distanceMi);
  }
  weeks.sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  const recentRuns = [...uniqueAdditions, ...dashboard.recentRuns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
  const runMiles = uniqueAdditions.reduce((sum, run) => sum + run.distanceMi, 0);
  const addedRunDates = new Set(uniqueAdditions.map((run) => run.date));
  const latestDate = recentRuns[0].date;
  const currentWeek = weeks.at(-1)!;
  const longestAddition = [...uniqueAdditions].sort((a, b) => b.distanceMi - a.distanceMi)[0];
  const monthlyHistory = dashboard.monthlyHistory.map((month) => ({ ...month }));
  const yearlyHistory = dashboard.yearlyHistory.map((year) => ({ ...year }));
  for (const run of uniqueAdditions) {
    const monthKey = run.date.slice(0, 7);
    let month = monthlyHistory.find((entry) => entry.month === monthKey);
    if (!month) {
      month = { month: monthKey, runMiles: 0, runs: 0, longestRunMiles: 0 };
      monthlyHistory.push(month);
    }
    month.runMiles = Math.round((month.runMiles + run.distanceMi) * 10) / 10;
    month.runs += 1;
    month.longestRunMiles = Math.max(month.longestRunMiles, run.distanceMi);

    const yearKey = run.date.slice(0, 4);
    let year = yearlyHistory.find((entry) => entry.year === yearKey);
    if (!year) {
      year = { year: yearKey, runMiles: 0, runs: 0, runDays: 0, longestRunMiles: 0, activities: 0 };
      yearlyHistory.push(year);
    }
    year.runMiles = Math.round((year.runMiles + run.distanceMi) * 10) / 10;
    year.runs += 1;
    year.longestRunMiles = Math.max(year.longestRunMiles, run.distanceMi);
    year.activities += 1;
  }
  for (const date of addedRunDates) {
    const year = yearlyHistory.find((entry) => entry.year === date.slice(0, 4));
    if (year) year.runDays += 1;
  }
  monthlyHistory.sort((a, b) => a.month.localeCompare(b.month));
  yearlyHistory.sort((a, b) => a.year.localeCompare(b.year));
  const newPeak = [...weeks].sort((a, b) => b.runMiles - a.runMiles)[0];

  return {
    ...dashboard,
    dataThrough: latestDate,
    totals: {
      ...dashboard.totals,
      runMiles: Math.round((dashboard.totals.runMiles + runMiles) * 10) / 10,
      totalRuns: dashboard.totals.totalRuns + uniqueAdditions.length,
      runDays: dashboard.totals.runDays + addedRunDates.size,
      activeWeeks: dashboard.totals.activeWeeks
        + [...addedDatesByWeek.keys()].filter((week) => !existingWeekStarts.has(week)).length,
      longestRunMiles: Math.max(
        dashboard.totals.longestRunMiles,
        ...uniqueAdditions.map((run) => run.distanceMi),
      ),
      longestRunDate: longestAddition.distanceMi > dashboard.totals.longestRunMiles
        ? longestAddition.date
        : dashboard.totals.longestRunDate,
      peakWeekMiles: Math.max(dashboard.totals.peakWeekMiles, newPeak.runMiles),
      peakWeekStart: newPeak.runMiles > dashboard.totals.peakWeekMiles
        ? newPeak.weekStart
        : dashboard.totals.peakWeekStart,
    },
    currentWeek,
    recentFourWeekMiles: Math.round(
      weeks.slice(-4).reduce((sum, week) => sum + week.runMiles, 0) * 10,
    ) / 10,
    weeks,
    monthlyHistory,
    yearlyHistory,
    recentRuns,
  };
}

export async function getRunningDashboard(): Promise<RunningDashboard> {
  const fallback = getStaticRunningDashboard();
  const [storedResult, healthResult, activitiesResult] = await Promise.allSettled([
    getRunningDashboardKV(),
    getHealthKV(),
    getStravaActivitiesKV(),
  ]);
  const stored = storedResult.status === "fulfilled" ? storedResult.value : null;
  const source = stored?.schemaVersion === 2 ? stored : fallback;
  const base = { ...source, health: sanitizeHealthActivityNames(source.health) };
  const health = healthResult.status === "fulfilled" ? healthResult.value : null;
  const withHealth = health && health.updatedAt > base.health.updatedAt
    ? { ...base, health: mergeLiveHealth(base.health, health) }
    : base;
  return mergeLiveRuns(
    withHealth,
    activitiesResult.status === "fulfilled" ? activitiesResult.value : [],
  );
}

export function formatPace(totalSeconds: number): string {
  const roundedSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRunDate(date: string, includeYear = false): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function fitnessTimeZone(date: Date = new Date()): string {
  return date < new Date("2026-08-29T19:00:00.000Z")
    ? "America/Los_Angeles"
    : "America/New_York";
}

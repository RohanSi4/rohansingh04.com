import snapshot from "@/content/running-dashboard.json";

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
  elevationFeet: number;
  temperatureF: number | null;
  trainingLoad: number | null;
  aerobicDecouplingPct: number | null;
  easyZonePct: number | null;
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
  };
  totals: {
    runMiles: number;
    runDays: number;
    activeWeeks: number;
    longestRunMiles: number;
    longestRunDate: string;
    peakWeekMiles: number;
    peakWeekStart: string;
  };
  currentWeek: RunningWeek;
  recentFourWeekMiles: number;
  weeks: RunningWeek[];
  recentRuns: PublicRun[];
};

export function getRunningDashboard(): RunningDashboard {
  return snapshot as unknown as RunningDashboard;
}

export function formatPace(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
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

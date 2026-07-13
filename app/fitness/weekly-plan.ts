import type { PublicPlanDay } from "@/lib/running";
import type { HealthSummary } from "@/lib/types";

type HealthActivity = HealthSummary["recentActivities"][number];

export type WeekPlanTask = {
  id: string;
  text: string;
  actual: string | null;
  trackable: boolean;
  isExtra: boolean;
};

export type WeekPlanRow = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  isPast: boolean;
  isKeyDay: boolean;
  runTasks: WeekPlanTask[];
  otherTasks: WeekPlanTask[];
};

type TaskSpec = {
  column: "run" | "other";
  sports: string[];
};

function cleanTask(value: string): string {
  return value.trim().replace(/[.;]+$/, "");
}

function taskSpec(text: string): TaskSpec {
  const value = text.toLowerCase();
  if (/upper body lift|lower body lift|strength training|\blift\b/.test(value)) {
    return { column: "other", sports: ["WeightTraining"] };
  }
  if (/\b(run|miles|strides)\b|^rest\b/.test(value)) {
    return {
      column: "run",
      sports: /^rest\b/.test(value) || value.includes("strides") ? [] : ["Run"],
    };
  }
  if (value.includes("walk") || value.includes("golf")) {
    return {
      column: "other",
      sports: [
        ...(value.includes("walk") ? ["Walk"] : []),
        ...(value.includes("golf") ? ["Golf"] : []),
      ],
    };
  }
  if (value.includes("basketball")) return { column: "other", sports: ["Basketball"] };
  if (/\b(ride|bike|cycling)\b/.test(value)) return { column: "other", sports: ["Ride"] };
  if (value.includes("swim")) return { column: "other", sports: ["Swim"] };
  if (value.includes("hike")) return { column: "other", sports: ["Hike"] };
  if (value.includes("circuit")) return { column: "other", sports: ["WeightTraining", "Workout"] };
  return { column: "other", sports: [] };
}

function actualText(sports: string[], activities: HealthActivity[]): string | null {
  const matches = activities.filter((activity) => sports.includes(activity.sport));
  if (matches.length === 0) return null;
  const minutes = matches.reduce((sum, activity) => sum + activity.movingMins, 0);
  const distance = matches.reduce((sum, activity) => sum + activity.distanceMi, 0);
  if (sports.includes("Run")) return `${distance.toFixed(1)} mi · ${minutes} min`;
  return `${minutes} min`;
}

function activityLabel(sport: string): string {
  const labels: Record<string, string> = {
    Run: "extra run",
    WeightTraining: "strength training",
    Workout: "workout",
    Walk: "walk",
    Golf: "golf",
    Basketball: "basketball",
    Ride: "ride",
    Swim: "swim",
    Hike: "hike",
  };
  return labels[sport] ?? sport.toLowerCase();
}

export function buildWeekPlanRows(
  days: PublicPlanDay[],
  activities: HealthActivity[],
  today: string,
): WeekPlanRow[] {
  return days.map((day) => {
    const dayActivities = activities.filter((activity) => activity.date === day.date);
    const usedSports = new Set<string>();
    const runTasks: WeekPlanTask[] = [];
    const otherTasks: WeekPlanTask[] = [];

    day.text.split(/\s+\+\s+/).map(cleanTask).filter(Boolean).forEach((text, index) => {
      const spec = taskSpec(text);
      const actual = actualText(spec.sports, dayActivities);
      if (actual) spec.sports.forEach((sport) => usedSports.add(sport));
      const task = {
        id: `${day.date}:${spec.column}:${index}`,
        text,
        actual,
        trackable: spec.sports.length > 0,
        isExtra: false,
      };
      (spec.column === "run" ? runTasks : otherTasks).push(task);
    });

    const unmatchedBySport = new Map<string, HealthActivity[]>();
    for (const activity of dayActivities) {
      if (usedSports.has(activity.sport)) continue;
      const bucket = unmatchedBySport.get(activity.sport) ?? [];
      bucket.push(activity);
      unmatchedBySport.set(activity.sport, bucket);
    }
    for (const [sport, extras] of unmatchedBySport) {
      const task = {
        id: `${day.date}:actual:${sport}`,
        text: activityLabel(sport),
        actual: actualText([sport], extras),
        trackable: true,
        isExtra: true,
      };
      (sport === "Run" ? runTasks : otherTasks).push(task);
    }

    return {
      date: day.date,
      dayLabel: day.dayLabel,
      isToday: day.date === today,
      isPast: day.date < today,
      isKeyDay: day.isKeyDay,
      runTasks,
      otherTasks,
    };
  });
}

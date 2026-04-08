import type { HealthSummary } from "./types";

const WORKOUT_TYPES = [
  "Traditional Strength Training",
  "Outdoor Run",
  "Indoor Run",
  "Soccer",
  "Tennis",
  "Outdoor Walk",
] as const;

// deterministic "random" based on day index -- keeps the heatmap stable
// across renders without needing a seed library
function dayHash(i: number): number {
  let h = i * 2654435761;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  return Math.abs((h >> 16) ^ h);
}

function buildHeatmap(): HealthSummary["heatmap"] {
  // anchor to a fixed date so the mock doesn't shift on every render
  const today = new Date("2026-04-08");
  const entries: HealthSummary["heatmap"] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const dow = d.getDay(); // 0=Sun 6=Sat
    const h = dayHash(i);

    // rest days: sunday ~60% of the time, occasional other rest
    const isRest = (dow === 0 && h % 5 < 3) || (dow !== 0 && h % 11 === 0);

    if (isRest) {
      entries.push({ date, intensity: 0, primaryType: null });
    } else {
      // heavier on Mon/Wed/Fri (lift days), lighter on Tue/Thu/Sat (cardio/sport)
      const baseIntensity = dow === 1 || dow === 3 || dow === 5 ? 3 : 2;
      // occasionally peak (4) or light (1)
      const intensity = h % 7 === 0 ? 4 : h % 9 === 0 ? 1 : baseIntensity;
      const primaryType = WORKOUT_TYPES[(h + dow) % WORKOUT_TYPES.length];
      entries.push({ date, intensity, primaryType });
    }
  }

  return entries;
}

export const healthMock: HealthSummary = {
  updatedAt: "2026-04-08T09:22:00Z",

  today: {
    steps: 8431,
    lastWorkout: {
      type: "Traditional Strength Training",
      durationMin: 62,
      endedAt: "2026-04-08T09:15:00Z",
    },
  },

  streak: {
    currentDays: 12,
    bestDays: 34,
  },

  thisMonth: {
    workouts: 18,
    workoutsDeltaVsLastMonth: 2,
    miles: 31.4,
    sportBreakdown: {
      "Traditional Strength Training": 10,
      "Outdoor Run": 5,
      "Soccer": 2,
      "Tennis": 1,
    },
    // week 1-4 of april 2026
    weeklyBars: [5, 5, 4, 4],
  },

  thisYear: {
    miles: 187.6,
    workouts: 94,
  },

  allTime: {
    workouts: 412,
    sinceDate: "2023-11-01",
  },

  heatmap: buildHeatmap(),

  sportMix90d: {
    "Traditional Strength Training": 38,
    "Outdoor Run": 16,
    "Indoor Run": 7,
    "Soccer": 6,
    "Tennis": 4,
    "Outdoor Walk": 3,
  },

  recentWorkouts: [
    {
      type: "Traditional Strength Training",
      durationMin: 62,
      distanceMi: null,
      endedAt: "2026-04-08T09:15:00Z",
    },
    {
      type: "Outdoor Run",
      durationMin: 38,
      distanceMi: 4.2,
      endedAt: "2026-04-06T07:45:00Z",
    },
    {
      type: "Traditional Strength Training",
      durationMin: 55,
      distanceMi: null,
      endedAt: "2026-04-04T10:00:00Z",
    },
    {
      type: "Soccer",
      durationMin: 75,
      distanceMi: null,
      endedAt: "2026-04-02T18:30:00Z",
    },
    {
      type: "Traditional Strength Training",
      durationMin: 58,
      distanceMi: null,
      endedAt: "2026-03-31T09:30:00Z",
    },
  ],
};

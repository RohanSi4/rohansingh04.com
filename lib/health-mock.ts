import type { HealthSummary } from "./types";

function buildHeatmap(): HealthSummary["heatmap"] {
  const today = new Date("2026-04-14");
  const entries: HealthSummary["heatmap"] = [];

  function dayHash(i: number): number {
    let h = i * 2654435761;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    h = ((h >> 16) ^ h) * 0x45d9f3b;
    return Math.abs((h >> 16) ^ h);
  }

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const dow = d.getDay();
    const h = dayHash(i);

    const isRest = (dow === 0 && h % 5 < 3) || (dow !== 0 && h % 11 === 0);

    if (isRest) {
      entries.push({ date, intensity: 0, exerciseMinutes: 0, sport: null, distanceMi: 0 });
    } else {
      const base = dow === 1 || dow === 3 || dow === 5 ? 3 : 2;
      const intensity = h % 7 === 0 ? 4 : h % 9 === 0 ? 1 : base;
      const mins = [0, 15, 30, 50, 75][intensity];
      const sport = h % 3 === 0 ? "Ride" : "Run";
      const distanceMi = sport === "Run" ? Math.round((mins / 10) * 10) / 10 : Math.round((mins / 4) * 10) / 10;
      entries.push({ date, intensity, exerciseMinutes: mins, sport, distanceMi });
    }
  }

  return entries;
}

export const healthMock: HealthSummary = {
  updatedAt: "2026-04-14T09:22:00Z",

  today: {
    exerciseMinutes: 52,
    activeCalories: 480,
    distanceMi: 3.1,
    sport: "Run",
  },

  lastActivity: {
    date: "2026-04-14",
    sport: "Run",
    name: "morning run",
    movingMins: 52,
    distanceMi: 3.1,
  },

  streak: {
    currentDays: 12,
    bestDays: 34,
  },

  thisMonth: {
    activeDays: 11,
    activeDaysDeltaVsLastMonth: 2,
    distanceMi: 31.4,
    activeCalories: 5200,
    weeklyMinutes: [210, 195, 180, 160],
  },

  thisYear: {
    distanceMi: 187.6,
    activeDays: 94,
  },

  allTime: {
    activeDays: 412,
    sinceDate: "2023-11-01",
  },

  recentActivities: [
    { date: "2026-04-14", sport: "Run", name: "morning run", movingMins: 52, distanceMi: 3.1, calories: 480, averageHeartRate: 142 },
    { date: "2026-04-13", sport: "Ride", name: "sunday spin", movingMins: 48, distanceMi: 12.4, calories: 410, averageHeartRate: 131 },
    { date: "2026-04-12", sport: "Run", name: "easy 5k", movingMins: 31, distanceMi: 3.1, calories: 302, averageHeartRate: 138 },
    { date: "2026-04-11", sport: "WeightTraining", name: "upper body", movingMins: 45, distanceMi: 0, calories: 265, averageHeartRate: 106 },
    { date: "2026-04-10", sport: "Run", name: "tempo run", movingMins: 38, distanceMi: 4.2, calories: 388, averageHeartRate: 157 },
    { date: "2026-04-09", sport: "Ride", name: "afternoon ride", movingMins: 62, distanceMi: 16.1, calories: 530, averageHeartRate: 136 },
    { date: "2026-04-08", sport: "Run", name: "morning run", movingMins: 29, distanceMi: 3.0, calories: 286, averageHeartRate: 145 },
  ],

  heatmap: buildHeatmap(),
};

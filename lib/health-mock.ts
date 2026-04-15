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
      entries.push({ date, intensity: 0, exerciseMinutes: 0 });
    } else {
      const base = dow === 1 || dow === 3 || dow === 5 ? 3 : 2;
      const intensity = h % 7 === 0 ? 4 : h % 9 === 0 ? 1 : base;
      const mins = [0, 15, 30, 50, 75][intensity];
      entries.push({ date, intensity, exerciseMinutes: mins });
    }
  }

  return entries;
}

export const healthMock: HealthSummary = {
  updatedAt: "2026-04-14T09:22:00Z",

  today: {
    steps: 8431,
    exerciseMinutes: 52,
    activeCalories: 480,
    distanceMi: 3.1,
    restingHeartRate: 58,
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

  heatmap: buildHeatmap(),
};

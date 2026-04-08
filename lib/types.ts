export type HealthSummary = {
  updatedAt: string; // ISO timestamp

  today: {
    steps: number;
    lastWorkout: {
      type: string;       // e.g. "Traditional Strength Training"
      durationMin: number;
      endedAt: string;    // ISO timestamp
    } | null;
  };

  streak: {
    currentDays: number;
    bestDays: number;
  };

  thisMonth: {
    workouts: number;
    workoutsDeltaVsLastMonth: number; // signed integer
    miles: number;
    sportBreakdown: Record<string, number>; // e.g. { "Lift": 12, "Run": 4 }
    weeklyBars: number[];               // workouts per week, length 4 or 5
  };

  thisYear: {
    miles: number;
    workouts: number;
  };

  allTime: {
    workouts: number;
    sinceDate: string; // ISO date -- Nov 2023 for rohan
  };

  // exactly 365 entries, ordered oldest to newest
  heatmap: Array<{
    date: string;         // YYYY-MM-DD
    intensity: number;    // 0-4, github style (0 = rest, 4 = max effort)
    primaryType: string | null;
  }>;

  sportMix90d: Record<string, number>; // sport -> workout count

  recentWorkouts: Array<{
    type: string;
    durationMin: number;
    distanceMi: number | null;
    endedAt: string; // ISO timestamp
  }>; // last 5

  // future fields -- not in v1. shortcut won't send them, components won't
  // render them. defined here so adding them later requires no schema migration.
  restingHeartRate?: number; // bpm
  vo2Max?: number;           // mL/kg/min
};

// project meta.json shape
export type ProjectMeta = {
  slug: string;
  title: string;
  tagline: string;
  tags: string[];
  startDate: string; // YYYY-MM
  endDate: string | null;
  status: "shipped" | "in-progress" | "archived";
  featured: boolean;
  githubUrl: string | null;
  liveUrl: string | null;
  subProjects: string[];
};

// history.json entry shape
export type HistoryEntry = {
  id: string;
  type: "work" | "school" | "project" | "milestone";
  title: string;
  org: string;
  startDate: string; // YYYY-MM
  endDate: string | null;
  location: string;
  summary: string;
};

// places.json entry shape
export type Place = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  visitedDate: string; // YYYY-MM
  notes: string;
  photos: string[];
  tripSlug: string | null;
  _needsDate?: true;
};

// states.json entry shape
export type StateEntry = {
  code: string;
  name: string;
  visited: boolean;
  isHome?: boolean;
  notes?: string;
  cities?: string[];
  photos?: string[];
  visitedDate?: string | null;
};

// site-config.json shape
export type SiteConfig = {
  currentRole: { title: string; org: string };
  currentLocation: string;
  currentFocus: string;
  graduationDate: string; // YYYY-MM
};

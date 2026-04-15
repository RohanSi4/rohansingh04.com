export type HealthSummary = {
  updatedAt: string; // ISO timestamp

  today: {
    steps: number;
    exerciseMinutes: number;
    activeCalories: number;
    distanceMi: number;
    restingHeartRate: number | null;
  };

  streak: {
    currentDays: number;
    bestDays: number;
  };

  thisMonth: {
    activeDays: number;
    activeDaysDeltaVsLastMonth: number;
    distanceMi: number;
    activeCalories: number;
    weeklyMinutes: number[]; // exercise minutes per week, length 4
  };

  thisYear: {
    distanceMi: number;
    activeDays: number;
  };

  allTime: {
    activeDays: number;
    sinceDate: string;
  };

  // exactly 365 entries, ordered oldest to newest
  heatmap: Array<{
    date: string;          // YYYY-MM-DD
    intensity: number;     // 0-4 based on exercise minutes
    exerciseMinutes: number;
  }>;
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

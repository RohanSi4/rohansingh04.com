export type HealthSummary = {
  updatedAt: string; // ISO timestamp

  today: {
    exerciseMinutes: number;
    activeCalories: number;
    distanceMi: number;
    sport: string | null;
  };

  lastActivity: {
    date: string;
    sport: string;
    name: string;
    movingMins: number;
    distanceMi: number;
  } | null;

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

  // last 15 activities, newest first
  recentActivities: Array<{
    date: string;
    sport: string;
    name: string;
    movingMins: number;
    distanceMi: number;
    calories?: number;
    averageHeartRate?: number | null;
  }>;

  // exactly 365 entries, ordered oldest to newest
  heatmap: Array<{
    date: string;          // YYYY-MM-DD
    intensity: number;     // 0-4 based on exercise minutes
    exerciseMinutes: number;
    sport: string | null;  // primary sport for the day
    distanceMi: number;
  }>;
};

// project meta.json shape
export type ProjectMeta = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  outcome: string;
  role: string;
  proofPoints: string[];
  visual: "fitness" | "ranking" | "site" | "music" | "health";
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
  bullets?: string[];
};

// places.json entry shape
export type Place = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  visitedDate: string | null; // YYYY-MM when known
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

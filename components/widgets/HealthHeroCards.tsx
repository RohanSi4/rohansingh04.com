import type { HealthSummary } from "@/lib/types";
import { formatDate } from "@/lib/dates";

interface Props {
  data: HealthSummary;
}

// furthest city from Charlottesville the year's mileage has "reached"
const DESTINATIONS = [
  { city: "richmond, va", miles: 70 },
  { city: "washington, dc", miles: 120 },
  { city: "baltimore, md", miles: 145 },
  { city: "philadelphia, pa", miles: 240 },
  { city: "pittsburgh, pa", miles: 290 },
  { city: "new york city", miles: 380 },
  { city: "boston, ma", miles: 610 },
  { city: "chicago, il", miles: 770 },
];

function getCityEquivalent(miles: number): string {
  let best: (typeof DESTINATIONS)[number] | null = null;
  for (const d of DESTINATIONS) {
    if (miles >= d.miles) best = d;
  }
  return best ? `cville → ${best.city}` : "getting there";
}

interface CardProps {
  label: string;
  value: string;
  sub: string;
  delta?: number; // signed, shown as +2 or -1
}

function StatCard({ label, value, sub, delta }: CardProps) {
  return (
    <div className="border border-border rounded-lg p-4 bg-surface">
      <p className="text-xs uppercase tracking-widest text-muted mb-2">{label}</p>
      <p className="text-3xl font-mono font-medium text-fg leading-none">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-xs text-muted">{sub}</p>
        {delta !== undefined && delta !== 0 && (
          <span
            className={`text-xs font-mono ${
              delta > 0 ? "text-accent" : "text-muted"
            }`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HealthHeroCards({ data }: Props) {
  const { thisMonth, thisYear, allTime, streak } = data;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <StatCard
        label="this month"
        value={String(thisMonth.workouts)}
        sub="workouts"
        delta={thisMonth.workoutsDeltaVsLastMonth}
      />
      <StatCard
        label="this year"
        value={thisYear.miles.toFixed(1)}
        sub={getCityEquivalent(thisYear.miles)}
      />
      <StatCard
        label="all time"
        value={String(allTime.workouts)}
        sub={`since ${formatDate(allTime.sinceDate)}`}
      />
      <StatCard
        label="streak"
        value={`${streak.currentDays}d`}
        sub={`best: ${streak.bestDays} days`}
      />
    </div>
  );
}

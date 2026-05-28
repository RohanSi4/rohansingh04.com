import type { HealthSummary } from "@/lib/types";

interface Props {
  activities: HealthSummary["recentActivities"];
}

const SPORT_ABBR: Record<string, string> = {
  Run: "run",
  Ride: "ride",
  Swim: "swim",
  Hike: "hike",
  Walk: "walk",
  WeightTraining: "lift",
  Yoga: "yoga",
  Workout: "wkt",
  VirtualRide: "v-ride",
  EBikeRide: "ebike",
  Rowing: "row",
  Elliptical: "ellip",
  StairStepper: "stairs",
};

const SPORT_COLOR: Record<string, string> = {
  Run: "text-accent",
  Ride: "text-blue-400",
  Swim: "text-cyan-400",
  Hike: "text-emerald-400",
  Walk: "text-green-300",
  WeightTraining: "text-purple-400",
  Yoga: "text-pink-300",
  Workout: "text-orange-400",
  VirtualRide: "text-blue-300",
  EBikeRide: "text-blue-300",
  Rowing: "text-teal-400",
};

const MONTH = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

function formatActivityDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return `${MONTH[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export default function HealthActivityFeed({ activities }: Props) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
        recent activity
      </h2>
      <div className="space-y-0 border border-border rounded-lg overflow-hidden">
        {activities.map((a, i) => {
          const abbr = SPORT_ABBR[a.sport] ?? a.sport.toLowerCase();
          const color = SPORT_COLOR[a.sport] ?? "text-muted";
          return (
            <div
              key={`${a.date}-${i}`}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
            >
              <span className="text-muted w-12 shrink-0">{formatActivityDate(a.date)}</span>
              <span className={`w-10 shrink-0 ${color}`}>{abbr}</span>
              <span className="text-fg flex-1 truncate font-sans">{a.name.toLowerCase()}</span>
              <div className="flex items-center gap-3 shrink-0 text-muted">
                {a.distanceMi > 0 && (
                  <span>{a.distanceMi.toFixed(1)} mi</span>
                )}
                <span>{a.movingMins}m</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

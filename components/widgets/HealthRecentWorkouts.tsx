import type { HealthSummary } from "@/lib/types";
import { relativeTime } from "@/lib/dates";

interface Props {
  workouts: HealthSummary["recentWorkouts"];
}

export default function HealthRecentWorkouts({ workouts }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
        recent workouts
      </h2>
      <ul className="divide-y divide-border">
        {workouts.map((w, i) => (
          <li key={i} className="flex items-center justify-between py-2.5 gap-4">
            <span className="text-sm text-fg truncate">
              {w.type.toLowerCase()}
            </span>
            <span className="flex items-center gap-3 text-xs text-muted font-mono shrink-0">
              {w.distanceMi !== null && (
                <span>{w.distanceMi.toFixed(1)} mi</span>
              )}
              <span>{w.durationMin}m</span>
              <span>{relativeTime(w.endedAt)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

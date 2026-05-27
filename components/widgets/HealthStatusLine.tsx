import type { HealthSummary } from "@/lib/types";

interface Props {
  data: HealthSummary;
}

function sportLabel(sport: string): string {
  const map: Record<string, string> = {
    Run: "run", Ride: "ride", Swim: "swim", Hike: "hike", Walk: "walk",
    WeightTraining: "weights", Yoga: "yoga", Workout: "workout",
    VirtualRide: "virtual ride", EBikeRide: "ebike", Rowing: "row",
    Elliptical: "elliptical", StairStepper: "stairs",
  };
  return map[sport] ?? sport.toLowerCase();
}

export default function HealthStatusLine({ data }: Props) {
  const { today, lastActivity, streak } = data;
  const parts: string[] = [];

  if (today.sport) {
    parts.push(sportLabel(today.sport));
  } else if (lastActivity) {
    const daysAgo = Math.round(
      (Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    parts.push(daysAgo === 0 ? sportLabel(lastActivity.sport) : `last: ${sportLabel(lastActivity.sport)} ${daysAgo}d ago`);
  }

  if (today.exerciseMinutes > 0) {
    parts.push(`${today.exerciseMinutes} min`);
  }

  if (today.distanceMi > 0) {
    parts.push(`${today.distanceMi.toFixed(1)} mi`);
  }

  if (streak.currentDays > 0) {
    parts.push(`${streak.currentDays}-day streak`);
  }

  const label = today.sport ? "today" : "recent";

  return (
    <p className="text-sm text-muted font-mono mb-8">
      <span className="text-fg">{label}</span>
      {parts.map((part) => (
        <span key={part}>
          <span className="mx-2 select-none">·</span>
          {part}
        </span>
      ))}
    </p>
  );
}

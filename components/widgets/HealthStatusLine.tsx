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

  const todayStr = new Date().toISOString().split("T")[0];
  const todayIsActive = today.sport != null;

  if (todayIsActive) {
    // show actual activity name if last activity was today
    const activityName =
      lastActivity && lastActivity.date === todayStr
        ? lastActivity.name.toLowerCase()
        : sportLabel(today.sport!);
    parts.push(activityName);
    if (today.exerciseMinutes > 0) parts.push(`${today.exerciseMinutes} min`);
    if (today.distanceMi > 0) parts.push(`${today.distanceMi.toFixed(1)} mi`);
  } else if (lastActivity) {
    const daysAgo = Math.round(
      (Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const sportStr = sportLabel(lastActivity.sport);
    parts.push(
      daysAgo === 0
        ? lastActivity.name.toLowerCase()
        : `last: ${sportStr} ${daysAgo}d ago`
    );
  }

  if (streak.currentDays > 0) {
    parts.push(`${streak.currentDays}-day streak`);
  }

  const label = todayIsActive ? "today" : "recent";

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

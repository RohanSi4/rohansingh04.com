import type { HealthSummary } from "@/lib/types";
import { formatSteps, relativeTime } from "@/lib/dates";

interface Props {
  data: HealthSummary;
}

export default function HealthStatusLine({ data }: Props) {
  const { today, streak } = data;
  const steps = formatSteps(today.steps);

  const parts: string[] = [`${steps} steps`];

  if (today.lastWorkout) {
    const type = today.lastWorkout.type.toLowerCase();
    const ago = relativeTime(today.lastWorkout.endedAt);
    parts.push(`last workout: ${type}, ${ago}`);
  }

  if (streak.currentDays > 0) {
    parts.push(`${streak.currentDays}-day streak`);
  }

  return (
    <p className="text-sm text-muted font-mono mb-8">
      <span className="text-fg">today</span>
      {parts.map((part) => (
        <span key={part}>
          <span className="mx-2 select-none">·</span>
          {part}
        </span>
      ))}
    </p>
  );
}

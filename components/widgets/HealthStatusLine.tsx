import type { HealthSummary } from "@/lib/types";
import { formatSteps } from "@/lib/dates";

interface Props {
  data: HealthSummary;
}

export default function HealthStatusLine({ data }: Props) {
  const { today, streak } = data;
  const parts: string[] = [`${formatSteps(today.steps)} steps`];

  if (today.exerciseMinutes > 0) {
    parts.push(`${today.exerciseMinutes} min active`);
  }

  if (today.restingHeartRate) {
    parts.push(`${today.restingHeartRate} bpm resting`);
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

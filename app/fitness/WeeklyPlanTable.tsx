"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WeekPlanRow, WeekPlanTask } from "./weekly-plan";
import styles from "./fitness.module.css";

type WeeklyPlanTableProps = {
  weekKey: string;
  range: string;
  prescribedMiles: number | null;
  rows: WeekPlanRow[];
};

function storedChecks(key: string): Record<string, boolean> {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, boolean] => entry[1] === true),
    );
  } catch {
    return {};
  }
}

function PlanTasks({
  tasks,
  manualChecks,
  onToggle,
}: {
  tasks: WeekPlanTask[];
  manualChecks: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  if (tasks.length === 0) return <span className={styles.weekPlanEmptyCell}>nothing planned</span>;

  return (
    <ul className={styles.weekPlanTaskList}>
      {tasks.map((task) => {
        const synced = task.actual != null;
        const done = synced || manualChecks[task.id] === true;
        return (
          <li key={task.id}>
            <button
              type="button"
              className={`${styles.weekPlanTask} ${done ? styles.weekPlanTaskDone : ""}`}
              aria-pressed={done}
              aria-label={
                synced
                  ? `${task.text}, synced from activity data`
                  : `${done ? "Uncheck" : "Check off"} ${task.text}`
              }
              disabled={synced}
              onClick={() => onToggle(task.id)}
            >
              <span className={styles.weekPlanCheck} aria-hidden="true">{done ? "✓" : ""}</span>
              <span className={styles.weekPlanTaskCopy}>
                <span>{task.text}</span>
                {task.actual ? (
                  <small>{task.actual} · synced</small>
                ) : done ? (
                  <small>checked on this device</small>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function WeeklyPlanTable({
  weekKey,
  range,
  prescribedMiles,
  rows,
}: WeeklyPlanTableProps) {
  const router = useRouter();
  const storageKey = `fitness-plan-checks:${weekKey}`;
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setManualChecks(storedChecks(storageKey));
    const refresh = () => router.refresh();
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [router, storageKey]);

  const toggle = (id: string) => {
    setManualChecks((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = true;
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const tasks = rows.flatMap((row) => [...row.runTasks, ...row.otherTasks]);
  const done = tasks.filter((task) => task.actual != null || manualChecks[task.id]).length;
  const percent = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className={styles.weekPlanCard}>
      <div className={styles.weekPlanToolbar}>
        <div>
          <span>this week&apos;s plan</span>
          <strong>{prescribedMiles != null ? `${prescribedMiles} miles planned` : "week in progress"}</strong>
          <p>{range}</p>
        </div>
        <div className={styles.weekPlanProgress}>
          <div><span>{done} of {tasks.length} done</span><span>{percent}%</span></div>
          <div className={styles.weekPlanProgressTrack} aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
          <small>Watch workouts sync themselves. Taps stay on this device.</small>
        </div>
      </div>

      <table className={styles.weekPlanTable}>
        <caption className="sr-only">Running and strength plan for {range}</caption>
        <thead>
          <tr><th scope="col">day</th><th scope="col">run</th><th scope="col">lift + other</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className={`${row.isToday ? styles.weekPlanRowToday : ""} ${row.isPast ? styles.weekPlanRowPast : ""}`}
              key={row.date}
            >
              <th scope="row">
                <time dateTime={row.date}>{row.dayLabel}</time>
                {row.isToday ? <span>today</span> : row.isKeyDay ? <span>key day</span> : null}
              </th>
              <td data-label="run">
                <PlanTasks tasks={row.runTasks} manualChecks={manualChecks} onToggle={toggle} />
              </td>
              <td data-label="lift + other">
                <PlanTasks tasks={row.otherTasks} manualChecks={manualChecks} onToggle={toggle} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

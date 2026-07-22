import { FitnessAutoRefresh } from "./FitnessAutoRefresh";
import { ExpandedWeekPlan } from "./ExpandedWeekPlan";
import type { WeekPlanRow, WeekPlanTask } from "./weekly-plan";
import styles from "./fitness.module.css";

type WeeklyPlanTableProps = {
  range: string;
  prescribedMiles: number | null;
  rows: WeekPlanRow[];
};

function PlanTasks({ tasks }: { tasks: WeekPlanTask[] }) {
  if (tasks.length === 0) return <span className={styles.weekPlanEmptyCell}>nothing planned</span>;

  return (
    <ul className={styles.weekPlanTaskList}>
      {tasks.map((task) => {
        const synced = task.actual != null;
        return (
          <li
            className={`${styles.weekPlanTask} ${synced ? styles.weekPlanTaskDone : ""} ${task.trackable ? "" : styles.weekPlanTaskNote}`}
            key={task.id}
          >
            {task.trackable ? (
              <span className={styles.weekPlanCheck} aria-hidden="true">{synced ? "✓" : ""}</span>
            ) : null}
            <span className={styles.weekPlanTaskCopy}>
              <span>{task.text}</span>
              {task.actual ? (
                <small>{task.actual} · synced automatically</small>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function WeeklyPlanTable({
  range,
  prescribedMiles,
  rows,
}: WeeklyPlanTableProps) {
  const tasks = rows.flatMap((row) => [...row.runTasks, ...row.otherTasks]);
  const plannedWorkouts = tasks.filter((task) => task.trackable && !task.isExtra);
  const done = plannedWorkouts.filter((task) => task.actual != null).length;
  const percent = plannedWorkouts.length > 0
    ? Math.round((done / plannedWorkouts.length) * 100)
    : 0;

  return (
    <div className={styles.weekPlanCard}>
      <FitnessAutoRefresh />
      <div className={styles.weekPlanToolbar}>
        <div>
          <span>this week&apos;s plan</span>
          <strong>{prescribedMiles != null ? `${prescribedMiles} miles planned` : "week in progress"}</strong>
          <p>{range}</p>
        </div>
        <div className={styles.weekPlanProgress}>
          <div><span>{done} of {plannedWorkouts.length} workouts logged</span><span>{percent}%</span></div>
          <div className={styles.weekPlanProgressTrack} aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
          <small>Completed workouts fill in from Today and HealthFit.</small>
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
                <PlanTasks tasks={row.runTasks} />
              </td>
              <td data-label="lift + other">
                <PlanTasks tasks={row.otherTasks} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ExpandedWeekPlan rows={rows} />
    </div>
  );
}

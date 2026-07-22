import type { HealthSummary } from "@/lib/types";
import {
  getPlanWeekDays,
  type PublicTrainingPlan,
  type RunningWeek,
} from "@/lib/running";
import { summarizePlanDayText } from "@/lib/plan-summary";
import styles from "./fitness.module.css";

type TodayPlanProps = {
  today: string;
  health: HealthSummary;
  week: RunningWeek;
  plan: PublicTrainingPlan | null;
};

function sportLabel(sport: string | null): string {
  if (sport === "WeightTraining") return "strength training";
  return sport?.toLowerCase() ?? "activity";
}

type PlanDetail = {
  label: string;
  note: string | null;
};

type DayActivitySummary = {
  runCount: number;
  runDistanceMi: number;
  runMinutes: number;
  strengthMinutes: number;
};

function cleanPlanText(value: string): string {
  return value.trim().replace(/[.!?]+$/, "");
}

function planDetail(value: string): PlanDetail {
  const clean = cleanPlanText(value);
  const parenthetical = clean.match(/^(.+?)\s*\((.+)\)$/);
  return parenthetical
    ? { label: cleanPlanText(parenthetical[1]), note: cleanPlanText(parenthetical[2]) }
    : { label: clean.replace(/^at an\s+/i, ""), note: null };
}

export function todayPlanDisplay(text: string | null): {
  title: string;
  details: PlanDetail[];
} {
  if (!text) {
    return { title: "Nothing specific is planned today.", details: [] };
  }

  text = summarizePlanDayText(text);

  const chunks = text
    .split(/\s+\+\s+|(?<=[.!?])\s+/)
    .map(cleanPlanText)
    .filter(Boolean);
  const first = chunks.shift() ?? text;
  const workout = first.match(/^((?:easy|recovery|long run)\s+\d+(?:\.\d+)?\s+miles)\b(.*)$/i);
  const title = cleanPlanText(workout?.[1] ?? first);
  const remainder = cleanPlanText(workout?.[2] ?? "");
  const details = [remainder, ...chunks].filter(Boolean).map(planDetail);

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    details,
  };
}

export function summarizeDayActivities(
  activities: HealthSummary["recentActivities"],
  date: string,
): DayActivitySummary {
  const dayActivities = activities.filter((activity) => activity.date === date);
  const runs = dayActivities.filter((activity) => activity.sport === "Run");
  const runDistanceMi = runs.reduce((sum, activity) => sum + activity.distanceMi, 0);

  return {
    runCount: runs.length,
    runDistanceMi: Math.round(runDistanceMi * 10) / 10,
    runMinutes: runs.reduce((sum, activity) => sum + activity.movingMins, 0),
    strengthMinutes: dayActivities
      .filter((activity) => activity.sport === "WeightTraining")
      .reduce((sum, activity) => sum + activity.movingMins, 0),
  };
}

export function TodayPlan({ today, health, week, plan }: TodayPlanProps) {
  const planDays = plan ? getPlanWeekDays(plan) : [];
  const planned = planDays.find((day) => day.date === today);
  const futureDays = planDays.filter((day) => day.date > today);
  const upNext = futureDays[0];
  const nextKeyDay = futureDays.find((day) => day.isKeyDay) ?? upNext;
  const weeklyGoal = plan?.weekStart === week.weekStart ? plan.prescribedMiles : null;
  const nextWeekGoal = plan?.weekStart && plan.weekStart > week.weekStart
    ? plan.prescribedMiles
    : null;
  const progress = weeklyGoal
    ? Math.min(100, Math.round((week.runMiles / weeklyGoal) * 100))
    : null;
  const movedToday = health.today.exerciseMinutes > 0;
  const activity = summarizeDayActivities(health.recentActivities, today);
  const ranToday = activity.runCount > 0;
  const liftedToday = activity.strengthMinutes > 0;
  const completedToday = ranToday || liftedToday;
  const display = todayPlanDisplay(planned?.text ?? null);

  return (
    <section className={styles.todaySection} aria-labelledby="today-title">
      <div className={styles.todayHeading}>
        <div>
          <p>01 / today</p>
          <h2 id="today-title">{ranToday ? "The run is in." : liftedToday ? "The lift is in." : "What today looks like."}</h2>
        </div>
        <p>
          {completedToday
            ? ranToday ? "Today’s run is done, so tomorrow’s plan moves up next." : "Today’s lift is logged straight from the gym."
            : "The quick answer for when I just need to know what I’m doing today."}
        </p>
      </div>

      <div className={styles.todayGrid}>
        <article className={styles.todayPlanCard}>
          <div className={styles.todayCardLabel}>
            <span>{completedToday ? "done today" : "on the plan"}</span>
            {ranToday ? <strong>HealthFit</strong> : liftedToday ? <strong>Today</strong> : planned?.isKeyDay ? <strong>key day</strong> : null}
          </div>
          <div className={styles.todayPlanBody}>
            <h3>{ranToday ? `${activity.runDistanceMi.toFixed(1)} miles done.` : liftedToday ? `${activity.strengthMinutes} minutes lifting.` : display.title}</h3>
            {completedToday ? (
              <ul className={styles.todayPlanDetails}>
                {ranToday ? (
                  <li>
                    <div>
                      <span>{activity.runMinutes} min running</span>
                      {activity.runCount > 1 ? <small>{activity.runCount} activities combined</small> : null}
                    </div>
                  </li>
                ) : null}
                {activity.strengthMinutes > 0 ? (
                  <li>
                    <div><span>{activity.strengthMinutes} min strength training</span></div>
                  </li>
                ) : null}
              </ul>
            ) : display.details.length > 0 ? (
              <ul className={styles.todayPlanDetails}>
                {display.details.map((detail) => (
                  <li key={`${detail.label}-${detail.note ?? ""}`}>
                    <div>
                      <span>{detail.label}</span>
                      {detail.note ? <small>{detail.note}</small> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <p className={styles.todayPlanDate}>
            {completedToday
              ? `${planned?.dayLabel ?? today} · synced from ${ranToday ? "HealthFit" : "Today"}`
              : planned
                ? planned.dayLabel
                : "A free day to move however feels good."}
          </p>
        </article>

        <div className={styles.todaySideCards}>
          <article className={styles.todaySmallCard}>
            {completedToday ? (
              <>
                <span>up next</span>
                <strong>{upNext?.dayLabel ?? "plan coming soon"}</strong>
                <p>{upNext?.text ?? "The next plan will show up here when it is ready."}</p>
              </>
            ) : (
              <>
                <span>done today</span>
                <strong>{movedToday ? `${health.today.exerciseMinutes} min` : "nothing yet"}</strong>
                <p>
                  {movedToday
                    ? `${health.today.distanceMi.toFixed(1)} miles of ${sportLabel(health.today.sport)}`
                    : "The page will update after the next activity syncs."}
                </p>
              </>
            )}
          </article>

          <article className={styles.todaySmallCard}>
            <span>this week</span>
            <strong>{week.runMiles.toFixed(1)} miles</strong>
            <p>
              {weeklyGoal
                ? `${week.runDays} run days toward ${weeklyGoal.toFixed(1)} planned miles`
                : nextWeekGoal
                  ? `${week.runDays} run days. ${nextWeekGoal.toFixed(1)} miles are planned next week.`
                  : `${week.runDays} run days and ${week.liftDays} lift days`}
            </p>
            {progress != null ? (
              <div
                className={styles.weekProgress}
                role="progressbar"
                aria-label="Weekly running mileage progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            ) : null}
          </article>

          <article className={styles.todaySmallCard}>
            <span>next big one</span>
            <strong>{nextKeyDay?.dayLabel ?? "not set yet"}</strong>
            <p>{nextKeyDay?.text ?? "The next plan will show up here when it is ready."}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

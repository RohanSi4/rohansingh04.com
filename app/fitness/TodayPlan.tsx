import type { HealthSummary } from "@/lib/types";
import type { PublicTrainingPlan, RunningWeek } from "@/lib/running";
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

export function TodayPlan({ today, health, week, plan }: TodayPlanProps) {
  const planned = plan?.days.find((day) => day.date === today);
  const futureDays = plan?.days.filter((day) => day.date > today) ?? [];
  const nextDay = futureDays.find((day) => day.isKeyDay) ?? futureDays[0];
  const weeklyGoal = plan?.weekStart === week.weekStart ? plan.prescribedMiles : null;
  const nextWeekGoal = plan?.weekStart && plan.weekStart > week.weekStart
    ? plan.prescribedMiles
    : null;
  const progress = weeklyGoal
    ? Math.min(100, Math.round((week.runMiles / weeklyGoal) * 100))
    : null;
  const movedToday = health.today.exerciseMinutes > 0;

  return (
    <section className={styles.todaySection} aria-labelledby="today-title">
      <div className={styles.todayHeading}>
        <div>
          <p>01 / today</p>
          <h2 id="today-title">What today looks like.</h2>
        </div>
        <p>
          The plan and the actual activity live together now, so this is useful before
          and after the workout.
        </p>
      </div>

      <div className={styles.todayGrid}>
        <article className={styles.todayPlanCard}>
          <div className={styles.todayCardLabel}>
            <span>on the plan</span>
            {planned?.isKeyDay ? <strong>key day</strong> : null}
          </div>
          <h3>{planned?.text ?? "Nothing specific is planned today."}</h3>
          <p>{planned ? planned.dayLabel : "A free day to move however feels good."}</p>
        </article>

        <div className={styles.todaySideCards}>
          <article className={styles.todaySmallCard}>
            <span>done today</span>
            <strong>{movedToday ? `${health.today.exerciseMinutes} min` : "nothing yet"}</strong>
            <p>
              {movedToday
                ? `${health.today.distanceMi.toFixed(1)} miles of ${sportLabel(health.today.sport)}`
                : "The page will update after the next activity syncs."}
            </p>
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
            <strong>{nextDay?.dayLabel ?? "not set yet"}</strong>
            <p>{nextDay?.text ?? "The next plan will show up here when it is ready."}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

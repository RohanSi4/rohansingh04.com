import {
  formatRunDate,
  getPlanWeekDays,
  type PublicTrainingPlan,
} from "@/lib/running";
import styles from "./fitness.module.css";

type WeeklyPlanProps = {
  today: string;
  plan: PublicTrainingPlan | null;
};

function planRange(plan: PublicTrainingPlan): string {
  if (plan.weekStart && plan.weekEnd) {
    return `${formatRunDate(plan.weekStart)} to ${formatRunDate(plan.weekEnd, true)}`;
  }
  return "the latest week from my coach bot";
}

export function WeeklyPlan({ today, plan }: WeeklyPlanProps) {
  const days = plan ? getPlanWeekDays(plan) : [];
  const keyDay = days.find((day) => day.isKeyDay);

  return (
    <section className={styles.weekPlanSection} aria-labelledby="week-plan-title">
      <div className={styles.todayHeading}>
        <div>
          <p>02 / this week</p>
          <h2 id="week-plan-title">The whole week, right here.</h2>
        </div>
        <p>
          I keep forgetting the plan once I&apos;m already at the gym, so the coach
          bot&apos;s latest week lives here too.
        </p>
      </div>

      {plan && days.length > 0 ? (
        <div className={styles.weekPlanCard}>
          <div className={styles.weekPlanSummary}>
            <span>the bot&apos;s plan</span>
            <h3>
              {plan.prescribedMiles != null
                ? `${plan.prescribedMiles} miles on deck.`
                : "One week at a time."}
            </h3>
            <p>{planRange(plan)}</p>
            <dl>
              <div>
                <dt>days laid out</dt>
                <dd>{days.length}</dd>
              </div>
              <div>
                <dt>long run</dt>
                <dd>{keyDay?.dayLabel ?? "not set"}</dd>
              </div>
            </dl>
          </div>

          <ol className={styles.weekPlanDays}>
            {days.map((day) => {
              const isToday = day.date === today;
              const isPast = day.date < today;
              return (
                <li
                  className={`${styles.weekPlanDay} ${isToday ? styles.weekPlanDayToday : ""} ${isPast ? styles.weekPlanDayPast : ""}`}
                  key={day.date}
                >
                  <time dateTime={day.date}>{day.dayLabel}</time>
                  <p>{day.text}</p>
                  {isToday ? <strong>today</strong> : day.isKeyDay ? <strong>key day</strong> : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className={styles.weekPlanEmpty}>
          <strong>The next week isn&apos;t up yet.</strong>
          <p>It will show here the next time the coach bot publishes a plan.</p>
        </div>
      )}
    </section>
  );
}

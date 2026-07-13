import {
  formatRunDate,
  getPlanWeekDays,
  type PublicTrainingPlan,
} from "@/lib/running";
import type { HealthSummary } from "@/lib/types";
import { WeeklyPlanTable } from "./WeeklyPlanTable";
import { buildWeekPlanRows } from "./weekly-plan";
import styles from "./fitness.module.css";

type WeeklyPlanProps = {
  today: string;
  plan: PublicTrainingPlan | null;
  activities: HealthSummary["recentActivities"];
};

function planRange(plan: PublicTrainingPlan): string {
  if (plan.weekStart && plan.weekEnd) {
    return `${formatRunDate(plan.weekStart)} to ${formatRunDate(plan.weekEnd, true)}`;
  }
  return "the latest week from my coach bot";
}

export function WeeklyPlan({ today, plan, activities }: WeeklyPlanProps) {
  const days = plan ? getPlanWeekDays(plan) : [];
  const rows = buildWeekPlanRows(days, activities, today);

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
        <WeeklyPlanTable
          range={planRange(plan)}
          prescribedMiles={plan.prescribedMiles}
          rows={rows}
        />
      ) : (
        <div className={styles.weekPlanEmpty}>
          <strong>The next week isn&apos;t up yet.</strong>
          <p>It will show here the next time the coach bot publishes a plan.</p>
        </div>
      )}
    </section>
  );
}

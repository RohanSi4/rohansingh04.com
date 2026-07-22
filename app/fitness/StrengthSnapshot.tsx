import { formatRunDate } from "@/lib/running";
import {
  strengthWeekSummary,
  type PublicStrengthSession,
  type PublicWeightTrend,
} from "@/lib/fitness-sync";
import styles from "./fitness.module.css";

type StrengthSnapshotProps = {
  sessions: PublicStrengthSession[];
  weight: PublicWeightTrend | null;
  weekStart: string;
  today: string;
};

function kindLabel(kind: PublicStrengthSession["kind"]): string {
  return kind === "other" ? "open workout" : `${kind} day`;
}

export function StrengthSnapshot({ sessions, weight, weekStart, today }: StrengthSnapshotProps) {
  const week = strengthWeekSummary(sessions, weekStart);
  const cutoff = new Date(`${today}T12:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 27);
  const recent = sessions.filter((session) => session.date >= cutoff.toISOString().slice(0, 10));
  const latest = sessions[0];

  return (
    <section className={styles.strengthSection} aria-labelledby="strength-title">
      <div className={styles.sectionHeading}>
        <div>
          <p>03 / strength</p>
          <h2 id="strength-title">The work behind the runs.</h2>
        </div>
        <p className={styles.sectionNote}>
          I log the actual sets in a phone app I built. The private detail is encrypted
          before it leaves my phone. This page only gets the parts worth sharing.
        </p>
      </div>

      <div className={styles.strengthGrid}>
        <article className={styles.strengthLeadCard}>
          <div className={styles.strengthCardTop}>
            <span>{latest ? "latest lift" : "waiting for first sync"}</span>
            <span>{latest ? formatRunDate(latest.date, true) : "Today app"}</span>
          </div>
          {latest ? (
            <>
              <h3>{kindLabel(latest.kind)}</h3>
              <div className={styles.strengthNumbers}>
                <div><strong>{latest.workingSets}</strong><span>working sets</span></div>
                <div><strong>{latest.durationMinutes}</strong><span>minutes</span></div>
                <div><strong>{recent.length}</strong><span>lifts in 28 days</span></div>
              </div>
              <div className={styles.musclePills} aria-label="Main muscles trained">
                {latest.muscleGroups.slice(0, 6).map((muscle) => <span key={muscle}>{muscle}</span>)}
              </div>
            </>
          ) : (
            <div className={styles.strengthEmpty}>
              <h3>Today is ready to connect.</h3>
              <p>The next finished workout will fill this in automatically.</p>
            </div>
          )}
        </article>

        <div className={styles.strengthSide}>
          {weight ? <WeightTrendCard trend={weight} /> : null}
          <article className={styles.strengthWeekCard}>
            <span>this week</span>
            <div><strong>{week.days}</strong><small>lift days</small></div>
            <div><strong>{week.workingSets}</strong><small>working sets</small></div>
            <p>{week.topMuscles.length > 0 ? week.topMuscles.join(" · ") : "The week is still getting started."}</p>
          </article>

          <article className={styles.securityCard}>
            <span>how it moves</span>
            <ol aria-label="Private fitness data flow">
              <li><b>01</b><strong>Today</strong><small>log on my phone</small></li>
              <li><b>02</b><strong>encrypt</strong><small>AES-256-GCM</small></li>
              <li><b>03</b><strong>coach</strong><small>combine + learn</small></li>
              <li><b>04</b><strong>site</strong><small>share the safe bits</small></li>
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}

function WeightTrendCard({ trend }: { trend: PublicWeightTrend }) {
  const change = trend.change28Days == null
    ? "collecting"
    : `${trend.change28Days > 0 ? "+" : ""}${trend.change28Days.toFixed(1)} lb`;

  return (
    <article className={styles.weightTrendCard}>
      <span>weight progress <small>shared from Today</small></span>
      <div className={styles.weightTrendHeadline}>
        <strong>{trend.currentPounds.toFixed(1)}</strong>
        <small>lb now</small>
      </div>
      <dl>
        <div><dt>7-day average</dt><dd>{trend.sevenDayAverage.toFixed(1)} lb</dd></div>
        <div><dt>28-day change</dt><dd>{change}</dd></div>
        <div><dt>mornings logged</dt><dd>{trend.daysLogged28} / 28</dd></div>
        <div><dt>open goal</dt><dd>{trend.goalPounds.toFixed(0)} lb</dd></div>
      </dl>
    </article>
  );
}

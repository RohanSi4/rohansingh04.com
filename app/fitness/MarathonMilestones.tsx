import type { RunningWeek } from "@/lib/running";
import styles from "./fitness.module.css";

type MarathonMilestonesProps = {
  weeks: RunningWeek[];
  trainingStart: string;
};

const checkpoints = [12, 14, 16, 18, 20, 26.2] as const;

export function MarathonMilestones({ weeks, trainingStart }: MarathonMilestonesProps) {
  const buildWeeks = weeks.filter((week) => week.weekStart >= trainingStart);
  const currentLongest = Math.max(0, ...buildWeeks.map((week) => week.longRunMiles));
  const nextCheckpoint = checkpoints.find((distance) => distance > currentLongest);

  return (
    <section className={styles.milestones} aria-labelledby="milestones-title">
      <div className={styles.milestoneIntro}>
        <p>long run path</p>
        <h3 id="milestones-title">Building toward 26.2.</h3>
        <span>
          <strong>{currentLongest.toFixed(1)} miles</strong> is the longest run of this build.
          The goal is to earn each step without rushing the next one.
        </span>
      </div>
      <ol className={styles.milestoneTrack} aria-label="Long run milestones">
        {checkpoints.map((distance) => {
          const complete = currentLongest >= distance;
          const current = distance === nextCheckpoint;
          return (
            <li
              key={distance}
              className={complete ? styles.milestoneComplete : current ? styles.milestoneCurrent : ""}
            >
              <i aria-hidden="true" />
              <strong>{distance}</strong>
              <span>{distance === 26.2 ? "race day" : "miles"}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

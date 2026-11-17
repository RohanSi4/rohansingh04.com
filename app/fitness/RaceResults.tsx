import Link from "next/link";
import { formatRunDate } from "@/lib/running";
import type { RaceResult } from "@/lib/types";
import styles from "./fitness.module.css";

type RaceResultsProps = {
  races: RaceResult[];
};

// Race results are hand-written content, not part of the synced dashboard, so the
// public fitness schema stays exactly as narrow as it was.
export function RaceResults({ races }: RaceResultsProps) {
  if (races.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="races-title">
      <div className={styles.sectionHeading}>
        <div>
          <p>05 / races</p>
          <h2 id="races-title">Race day, on the record.</h2>
        </div>
        <p className={styles.sectionNote}>
          Official chip times. Training is the plan, and these are what actually
          happened when it counted.
        </p>
      </div>
      <ul className={`${styles.benchmarkGrid} ${styles.raceResultGrid}`}>
        {races.map((race) => (
          <li className={styles.benchmarkCard} key={race.id}>
            <div className={styles.benchmarkTop}>
              <span>{race.distance}</span>
              <span>{race.location.toLowerCase()}</span>
            </div>
            <strong className={styles.benchmarkTime}>{race.chipTime}</strong>
            <p className={styles.raceResultName}>{race.name}</p>
            <p className={styles.raceResultSummary}>{race.summary}</p>
            <div className={styles.benchmarkStats}>
              <div><span>date</span><strong>{formatRunDate(race.date, true)}</strong></div>
              {race.goalTime ? (
                <div><span>goal</span><strong>{race.goalTime}</strong></div>
              ) : null}
              {race.noteSlug ? (
                <Link className={styles.raceResultLink} href={`/notes/${race.noteSlug}`}>
                  read the race recap →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

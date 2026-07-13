import type { Metadata } from "next";
import Link from "next/link";
import {
  formatPace,
  formatRunDate,
  fitnessTimeZone,
  getRunningDashboard,
} from "@/lib/running";
import { FitnessMetric } from "./FitnessMetric";
import { MarathonMilestones } from "./MarathonMilestones";
import { SyncStatus } from "./SyncStatus";
import { TodayPlan } from "./TodayPlan";
import TrainingHistoryChart from "./TrainingHistoryChart";
import styles from "./fitness.module.css";

export const metadata: Metadata = {
  title: "fitness",
  description:
    "A live look at Rohan's running, lifting, and training for the 2026 Richmond Marathon.",
  alternates: { canonical: "/fitness" },
  openGraph: {
    title: "fitness in progress",
    description: "Running, lifting, and training for whatever comes next.",
    url: "/fitness",
  },
};

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

function daysBetween(start: string, end: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(`${end}T12:00:00Z`).getTime() -
        new Date(`${start}T12:00:00Z`).getTime()) /
        DAY_MS,
    ),
  );
}

function activityLabel(sport: string): string {
  const labels: Record<string, string> = {
    Run: "run",
    WeightTraining: "lift",
    Workout: "workout",
    Walk: "walk",
    Ride: "ride",
    Swim: "swim",
    Hike: "hike",
    Golf: "golf",
    Basketball: "basketball",
  };
  return labels[sport] ?? sport.toLowerCase();
}

export default async function FitnessPage() {
  const data = await getRunningDashboard();
  const latestRun = data.recentRuns[0];
  const featuredRun = data.recentRuns.find(
    (run) => run.distanceMi >= Math.max(8, data.currentWeek.longRunMiles - 0.25),
  ) ?? latestRun;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: fitnessTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const daysToRace = daysBetween(today, data.race.date);
  const blockStart = data.weeks.find((week) => week.runMiles > 0)?.weekStart ?? data.dataThrough;
  const blockLength = Math.max(1, daysBetween(blockStart, data.race.date));
  const progress = Math.max(0, Math.min(100, Math.round(((blockLength - daysToRace) / blockLength) * 100)));
  const circumference = 2 * Math.PI * 46;
  const ringOffset = circumference * (1 - progress / 100);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span>fitness log</span>
            <span className={styles.eyebrowRule} />
            <SyncStatus generatedAt={data.generatedAt} />
            <span className={styles.eyebrowRule} />
            <span>current goal: richmond</span>
          </div>
          <p className={styles.kicker}>running, lifting, and whatever gets me moving.</p>
          <h1>
            Training for
            <br />
            <em>my first marathon.</em>
          </h1>
          <p className={styles.heroIntro}>
            Right now I&apos;m training for Richmond. After that, I still want to run,
            lift, play pickup, and say yes when friends want to do something active.
            This page is where I keep track of all of it.
          </p>
          <div className={styles.goalStrip}>
            <div>
              <span>current goal</span>
              <strong>{data.race.name}</strong>
            </div>
            <div>
              <span>race day</span>
              <strong>{formatRunDate(data.race.date, true)}</strong>
            </div>
            <div>
              <span>time goal</span>
              <strong>sub {data.race.goalTime.slice(0, 4)}</strong>
            </div>
          </div>
        </div>

        <aside className={styles.raceCard} aria-label="Current fitness goal">
          <div className={styles.raceCardTop}>
            <span>current focus</span>
            <span>richmond, va</span>
          </div>
          <div className={styles.raceDistance}>26.2</div>
          <p className={styles.raceName}>{data.race.name}</p>
          <div className={styles.countdown}>
            <svg viewBox="0 0 110 110" aria-hidden="true">
              <circle className={styles.ringTrack} cx="55" cy="55" r="46" />
              <circle
                className={styles.ringProgress}
                cx="55"
                cy="55"
                r="46"
                strokeDasharray={circumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div>
              <strong>{daysToRace}</strong>
              <span>days out</span>
            </div>
          </div>
          <div className={styles.raceCardBottom}>
            <span>right now</span>
            <strong>marathon training</strong>
          </div>
        </aside>
      </section>

      <section className={styles.metrics} aria-label="Fitness highlights">
        <FitnessMetric
          label="active this month"
          value={`${data.health.thisMonth.activeDays} days`}
          detail={`${data.health.thisMonth.distanceMi.toFixed(1)} miles moved`}
        />
        <FitnessMetric
          label="running this week"
          value={`${data.currentWeek.runMiles.toFixed(1)} mi`}
          detail={`${data.currentWeek.runDays} run days`}
        />
        <FitnessMetric
          label="lifting this week"
          value={`${data.currentWeek.liftDays} days`}
          detail="keeping strength in the mix"
        />
        <FitnessMetric
          label="active this year"
          value={`${data.health.thisYear.activeDays} days`}
          detail={`${data.totals.totalActivities.toLocaleString()} activities tracked overall`}
        />
      </section>

      <TodayPlan today={today} health={data.health} week={data.currentWeek} plan={data.trainingPlan} />

      <section className={styles.section} aria-labelledby="progress-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>02 / the build</p>
            <h2 id="progress-title">Training for Richmond.</h2>
          </div>
          <p className={styles.sectionNote}>
            Running gets the most detail right now because that&apos;s what I&apos;m training
            for. Use the tabs to look back at older miles.
          </p>
        </div>
        <div className={styles.chartCard}>
          <TrainingHistoryChart
            weeks={data.weeks}
            months={data.monthlyHistory}
            years={data.yearlyHistory}
            dataThrough={data.dataThrough}
            peakWeekMiles={data.totals.peakWeekMiles}
          />
        </div>
        <MarathonMilestones weeks={data.weeks} trainingStart={data.race.trainingStart} />
      </section>

      <section className={styles.aerobicSection} aria-labelledby="latest-title">
        <div className={styles.aerobicCopy}>
          <p>03 / latest long run</p>
          <h2 id="latest-title">My latest long run.</h2>
          <p>
            This is the latest long run in the data. I&apos;m watching distance, pace,
            and heart rate to see how the build is going without turning every run
            into a test.
          </p>
          <div className={styles.aerobicRules}>
            <div><span>distance</span><strong>{featuredRun.distanceMi.toFixed(1)} mi</strong></div>
            <div><span>average heart rate</span><strong>{featuredRun.averageHeartRate ?? "n/a"} bpm</strong></div>
            <div><span>time moving</span><strong>{featuredRun.movingMinutes} min</strong></div>
          </div>
        </div>
        <div className={styles.latestRunCard}>
          <div className={styles.latestRunHeader}>
            <span>long run</span>
            <span>{formatRunDate(featuredRun.date, true)}</span>
          </div>
          <div className={styles.latestRunDistance}>
            <strong>{featuredRun.distanceMi.toFixed(1)}</strong>
            <span>miles</span>
          </div>
          <div className={styles.zoneBar} aria-hidden="true">
            <span style={{ width: `${featuredRun.easyZonePct ?? 0}%` }} />
          </div>
          <div className={styles.latestRunStats}>
            <div><span>pace</span><strong>{formatPace(featuredRun.paceSecondsPerMile)} /mi</strong></div>
            <div><span>time</span><strong>{featuredRun.movingMinutes} min</strong></div>
            <div><span>avg heart rate</span><strong>{featuredRun.averageHeartRate ?? "n/a"} bpm</strong></div>
            <div><span>elevation</span><strong>{featuredRun.elevationFeet ?? "n/a"} ft</strong></div>
          </div>
          <p className={styles.runReadout}>
            Conditions · {featuredRun.temperatureF ?? "n/a"}°F · {featuredRun.surface}
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="activity-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>04 / recent activity</p>
            <h2 id="activity-title">What I&apos;ve been doing.</h2>
          </div>
          <p className={styles.sectionNote}>
            Running is the focus right now, but it&apos;s not the whole picture. Lifts,
            walks, rides, and sports all count.
          </p>
        </div>
        <table className={styles.runTable}>
          <caption className="sr-only">Ten most recent fitness activities</caption>
          <thead>
          <tr className={`${styles.runRow} ${styles.runTableHead}`}>
            <th scope="col">date</th><th scope="col">activity</th><th scope="col">duration</th><th scope="col">distance</th><th scope="col">type</th>
          </tr>
          </thead>
          <tbody>
          {data.health.recentActivities.slice(0, 10).map((activity, index) => (
            <tr className={styles.runRow} key={`${activity.date}-${activity.sport}-${index}`}>
              <td className={styles.runDate}>{formatRunDate(activity.date)}</td>
              <td className={styles.runPrimary}>
                <strong>{activity.name.toLowerCase()}</strong>
              </td>
              <td>{activity.movingMins} <small>min</small></td>
              <td>{activity.distanceMi > 0 ? activity.distanceMi.toFixed(1) : "n/a"} <small>{activity.distanceMi > 0 ? "mi" : ""}</small></td>
              <td><small>{activityLabel(activity.sport)}</small></td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>

      <section className={styles.pipeline} aria-labelledby="bigger-goal-title">
        <div className={styles.pipelineIntro}>
          <p>05 / the bigger goal</p>
          <h2 id="bigger-goal-title">The marathon isn&apos;t the whole point.</h2>
          <p>
            I&apos;m focused on Richmond right now, but I don&apos;t want fitness to become
            one race. I want enough endurance and strength to play sports, hike, try
            new things, and feel good doing it.
          </p>
        </div>
        <ol className={styles.pipelineSteps}>
          <li><span>01</span><div><strong>run</strong><p>Keep enough endurance to enjoy distance, races, and being outside.</p></div></li>
          <li><span>02</span><div><strong>lift</strong><p>Stay strong, durable, and balanced instead of only chasing mileage.</p></div></li>
          <li><span>03</span><div><strong>play</strong><p>Basketball, golf, hikes, or whatever sounds fun with friends.</p></div></li>
        </ol>
      </section>

      <footer className={styles.dataFooter}>
        <SyncStatus generatedAt={data.generatedAt} />
        <span>last activity {data.health.lastActivity ? formatRunDate(data.health.lastActivity.date, true) : "not available"}</span>
        <span>{data.health.allTime.activeDays.toLocaleString()} active days tracked</span>
        <Link href="/projects/marathon-prep-bot">how this page updates →</Link>
      </footer>
    </div>
  );
}

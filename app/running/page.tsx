import type { Metadata } from "next";
import Link from "next/link";
import {
  formatPace,
  formatRunDate,
  getRunningDashboard,
} from "@/lib/running";
import TrainingHistoryChart from "./TrainingHistoryChart";
import styles from "./running.module.css";

export const metadata: Metadata = {
  title: "marathon build",
  description:
    "A live, data-driven look at Rohan's build toward the 2026 Richmond Marathon.",
  alternates: { canonical: "/running" },
  openGraph: {
    title: "the marathon experiment",
    description: "150+ miles, one sub-3:45 goal, and every training signal in between.",
    url: "/running",
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

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className={styles.metric}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}

export default async function RunningPage() {
  const data = await getRunningDashboard();
  const latestRun = data.recentRuns[0];
  const featuredRun = data.recentRuns.find(
    (run) => run.distanceMi >= Math.max(8, data.currentWeek.longRunMiles - 0.25),
  ) ?? latestRun;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const daysToRace = daysBetween(today, data.race.date);
  const blockStart = data.weeks.find((week) => week.runMiles > 0)?.weekStart ?? data.dataThrough;
  const blockLength = Math.max(1, daysBetween(blockStart, data.race.date));
  const elapsed = blockLength - daysToRace;
  const progress = Math.max(0, Math.min(100, Math.round((elapsed / blockLength) * 100)));
  const circumference = 2 * Math.PI * 46;
  const ringOffset = circumference * (1 - progress / 100);
  const previousFourWeeks = data.weeks.slice(-8, -4);
  const previousFourMiles = previousFourWeeks.reduce((sum, week) => sum + week.runMiles, 0);
  const volumeChange = previousFourMiles > 0
    ? Math.round(((data.recentFourWeekMiles - previousFourMiles) / previousFourMiles) * 100)
    : null;
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} aria-hidden="true" />
            <span>the marathon experiment</span>
            <span className={styles.eyebrowRule} />
            <span>2026</span>
          </div>
          <p className={styles.kicker}>one runner. one finish line. all the data.</p>
          <h1>
            Building an engine
            <br />
            for <em>26.2</em>
          </h1>
          <p className={styles.heroIntro}>
            I&apos;m training for my first marathon and treating the whole build like a
            systems project—collect the signal, study the trend, then make the next
            week a little smarter.
          </p>
          <div className={styles.goalStrip}>
            <div>
              <span>the target</span>
              <strong>{data.race.goalTime}</strong>
            </div>
            <div>
              <span>goal pace</span>
              <strong>{data.race.goalPace}</strong>
            </div>
            <div>
              <span>race day</span>
              <strong>{formatRunDate(data.race.date, true)}</strong>
            </div>
          </div>
        </div>

        <aside className={styles.raceCard} aria-label="Race countdown">
          <div className={styles.raceCardTop}>
            <span>next up</span>
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
            <span>block progress</span>
            <strong>{progress}%</strong>
          </div>
        </aside>
      </section>

      <section className={styles.metrics} aria-label="Training highlights">
        <Metric
          label="this week"
          value={`${data.currentWeek.runMiles.toFixed(1)} mi`}
          detail={`${data.currentWeek.runDays} runs · ${data.currentWeek.liftDays} lifts`}
        />
        <Metric
          label="four-week volume"
          value={`${data.recentFourWeekMiles.toFixed(1)} mi`}
          detail={volumeChange == null ? "building the baseline" : `${volumeChange >= 0 ? "+" : ""}${volumeChange}% vs prior four`}
        />
        <Metric
          label="long run"
          value={`${data.currentWeek.longRunMiles.toFixed(1)} mi`}
          detail={`${formatPace(featuredRun.paceSecondsPerMile)} /mi · ${featuredRun.averageHeartRate ?? "—"} bpm`}
        />
        <Metric
          label="training load"
          value={data.currentWeek.trainingLoad.toLocaleString()}
          detail="weekly TRIMP · heart-rate weighted"
        />
      </section>

      <section className={styles.section} aria-labelledby="volume-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>01 / the build</p>
            <h2 id="volume-title">Volume is the feature.</h2>
          </div>
          <p className={styles.sectionNote}>
            Eight focused weeks by default, with the complete {data.totals.totalRuns}-run,
            {" "}{data.yearlyHistory.length}-year archive one click away. No history discarded.
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
      </section>

      <section className={styles.aerobicSection} aria-labelledby="aerobic-title">
        <div className={styles.aerobicCopy}>
          <p>02 / the engine</p>
          <h2 id="aerobic-title">Easy is a data point.</h2>
          <p>
            The goal isn&apos;t to win training. It&apos;s to cover more ground at a lower
            physiological cost. Heart rate, easy-zone time, and late-run drift tell
            that story better than pace alone.
          </p>
          <div className={styles.aerobicRules}>
            <div><span>easy ceiling</span><strong>150 bpm</strong></div>
            <div><span>latest average</span><strong>{featuredRun.averageHeartRate ?? "—"} bpm</strong></div>
            <div><span>aerobic drift</span><strong>{featuredRun.aerobicDecouplingPct == null ? "—" : `${featuredRun.aerobicDecouplingPct.toFixed(1)}%`}</strong></div>
          </div>
        </div>
        <div className={styles.latestRunCard}>
          <div className={styles.latestRunHeader}>
            <span>latest long run</span>
            <span>{formatRunDate(featuredRun.date, true)}</span>
          </div>
          <div className={styles.latestRunDistance}>
            <strong>{featuredRun.distanceMi.toFixed(1)}</strong>
            <span>miles</span>
          </div>
          <div className={styles.zoneBar} aria-label={`${featuredRun.easyZonePct ?? 0}% in easy heart-rate zones`}>
            <span style={{ width: `${featuredRun.easyZonePct ?? 0}%` }} />
          </div>
          <div className={styles.latestRunStats}>
            <div><span>pace</span><strong>{formatPace(featuredRun.paceSecondsPerMile)} /mi</strong></div>
            <div><span>easy zones</span><strong>{featuredRun.easyZonePct == null ? "—" : `${featuredRun.easyZonePct}%`}</strong></div>
            <div><span>elevation</span><strong>{featuredRun.elevationFeet ?? "—"} ft</strong></div>
            <div><span>load</span><strong>{featuredRun.trainingLoad ?? "—"}</strong></div>
          </div>
          <p className={styles.runReadout}>
            {featuredRun.easyZonePct ?? "—"}% controlled · {featuredRun.aerobicDecouplingPct ?? "—"}% drift · {featuredRun.temperatureF ?? "—"}°F
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="sessions-title">
        <div className={styles.sectionHeading}>
          <div>
            <p>03 / field notes</p>
            <h2 id="sessions-title">Recent sessions.</h2>
          </div>
          <p className={styles.sectionNote}>
            The public cut: training signal in, routes and private notes out.
          </p>
        </div>
        <div className={styles.runTable}>
          <div className={`${styles.runRow} ${styles.runTableHead}`} aria-hidden="true">
            <span>date</span><span>run</span><span>pace</span><span>heart rate</span><span>load</span>
          </div>
          {data.recentRuns.slice(0, 8).map((run) => (
            <div className={styles.runRow} key={run.id}>
              <span className={styles.runDate}>{formatRunDate(run.date)}</span>
              <span className={styles.runPrimary}>
                <strong>{run.distanceMi.toFixed(1)} mi</strong>
                <small>{run.surface}</small>
              </span>
              <span>{formatPace(run.paceSecondsPerMile)} <small>/mi</small></span>
              <span>{run.averageHeartRate ?? "—"} <small>bpm</small></span>
              <span>{run.trainingLoad ?? "—"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.pipeline} aria-labelledby="pipeline-title">
        <div className={styles.pipelineIntro}>
          <p>04 / under the hood</p>
          <h2 id="pipeline-title">A project that happens to involve running.</h2>
          <p>
            The dashboard is the last mile of a local-first training system. A sync
            script publishes only the useful aggregates, so the interesting data can
            be public without making the sensitive data public too.
          </p>
          <Link href="/projects/marathon-prep-bot">read the project notes →</Link>
        </div>
        <ol className={styles.pipelineSteps}>
          <li><span>01</span><div><strong>record</strong><p>Apple Watch + Polar H10 capture the workout.</p></div></li>
          <li><span>02</span><div><strong>ingest</strong><p>HealthFit exports raw FIT files into a local archive.</p></div></li>
          <li><span>03</span><div><strong>compute</strong><p>TypeScript derives zones, TRIMP, drift, and weekly trends.</p></div></li>
          <li><span>04</span><div><strong>publish</strong><p>A privacy filter creates the snapshot you&apos;re seeing here.</p></div></li>
        </ol>
      </section>

      <footer className={styles.dataFooter}>
        <span><i className={styles.liveDot} />data through {formatRunDate(data.dataThrough, true)}</span>
        <span>{data.totals.runMiles.toFixed(1)} miles · {data.totals.totalActivities.toLocaleString()} total activities</span>
        <Link href="/projects/marathon-prep-bot">project notes →</Link>
      </footer>
    </div>
  );
}

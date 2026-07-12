import type { Metadata } from "next";
import Link from "next/link";
import {
  formatPace,
  formatRunDate,
  getRunningDashboard,
  type RunningWeek,
} from "@/lib/running";
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

function VolumeChart({ weeks }: { weeks: RunningWeek[] }) {
  const width = 900;
  const height = 250;
  const baseline = 196;
  const chartHeight = 160;
  const left = 28;
  const right = 12;
  const plotWidth = width - left - right;
  const band = plotWidth / weeks.length;
  const barWidth = Math.min(30, band * 0.58);
  const maxMiles = Math.max(30, Math.ceil(Math.max(...weeks.map((week) => week.runMiles)) / 10) * 10);
  const y = (miles: number) => baseline - (miles / maxMiles) * chartHeight;
  const longRunPoints = weeks
    .map((week, index) => `${left + index * band + band / 2},${y(week.longRunMiles)}`)
    .join(" ");

  return (
    <div className={styles.chartScroller}>
      <svg
        className={styles.volumeChart}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Weekly mileage bars with a line showing the longest run each week"
      >
        {[0, 10, 20, 30].filter((tick) => tick <= maxMiles).map((tick) => (
          <g key={tick}>
            <line
              className={styles.gridLine}
              x1={left}
              x2={width - right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text className={styles.axisLabel} x={0} y={y(tick) + 4}>
              {tick}
            </text>
          </g>
        ))}

        {weeks.map((week, index) => {
          const x = left + index * band + (band - barWidth) / 2;
          const barHeight = Math.max(week.runMiles > 0 ? 2 : 0, baseline - y(week.runMiles));
          return (
            <g key={week.weekStart}>
              <rect
                className={styles.volumeBar}
                x={x}
                y={baseline - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
              >
                <title>
                  Week of {formatRunDate(week.weekStart)}: {week.runMiles.toFixed(1)} miles, {week.longRunMiles.toFixed(1)} mile long run
                </title>
              </rect>
              {(index % 3 === 1 || index === weeks.length - 1) && (
                <text
                  className={styles.weekLabel}
                  x={left + index * band + band / 2}
                  y={225}
                  textAnchor="middle"
                >
                  {formatRunDate(week.weekStart)}
                </text>
              )}
            </g>
          );
        })}

        <polyline className={styles.longRunLine} points={longRunPoints} />
        {weeks.map((week, index) => (
          <circle
            key={`long-${week.weekStart}`}
            className={styles.longRunDot}
            cx={left + index * band + band / 2}
            cy={y(week.longRunMiles)}
            r={week.longRunMiles > 0 ? 3.5 : 2}
          >
            <title>{week.longRunMiles.toFixed(1)} mile long run</title>
          </circle>
        ))}
      </svg>
    </div>
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

export default function RunningPage() {
  const data = getRunningDashboard();
  const latestRun = data.recentRuns[0];
  const daysToRace = daysBetween(data.dataThrough, data.race.date);
  const blockStart = data.weeks.find((week) => week.runMiles > 0)?.weekStart ?? data.dataThrough;
  const blockLength = Math.max(1, daysBetween(blockStart, data.race.date));
  const elapsed = blockLength - daysToRace;
  const progress = Math.max(0, Math.min(100, Math.round((elapsed / blockLength) * 100)));
  const circumference = 2 * Math.PI * 46;
  const ringOffset = circumference * (1 - progress / 100);
  const latestFourWeeks = data.weeks.slice(-4);
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
          detail={`${formatPace(latestRun.paceSecondsPerMile)} /mi · ${latestRun.averageHeartRate} bpm`}
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
            Weekly mileage is climbing while the long run extends underneath it.
            Consistency first; hero workouts later.
          </p>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <span>weekly mileage</span>
              <strong>{data.currentWeek.runMiles.toFixed(1)}</strong>
              <small> miles this week</small>
            </div>
            <div className={styles.legend} aria-hidden="true">
              <span><i className={styles.barKey} />total miles</span>
              <span><i className={styles.lineKey} />long run</span>
            </div>
          </div>
          <VolumeChart weeks={data.weeks} />
          <div className={styles.chartFooter}>
            <span>week of {formatRunDate(latestFourWeeks[0].weekStart)}</span>
            <span>peak week · {data.totals.peakWeekMiles.toFixed(1)} mi</span>
            <span>through {formatRunDate(data.dataThrough, true)}</span>
          </div>
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
            <div><span>latest average</span><strong>{latestRun.averageHeartRate} bpm</strong></div>
            <div><span>aerobic drift</span><strong>{latestRun.aerobicDecouplingPct?.toFixed(1)}%</strong></div>
          </div>
        </div>
        <div className={styles.latestRunCard}>
          <div className={styles.latestRunHeader}>
            <span>latest long run</span>
            <span>{formatRunDate(latestRun.date, true)}</span>
          </div>
          <div className={styles.latestRunDistance}>
            <strong>{latestRun.distanceMi.toFixed(1)}</strong>
            <span>miles</span>
          </div>
          <div className={styles.zoneBar} aria-label={`${latestRun.easyZonePct}% in easy heart-rate zones`}>
            <span style={{ width: `${latestRun.easyZonePct ?? 0}%` }} />
          </div>
          <div className={styles.latestRunStats}>
            <div><span>pace</span><strong>{formatPace(latestRun.paceSecondsPerMile)} /mi</strong></div>
            <div><span>easy zones</span><strong>{latestRun.easyZonePct}%</strong></div>
            <div><span>elevation</span><strong>{latestRun.elevationFeet} ft</strong></div>
            <div><span>load</span><strong>{latestRun.trainingLoad}</strong></div>
          </div>
          <p className={styles.runReadout}>
            {latestRun.easyZonePct}% controlled · {latestRun.aerobicDecouplingPct}% drift · {latestRun.temperatureF}°F
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
        <span>{data.totals.runMiles.toFixed(1)} training miles in the archive</span>
        <a href="https://github.com/RohanSi4/marathon-prep-bot" target="_blank" rel="noreferrer">
          source on github ↗
        </a>
      </footer>
    </div>
  );
}

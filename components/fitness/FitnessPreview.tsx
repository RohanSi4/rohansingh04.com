import Link from "next/link";
import { formatPace, formatRunDate, type RunningDashboard } from "@/lib/running";

export default function FitnessPreview({ data }: { data: RunningDashboard }) {
  const recentWeeks = data.weeks.slice(-8);
  const maxMiles = Math.max(...recentWeeks.map((week) => week.runMiles), 1);
  const latestRun = data.recentRuns[0];
  const latestLongRun = data.recentRuns.find(
    (run) => run.distanceMi >= Math.max(8, data.currentWeek.longRunMiles - 0.25),
  ) ?? latestRun;

  return (
    <Link
      href="/fitness"
      className="group relative block my-8 overflow-hidden rounded-xl border border-border bg-surface p-5 sm:p-6 transition-colors hover:border-accent"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full border border-accent/20"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ee5f3b]" />
            fitness · what I&apos;m training for
          </p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            My first marathon.
          </h2>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">
            I&apos;m training for Richmond right now, but the bigger goal is staying fit
            enough to run, lift, and play whatever sport comes up.
          </p>
        </div>
        <span className="relative mt-1 text-sm text-muted transition-transform group-hover:translate-x-1 group-hover:text-fg">
          view progress →
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted">active this month</p>
          <p className="mt-1 font-mono text-xl text-fg">{data.health.thisMonth.activeDays} days</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted">latest long run</p>
          <p className="mt-1 font-mono text-xl text-fg">{latestLongRun.distanceMi.toFixed(1)} mi</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted">running this week</p>
          <p className="mt-1 font-mono text-xl text-warm">{data.currentWeek.runMiles.toFixed(1)} mi</p>
        </div>
      </div>

      <div className="relative mt-5 flex h-12 items-end gap-1.5" aria-label="Last eight weeks of running mileage">
        {recentWeeks.map((week) => (
          <span
            key={week.weekStart}
            className="min-h-px flex-1 rounded-t-sm bg-accent/70 transition-colors group-hover:bg-accent"
            style={{ height: `${Math.max(week.runMiles > 0 ? 5 : 1, (week.runMiles / maxMiles) * 100)}%` }}
            title={`${formatRunDate(week.weekStart)}: ${week.runMiles.toFixed(1)} miles`}
          />
        ))}
      </div>
      <p className="relative mt-2 font-mono text-[10px] text-muted">
        latest · {formatRunDate(latestRun.date)} · {latestRun.distanceMi.toFixed(1)} mi @ {formatPace(latestRun.paceSecondsPerMile)} /mi · {latestRun.averageHeartRate} bpm
      </p>
    </Link>
  );
}

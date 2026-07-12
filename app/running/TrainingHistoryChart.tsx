"use client";

import { useMemo, useState } from "react";
import {
  formatRunDate,
  type RunningMonth,
  type RunningWeek,
  type RunningYear,
} from "@/lib/running";
import styles from "./running.module.css";

type Range = "recent" | "year" | "all";
type Point = {
  key: string;
  label: string;
  miles: number;
  longest: number;
  detail: string;
};

function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" })
    .format(new Date(`${month}-15T12:00:00Z`));
}

function Chart({ points }: { points: Point[] }) {
  const width = 900;
  const height = 250;
  const baseline = 196;
  const chartHeight = 160;
  const left = 28;
  const right = 12;
  const plotWidth = width - left - right;
  const band = plotWidth / points.length;
  const barWidth = Math.min(82, band * 0.58);
  const maxValue = Math.max(...points.map((point) => point.miles), 1);
  const tickSize = maxValue > 80 ? 50 : maxValue > 35 ? 20 : 10;
  const maxMiles = Math.max(tickSize, Math.ceil(maxValue / tickSize) * tickSize);
  const y = (miles: number) => baseline - (miles / maxMiles) * chartHeight;
  const ticks = Array.from(
    { length: Math.floor(maxMiles / tickSize) + 1 },
    (_, index) => index * tickSize,
  );
  const linePoints = points
    .map((point, index) => `${left + index * band + band / 2},${y(point.longest)}`)
    .join(" ");

  return (
    <div className={styles.chartScroller}>
      <svg
        className={styles.volumeChart}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Running mileage bars with a line showing the longest run in each period"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line className={styles.gridLine} x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} />
            <text className={styles.axisLabel} x={0} y={y(tick) + 4}>{tick}</text>
          </g>
        ))}
        {points.map((point, index) => {
          const x = left + index * band + (band - barWidth) / 2;
          const barHeight = Math.max(point.miles > 0 ? 3 : 0, baseline - y(point.miles));
          return (
            <g key={point.key}>
              <rect
                className={styles.volumeBar}
                x={x}
                y={baseline - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
              >
                <title>{point.detail}</title>
              </rect>
              <text
                className={styles.weekLabel}
                x={left + index * band + band / 2}
                y={225}
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          );
        })}
        <polyline className={styles.longRunLine} points={linePoints} />
        {points.map((point, index) => (
          <circle
            key={`long-${point.key}`}
            className={styles.longRunDot}
            cx={left + index * band + band / 2}
            cy={y(point.longest)}
            r={point.longest > 0 ? 3.5 : 2}
          >
            <title>{point.longest.toFixed(1)} mile longest run</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default function TrainingHistoryChart({
  weeks,
  months,
  years,
  dataThrough,
  peakWeekMiles,
}: {
  weeks: RunningWeek[];
  months: RunningMonth[];
  years: RunningYear[];
  dataThrough: string;
  peakWeekMiles: number;
}) {
  const [range, setRange] = useState<Range>("recent");
  const currentYear = dataThrough.slice(0, 4);
  const points = useMemo<Point[]>(() => {
    if (range === "recent") {
      return weeks.slice(-8).map((week) => ({
        key: week.weekStart,
        label: formatRunDate(week.weekStart),
        miles: week.runMiles,
        longest: week.longRunMiles,
        detail: `Week of ${formatRunDate(week.weekStart)}: ${week.runMiles.toFixed(1)} miles across ${week.runDays} run days`,
      }));
    }
    if (range === "year") {
      return months.filter((month) => month.month.startsWith(currentYear)).map((month) => ({
        key: month.month,
        label: monthLabel(month.month),
        miles: month.runMiles,
        longest: month.longestRunMiles,
        detail: `${monthLabel(month.month)} ${currentYear}: ${month.runMiles.toFixed(1)} miles across ${month.runs} runs`,
      }));
    }
    return years.map((year) => ({
      key: year.year,
      label: year.year,
      miles: year.runMiles,
      longest: year.longestRunMiles,
      detail: `${year.year}: ${year.runMiles.toFixed(1)} miles across ${year.runs} runs and ${year.activities} total activities`,
    }));
  }, [currentYear, months, range, weeks, years]);
  const total = points.reduce((sum, point) => sum + point.miles, 0);
  const periodLabel = range === "recent" ? "recent 8 weeks" : range === "year" ? currentYear : "lifetime";

  return (
    <>
      <div className={styles.chartHeader}>
        <div>
          <span>{periodLabel} mileage</span>
          <strong>{total.toFixed(1)}</strong>
          <small> miles</small>
        </div>
        <div className={styles.chartActions}>
          <div className={styles.legend} aria-hidden="true">
            <span><i className={styles.barKey} />total miles</span>
            <span><i className={styles.lineKey} />longest run</span>
          </div>
          <div className={styles.rangeControls} aria-label="Chart range">
            {([
              ["recent", "8 weeks"],
              ["year", currentYear],
              ["all", "all time"],
            ] as const).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`${styles.rangeButton} ${range === value ? styles.rangeButtonActive : ""}`}
                aria-pressed={range === value}
                onClick={() => setRange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Chart points={points} />
      <div className={styles.chartFooter}>
        <span>{points[0]?.label} → {points.at(-1)?.label}</span>
        <span>peak week · {peakWeekMiles.toFixed(1)} mi</span>
        <span>through {formatRunDate(dataThrough, true)}</span>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { WeekPlanRow } from "./weekly-plan";
import styles from "./fitness.module.css";

const STORAGE_KEY = "fitness-expanded-week-plan";

function plannedTasks(row: WeekPlanRow) {
  return [...row.runTasks, ...row.otherTasks].filter((task) => !task.isExtra);
}

function planSummary(row: WeekPlanRow): string {
  return plannedTasks(row).map((task) => task.text).join(" + ") || "nothing planned";
}

export function ExpandedWeekPlan({ rows }: { rows: WeekPlanRow[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const element = detailsRef.current;
    if (!element) return;
    element.open = window.localStorage.getItem(STORAGE_KEY) === "open";
    const remember = () => window.localStorage.setItem(STORAGE_KEY, element.open ? "open" : "closed");
    element.addEventListener("toggle", remember);
    return () => element.removeEventListener("toggle", remember);
  }, []);

  return (
    <details className={styles.expandedWeek} ref={detailsRef}>
      <summary className={styles.expandedWeekToggle}>
        <span>
          <small>need the instructions?</small>
          <strong>expanded view</strong>
        </span>
        <span className={styles.expandedWeekHint}>pace, lifts, fuel, and reminders</span>
        <span className={styles.expandedWeekChevron} aria-hidden="true">↓</span>
      </summary>

      <div className={styles.expandedWeekBody}>
        <div className={styles.expandedWeekIntro}>
          <span>full week</span>
          <p>The useful details are here when I need them. The main plan stays clean.</p>
        </div>
        <div className={styles.expandedWeekDays}>
          {rows.map((row) => {
            const trackable = plannedTasks(row).filter((task) => task.trackable);
            const done = trackable.length > 0 && trackable.every((task) => task.actual != null);
            return (
              <article className={styles.expandedWeekDay} key={row.date}>
                <header>
                  <div>
                    <time dateTime={row.date}>{row.dayLabel}</time>
                    {row.isToday ? <span>today</span> : done ? <span>done</span> : null}
                  </div>
                  <strong>{planSummary(row)}</strong>
                </header>
                {row.details.length > 0 ? (
                  <ul>
                    {row.details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                ) : (
                  <p className={styles.expandedWeekNoNotes}>Nothing extra to remember.</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </details>
  );
}

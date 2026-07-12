#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MILES_PER_METER = 0.000621371;
const FEET_PER_METER = 3.28084;
const RACE = {
  name: "Richmond Marathon",
  date: "2026-11-14",
  distanceMi: 26.2,
  goalTime: "3:45:00",
  goalPace: "8:35 /mi",
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, "..");
const marathonRoot = path.resolve(
  process.env.MARATHON_REPO ?? path.join(siteRoot, "..", "marathonPrepBot"),
);
const outputPath = path.join(siteRoot, "content", "running-dashboard.json");

function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function isoDateFromLabel(label) {
  const date = new Date(`${label} 12:00:00 UTC`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Could not parse week date: ${label}`);
  }
  return date.toISOString().slice(0, 10);
}

function athleteDate(isoTimestamp) {
  const instant = new Date(isoTimestamp);
  const switchDate = new Date("2026-08-29T19:00:00.000Z");
  const timeZone = instant < switchDate
    ? "America/Los_Angeles"
    : "America/New_York";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

function paceSeconds(activity) {
  const miles = activity.distance * MILES_PER_METER;
  return miles > 0 ? Math.round(activity.moving_time / miles) : 0;
}

function zonePercent(activity, zones) {
  const total = (activity.hrZones ?? []).reduce(
    (sum, zone) => sum + (zone.seconds ?? 0),
    0,
  );
  if (!total) return null;
  const inZones = (activity.hrZones ?? [])
    .filter((zone) => zones.includes(zone.zone))
    .reduce((sum, zone) => sum + (zone.seconds ?? 0), 0);
  return Math.round((inZones / total) * 100);
}

function publicRun(activity, index) {
  const distanceMi = activity.distance * MILES_PER_METER;
  return {
    id: `run-${athleteDate(activity.start_date)}-${index + 1}`,
    date: athleteDate(activity.start_date),
    surface: activity.trainer ? "treadmill" : "outdoor",
    distanceMi: round(distanceMi, 2),
    movingMinutes: Math.round(activity.moving_time / 60),
    paceSecondsPerMile: paceSeconds(activity),
    averageHeartRate: activity.average_heartrate ?? null,
    elevationFeet: Math.round((activity.total_elevation_gain ?? 0) * FEET_PER_METER),
    temperatureF: activity.average_temp == null
      ? null
      : Math.round((activity.average_temp * 9) / 5 + 32),
    trainingLoad: activity.trimp ?? null,
    aerobicDecouplingPct: activity.decouplingPct == null
      ? null
      : round(activity.decouplingPct, 1),
    easyZonePct: zonePercent(activity, [1, 2]),
  };
}

async function main() {
  const profilePath = path.join(marathonRoot, "data", "athlete-profile.json");
  const activitiesDir = path.join(marathonRoot, "data", "activities");
  const profile = JSON.parse(await readFile(profilePath, "utf8"));

  const activityFiles = (await readdir(activitiesDir))
    .filter((name) => name.endsWith("_Run.json"))
    .sort()
    .reverse();

  const activities = await Promise.all(
    activityFiles.map(async (name) =>
      JSON.parse(await readFile(path.join(activitiesDir, name), "utf8")),
    ),
  );
  const runs = activities
    .filter((activity) => activity.type === "Run" && activity.distance > 0)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  if (!runs.length || !profile.weeks?.length) {
    throw new Error("The marathon repo does not contain usable running data.");
  }

  const weeks = profile.weeks.slice(-18).map((week) => ({
    weekStart: isoDateFromLabel(week.weekStarting),
    runMiles: round(week.runMiles ?? 0, 1),
    runDays: week.runDays ?? 0,
    longRunMiles: round(week.longRunMiles ?? 0, 1),
    liftDays: week.liftDays ?? 0,
    qualityRuns: week.qualityRuns ?? 0,
    averageHeartRate: week.avgRunHR ?? null,
    trainingLoad: week.sufferTotal ?? 0,
  }));
  const allWeeks = profile.weeks;
  const activeWeeks = allWeeks.filter((week) => (week.runMiles ?? 0) > 0);
  const totalMiles = allWeeks.reduce((sum, week) => sum + (week.runMiles ?? 0), 0);
  const totalRunDays = allWeeks.reduce((sum, week) => sum + (week.runDays ?? 0), 0);
  const latestWeek = weeks.at(-1);
  const recentRuns = runs.slice(0, 10).map(publicRun);
  const sourceGeneratedAt = profile.generatedAt ?? runs[0].start_date;

  const snapshot = {
    schemaVersion: 1,
    generatedAt: sourceGeneratedAt,
    dataThrough: recentRuns[0].date,
    race: RACE,
    totals: {
      runMiles: round(totalMiles, 1),
      runDays: totalRunDays,
      activeWeeks: activeWeeks.length,
      longestRunMiles: round(profile.longestRun ?? 0, 1),
      longestRunDate: isoDateFromLabel(profile.longestRunDate),
      peakWeekMiles: round(profile.peakWeekMiles ?? 0, 1),
      peakWeekStart: isoDateFromLabel(profile.peakWeekOf),
    },
    currentWeek: latestWeek,
    recentFourWeekMiles: round(
      weeks.slice(-4).reduce((sum, week) => sum + week.runMiles, 0),
      1,
    ),
    weeks,
    recentRuns,
  };

  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
  const forbiddenFields = [
    "start_latlng",
    "sourceFile",
    "injuryNotes",
    "keyRuns",
    "description",
    "latitude",
    "longitude",
  ];
  for (const field of forbiddenFields) {
    if (serialized.includes(field)) {
      throw new Error(`Privacy check failed: snapshot contains ${field}`);
    }
  }

  await writeFile(outputPath, serialized, "utf8");
  console.log(
    `Synced ${recentRuns.length} recent runs and ${weeks.length} weeks to ${path.relative(siteRoot, outputPath)}.`,
  );
  console.log("Privacy check passed: locations, source files, and private notes were excluded.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

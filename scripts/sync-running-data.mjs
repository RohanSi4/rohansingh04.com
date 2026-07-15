#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MILES_PER_METER = 0.000621371;
const FEET_PER_METER = 3.28084;
const DAY_MS = 86_400_000;
const RACE = {
  name: "Richmond Marathon",
  date: "2026-11-14",
  distanceMi: 26.2,
  goalTime: "3:45:00",
  goalPace: "8:35 /mi",
  trainingStart: "2026-06-22",
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

function parseDateLabel(label) {
  const date = new Date(`${label} 12:00:00 UTC`);
  if (Number.isNaN(date.getTime())) throw new Error(`Could not parse date: ${label}`);
  return date.toISOString().slice(0, 10);
}

function publicDate(isoTimestamp) {
  const instant = new Date(isoTimestamp);
  const summerStart = new Date("2026-05-25T00:00:00.000Z");
  const eastCoastReturn = new Date("2026-08-29T19:00:00.000Z");
  const timeZone = instant >= summerStart && instant < eastCoastReturn
    ? "America/Los_Angeles"
    : "America/New_York";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

function addDays(date, count) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}

function mondayFor(date) {
  const value = new Date(`${date}T12:00:00Z`);
  const offset = (value.getUTCDay() + 6) % 7;
  value.setUTCDate(value.getUTCDate() - offset);
  return value.toISOString().slice(0, 10);
}

function monthRange(firstMonth, lastMonth) {
  const months = [];
  const cursor = new Date(`${firstMonth}-01T12:00:00Z`);
  const end = new Date(`${lastMonth}-01T12:00:00Z`);
  while (cursor <= end) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
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

function publicRun(activity) {
  const distanceMi = activity.distance * MILES_PER_METER;
  const date = publicDate(activity.start_date);
  const identity = activity.key ?? `${activity.start_date}-${activity.type}-${activity.distance}`;
  const publicId = createHash("sha256").update(identity).digest("hex").slice(0, 12);
  return {
    id: `run-${publicId}`,
    date,
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

function genericActivityName(activity) {
  if (activity.type === "Run") return activity.trainer ? "Treadmill run" : "Outdoor run";
  const names = {
    WeightTraining: "Strength training",
    Workout: "Workout",
    Walk: "Walk",
    Ride: "Ride",
    Swim: "Swim",
    Hike: "Hike",
    Golf: "Golf",
    Basketball: "Basketball",
  };
  return names[activity.type] ?? "Workout";
}

function intensity(minutes) {
  if (minutes <= 0) return 0;
  if (minutes < 21) return 1;
  if (minutes < 41) return 2;
  if (minutes < 61) return 3;
  return 4;
}

function buildHealthSummary(activities, updatedAt) {
  const normalized = activities
    .filter((activity) => activity.start_date && activity.type)
    .map((activity) => ({
      date: publicDate(activity.start_date),
      sport: activity.type,
      name: genericActivityName(activity),
      movingMins: Math.max(0, Math.round((activity.moving_time ?? 0) / 60)),
      distanceMi: round((activity.distance ?? 0) * MILES_PER_METER, 2),
      calories: Math.max(0, Math.round(activity.calories ?? 0)),
      averageHeartRate: activity.average_heartrate == null
        ? null
        : Math.round(activity.average_heartrate),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const today = publicDate(new Date().toISOString());
  const byDate = new Map();
  for (const activity of normalized) {
    const bucket = byDate.get(activity.date) ?? {
      movingMins: 0,
      distanceMi: 0,
      calories: 0,
      sports: [],
    };
    bucket.movingMins += activity.movingMins;
    bucket.distanceMi += activity.distanceMi;
    bucket.calories += activity.calories;
    bucket.sports.push(activity.sport);
    byDate.set(activity.date, bucket);
  }

  const activeDates = [...byDate.entries()]
    .filter(([, bucket]) => bucket.movingMins > 0)
    .map(([date]) => date)
    .sort();
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);
  const previousMonthDate = new Date(`${month}-01T12:00:00Z`);
  previousMonthDate.setUTCMonth(previousMonthDate.getUTCMonth() - 1);
  const previousMonth = previousMonthDate.toISOString().slice(0, 7);
  const thisMonthDates = activeDates.filter((date) => date.startsWith(month));
  const previousMonthDates = activeDates.filter((date) => date.startsWith(previousMonth));
  const yearDates = activeDates.filter((date) => date.startsWith(year));

  let currentStreak = 0;
  let cursor = today;
  if (!byDate.get(cursor)?.movingMins) cursor = addDays(cursor, -1);
  while (byDate.get(cursor)?.movingMins > 0) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let bestStreak = 0;
  let streak = 0;
  let prior = null;
  for (const date of activeDates) {
    streak = prior && addDays(prior, 1) === date ? streak + 1 : 1;
    bestStreak = Math.max(bestStreak, streak);
    prior = date;
  }

  const heatmap = [];
  let heatDate = addDays(today, -364);
  for (let index = 0; index < 365; index += 1) {
    const bucket = byDate.get(heatDate);
    const minutes = bucket?.movingMins ?? 0;
    heatmap.push({
      date: heatDate,
      intensity: intensity(minutes),
      exerciseMinutes: minutes,
      sport: bucket?.sports.at(-1) ?? null,
      distanceMi: round(bucket?.distanceMi ?? 0, 1),
    });
    heatDate = addDays(heatDate, 1);
  }

  const weeklyMinutes = [0, 0, 0, 0];
  for (const [date, bucket] of byDate) {
    if (!date.startsWith(month)) continue;
    const day = Number(date.slice(-2)) - 1;
    weeklyMinutes[Math.min(3, Math.floor(day / 7))] += bucket.movingMins;
  }

  const sumForDates = (dates, field) => round(
    dates.reduce((sum, date) => sum + (byDate.get(date)?.[field] ?? 0), 0),
    field === "distanceMi" ? 1 : 0,
  );
  const latest = normalized[0] ?? null;
  const todayBucket = byDate.get(today);

  return {
    updatedAt,
    today: {
      exerciseMinutes: todayBucket?.movingMins ?? 0,
      activeCalories: todayBucket?.calories ?? 0,
      distanceMi: round(todayBucket?.distanceMi ?? 0, 1),
      sport: todayBucket?.sports.at(-1) ?? null,
    },
    lastActivity: latest
      ? {
          date: latest.date,
          sport: latest.sport,
          name: latest.name,
          movingMins: latest.movingMins,
          distanceMi: latest.distanceMi,
        }
      : null,
    streak: { currentDays: currentStreak, bestDays: bestStreak },
    thisMonth: {
      activeDays: thisMonthDates.length,
      activeDaysDeltaVsLastMonth: thisMonthDates.length - previousMonthDates.length,
      distanceMi: sumForDates(thisMonthDates, "distanceMi"),
      activeCalories: sumForDates(thisMonthDates, "calories"),
      weeklyMinutes,
    },
    thisYear: {
      distanceMi: sumForDates(yearDates, "distanceMi"),
      activeDays: yearDates.length,
    },
    allTime: {
      activeDays: activeDates.length,
      sinceDate: activeDates[0] ?? today,
    },
    recentActivities: normalized.slice(0, 15),
    heatmap,
  };
}

function trainingWeeks(profile) {
  return profile.weeks.map((week) => ({
    weekStart: parseDateLabel(week.weekStarting),
    runMiles: round(week.runMiles ?? 0, 1),
    runDays: week.runDays ?? 0,
    longRunMiles: round(week.longRunMiles ?? 0, 1),
    liftDays: week.liftDays ?? 0,
    qualityRuns: week.qualityRuns ?? 0,
    averageHeartRate: week.avgRunHR ?? null,
    trainingLoad: week.sufferTotal ?? 0,
  }));
}

function fillThroughCurrentWeek(weeks, currentDate) {
  const filled = weeks.map((week) => ({ ...week }));
  const currentWeekStart = mondayFor(currentDate);
  let nextWeekStart = filled.length > 0
    ? addDays(filled.at(-1).weekStart, 7)
    : currentWeekStart;
  while (nextWeekStart <= currentWeekStart) {
    filled.push({
      weekStart: nextWeekStart,
      runMiles: 0,
      runDays: 0,
      longRunMiles: 0,
      liftDays: 0,
      qualityRuns: 0,
      averageHeartRate: null,
      trainingLoad: 0,
    });
    nextWeekStart = addDays(nextWeekStart, 7);
  }
  return filled;
}

function validPlan(value) {
  return value && typeof value === "object"
    && typeof value.heading === "string"
    && Array.isArray(value.days)
    && value.days.every((day) => day
      && typeof day.date === "string"
      && typeof day.dayLabel === "string"
      && typeof day.text === "string"
      && typeof day.isKeyDay === "boolean");
}

async function runningPlan() {
  if (process.env.RUNNING_DASHBOARD_PLAN) {
    try {
      const plan = JSON.parse(process.env.RUNNING_DASHBOARD_PLAN);
      return validPlan(plan) ? plan : null;
    } catch {
      return null;
    }
  }
  try {
    const previous = JSON.parse(await readFile(outputPath, "utf8"));
    return validPlan(previous.trainingPlan) ? previous.trainingPlan : null;
  } catch {
    return null;
  }
}

async function localEnvValue(name) {
  const contents = await readFile(path.join(siteRoot, ".env.local"), "utf8").catch(() => "");
  const line = contents.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  if (!line) return undefined;
  const value = line.slice(name.length + 1).trim();
  const quote = value[0];
  return (quote === "\"" || quote === "'") && value.at(-1) === quote
    ? value.slice(1, -1)
    : value;
}

async function publishSnapshot(serialized) {
  const configuredTokens = [
    process.env.RUNNING_DASHBOARD_TOKEN,
    process.env.HEALTH_INGEST_TOKEN,
    process.env.CRON_SECRET,
    await localEnvValue("RUNNING_DASHBOARD_TOKEN"),
    await localEnvValue("HEALTH_INGEST_TOKEN"),
    await localEnvValue("CRON_SECRET"),
  ].filter(Boolean);
  if (configuredTokens.length === 0) {
    throw new Error("Cannot publish: no dashboard automation token is configured.");
  }

  const url = process.env.RUNNING_DASHBOARD_URL
    ?? "https://rohansingh04.com/api/running/ingest";
  // `vercel env pull` can leave an unmatched quote in a local value even though
  // Vercel's deployed value is normalized. Try the exact local representation
  // first, then the safely de-quoted representation only on an auth failure.
  const tokenCandidates = [];
  for (const token of configuredTokens) {
    tokenCandidates.push(token);
    if ((token.startsWith("\"") || token.startsWith("'")) && token.at(-1) !== token[0]) {
      tokenCandidates.push(token.slice(1));
    }
  }
  let response;
  for (const candidate of [...new Set(tokenCandidates)]) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${candidate}`,
        "content-type": "application/json",
      },
      body: serialized,
    });
    if (response.status !== 401) break;
  }
  if (!response) throw new Error("Dashboard publish failed before making a request.");
  if (!response.ok) {
    throw new Error(`Dashboard publish failed: ${response.status} ${await response.text()}`);
  }
  console.log(`Published the fresh snapshot to ${url}.`);
}

async function main() {
  const publishOnly = process.argv.includes("--publish-only");
  const shouldPublish = publishOnly || process.argv.includes("--publish");
  const profilePath = path.join(marathonRoot, "data", "athlete-profile.json");
  const activitiesDir = path.join(marathonRoot, "data", "activities");
  const profile = JSON.parse(await readFile(profilePath, "utf8"));
  const activityFiles = (await readdir(activitiesDir))
    .filter((name) => name.endsWith(".json"))
    .sort();
  const activities = (await Promise.all(
    activityFiles.map(async (name) =>
      JSON.parse(await readFile(path.join(activitiesDir, name), "utf8")),
    ),
  )).filter((activity) => activity.start_date && activity.type);
  const runs = activities
    .filter((activity) => activity.type === "Run" && activity.distance > 0)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));

  if (!runs.length || !profile.weeks?.length) {
    throw new Error("The marathon repo does not contain usable running data.");
  }

  const allRuns = runs.map(publicRun);
  const recentRuns = allRuns.slice(0, 12);
  const sourceGeneratedAt = new Date().toISOString();
  const today = publicDate(sourceGeneratedAt);
  const weeks = fillThroughCurrentWeek(trainingWeeks(profile), today);
  const weekBuckets = new Map();
  for (const run of allRuns) {
    const weekStart = mondayFor(run.date);
    const bucket = weekBuckets.get(weekStart) ?? { runMiles: 0, runs: 0, longestRunMiles: 0 };
    bucket.runMiles += run.distanceMi;
    bucket.runs += 1;
    bucket.longestRunMiles = Math.max(bucket.longestRunMiles, run.distanceMi);
    weekBuckets.set(weekStart, bucket);
  }

  const monthBuckets = new Map();
  const yearBuckets = new Map();
  for (const run of allRuns) {
    const month = run.date.slice(0, 7);
    const year = run.date.slice(0, 4);
    for (const [map, key] of [[monthBuckets, month], [yearBuckets, year]]) {
      const bucket = map.get(key) ?? { runMiles: 0, runs: 0, activeDates: new Set(), longestRunMiles: 0 };
      bucket.runMiles += run.distanceMi;
      bucket.runs += 1;
      bucket.activeDates.add(run.date);
      bucket.longestRunMiles = Math.max(bucket.longestRunMiles, run.distanceMi);
      map.set(key, bucket);
    }
  }

  const activityYears = new Map();
  for (const activity of activities) {
    const year = publicDate(activity.start_date).slice(0, 4);
    activityYears.set(year, (activityYears.get(year) ?? 0) + 1);
  }
  const firstRunDate = allRuns.at(-1).date;
  const dataThrough = allRuns[0].date;
  const monthlyHistory = monthRange(firstRunDate.slice(0, 7), dataThrough.slice(0, 7)).map((month) => {
    const bucket = monthBuckets.get(month);
    return {
      month,
      runMiles: round(bucket?.runMiles ?? 0, 1),
      runs: bucket?.runs ?? 0,
      longestRunMiles: round(bucket?.longestRunMiles ?? 0, 1),
    };
  });
  const firstYear = Number(firstRunDate.slice(0, 4));
  const lastYear = Number(dataThrough.slice(0, 4));
  const yearlyHistory = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const year = String(firstYear + index);
    const bucket = yearBuckets.get(year);
    return {
      year,
      runMiles: round(bucket?.runMiles ?? 0, 1),
      runs: bucket?.runs ?? 0,
      runDays: bucket?.activeDates.size ?? 0,
      longestRunMiles: round(bucket?.longestRunMiles ?? 0, 1),
      activities: activityYears.get(year) ?? 0,
    };
  });
  const peakWeek = [...weekBuckets.entries()].sort((a, b) => b[1].runMiles - a[1].runMiles)[0];
  const longestRun = [...allRuns].sort((a, b) => b.distanceMi - a.distanceMi)[0];
  const activeRunDates = new Set(allRuns.map((run) => run.date));
  const currentWeekStart = mondayFor(today);
  const currentWeek = weeks.find((week) => week.weekStart === currentWeekStart) ?? weeks.at(-1);
  const trainingPlan = await runningPlan();

  const snapshot = {
    schemaVersion: 2,
    generatedAt: sourceGeneratedAt,
    dataThrough,
    race: RACE,
    totals: {
      runMiles: round(allRuns.reduce((sum, run) => sum + run.distanceMi, 0), 1),
      totalRuns: allRuns.length,
      runDays: activeRunDates.size,
      activeWeeks: weekBuckets.size,
      trackedSince: firstRunDate,
      longestRunMiles: round(longestRun.distanceMi, 1),
      longestRunDate: longestRun.date,
      peakWeekMiles: round(peakWeek[1].runMiles, 1),
      peakWeekStart: peakWeek[0],
      totalActivities: activities.length,
    },
    currentWeek,
    recentFourWeekMiles: round(
      weeks.slice(-4).reduce((sum, week) => sum + week.runMiles, 0),
      1,
    ),
    weeks,
    monthlyHistory,
    yearlyHistory,
    recentRuns,
    trainingPlan,
    health: buildHealthSummary(activities, sourceGeneratedAt),
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
    if (serialized.includes(field)) throw new Error(`Privacy check failed: snapshot contains ${field}`);
  }

  if (!publishOnly) {
    await writeFile(outputPath, serialized, "utf8");
    console.log(
      `Synced ${allRuns.length} runs, ${activities.length} activities, and ${yearlyHistory.length} years to ${path.relative(siteRoot, outputPath)}.`,
    );
  } else {
    console.log(
      `Built ${allRuns.length} runs, ${activities.length} activities, and ${yearlyHistory.length} years for live publishing.`,
    );
  }
  console.log("Privacy check passed: locations, source files, descriptions, and private notes were excluded.");

  if (shouldPublish) await publishSnapshot(serialized);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

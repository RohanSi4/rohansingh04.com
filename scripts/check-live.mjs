const site = "https://rohansingh04.com";
// The model service behind Shortlist. Every recommendation on that demo depends on
// it, and it lives off-Vercel, so nothing else in this file would notice it dying.
const shortlistApi = "https://moviereccomendersystem-uxol.onrender.com";
const forbiddenCopy = /72[- ]?(tracks?|songs?)|demo catalog|offline demo|synthetic demo/i;
const jsonMode = process.argv.includes("--json");

const checks = [
  { url: `${site}/`, includes: ["Today", "quick morning weight"] },
  { url: `${site}/projects`, includes: ["Marathon Prep Bot", "Shortlist", "Today"] },
  { url: `${site}/projects/marathon-prep-bot`, includes: ["More than 1,300 workouts", "From a workout to a useful week"] },
  { url: `${site}/projects/health-tracker-ios`, includes: ["700+ exercise catalog", "what becomes live on the site"] },
  { url: `${site}/projects/spotify-recommender`, includes: ["Spotify's real catalog", "five invited listeners"] },
  { url: `${site}/resume`, includes: ["selected projects", "Marathon Prep Bot", "Today"] },
  { url: `${site}/fitness`, includes: ["fitness"] },
  { url: `${site}/projects/today-home.png` },
  { url: `${site}/projects/spotify-signal.png` },
  { url: `${site}/projects/parking-shark-home.png` },
  { url: `${site}/api/spotify` },
  { url: `${site}/api/health/summary` },
  { url: "https://signal-recommender.vercel.app" },
  { url: "https://movie-reccomender-system-red.vercel.app" },
  { url: "https://parking-shark.vercel.app" },
  { url: "https://health-recap.vercel.app" },
  // The Shortlist frontend is a static shell on Vercel and returns 200 whether or
  // not the model is reachable, so checking it proved almost nothing. The ML
  // backend was not checked at all, which meant the "demo up" badge could be
  // truthful while every recommendation on the page was failing. These two check
  // the thing that actually breaks.
  //
  // The generous timeout is deliberate, not padding. This runs on a free tier that
  // spins down when idle, and a measured cold start took 32s. Timing out at 15s
  // would report a service that works as down; the honest failure is "did not
  // answer at all", not "was asleep".
  {
    url: `${shortlistApi}/health`,
    includes: ['"retrieval_ready":true', '"catalog_size":89585'],
    timeoutMs: 60_000,
  },
  {
    url: `${shortlistApi}/rank`,
    method: "POST",
    body: JSON.stringify({ movie_ids: [79132, 109487, 130219] }),
    // Assert a real ranking came back, not just a 200 with an empty list.
    includes: ['"strategy":"two_tower_taste_mix"', '"title"', '"score"'],
    timeoutMs: 60_000,
  },
];

async function fetchWithRetry(url, attempts = 3, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(options.timeoutMs ?? 15_000),
        method: options.method ?? "GET",
        body: options.body,
        headers: {
          "user-agent": "rohansingh04-live-check/1.0",
          ...(options.body ? { "content-type": "application/json" } : {}),
        },
      });
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
      lastError.liveCheckStatus = response.status;
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError;
}

async function runCheck(check) {
  const response = await fetchWithRetry(check.url, check.attempts ?? 3, {
    timeoutMs: check.timeoutMs,
    method: check.method,
    body: check.body,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const isText = contentType.includes("text") || contentType.includes("json");
  const body = isText ? await response.text() : "";

  for (const expected of check.includes ?? []) {
    if (!body.includes(expected)) {
      const error = new Error(`${check.url} is missing expected copy: ${expected}`);
      error.liveCheckStatus = response.status;
      throw error;
    }
  }
  if (check.url.startsWith(site) && isText && forbiddenCopy.test(body)) {
    const error = new Error(`${check.url} contains stale Signal wording`);
    error.liveCheckStatus = response.status;
    throw error;
  }
  return response;
}

if (jsonMode) {
  const results = [];
  for (const check of checks) {
    try {
      const response = await runCheck(check);
      results.push({ url: check.url, ok: true, status: response.status });
    } catch (error) {
      const status = typeof error?.liveCheckStatus === "number" ? error.liveCheckStatus : null;
      results.push({ url: check.url, ok: false, status });
      console.error(`fail ${check.url}: ${error?.message ?? error}`);
    }
  }
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  process.exitCode = results.every((result) => result.ok) ? 0 : 1;
} else {
  for (const check of checks) {
    const response = await runCheck(check);
    console.log(`ok ${response.status} ${check.url}`);
  }
  console.log(`live check passed for ${checks.length} URLs`);
}

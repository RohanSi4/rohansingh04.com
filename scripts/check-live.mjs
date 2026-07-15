const site = "https://rohansingh04.com";
const forbiddenCopy = /72[- ]?(tracks?|songs?)|demo catalog|offline demo|synthetic demo/i;

const checks = [
  { url: `${site}/`, includes: ["Signal", "music worth playing next"] },
  { url: `${site}/projects`, includes: ["Marathon Prep Bot", "Movie Recommender", "Signal"] },
  { url: `${site}/projects/marathon-prep-bot`, includes: ["More than 1,300 workouts", "From a workout to a useful week"] },
  { url: `${site}/projects/spotify-recommender`, includes: ["Spotify's real catalog", "five invited listeners"] },
  { url: `${site}/resume`, includes: ["selected projects", "Marathon Prep Bot"] },
  { url: `${site}/fitness`, includes: ["fitness"] },
  { url: `${site}/projects/spotify-signal.png` },
  { url: `${site}/projects/parking-shark-home.png` },
  { url: `${site}/api/spotify` },
  { url: `${site}/api/health/summary` },
  { url: "https://signal-recommender.vercel.app" },
  { url: "https://movie-reccomender-system-red.vercel.app" },
  { url: "https://parking-shark.vercel.app" },
  { url: "https://health-recap.vercel.app" },
];

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "rohansingh04-live-check/1.0" },
      });
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError;
}

for (const check of checks) {
  const response = await fetchWithRetry(check.url);
  const contentType = response.headers.get("content-type") ?? "";
  const isText = contentType.includes("text") || contentType.includes("json");
  const body = isText ? await response.text() : "";

  for (const expected of check.includes ?? []) {
    if (!body.includes(expected)) {
      throw new Error(`${check.url} is missing expected copy: ${expected}`);
    }
  }
  if (check.url.startsWith(site) && isText && forbiddenCopy.test(body)) {
    throw new Error(`${check.url} contains stale Signal wording`);
  }
  console.log(`ok ${response.status} ${check.url}`);
}

console.log(`live check passed for ${checks.length} URLs`);

import { afterEach, expect, test, vi } from "vitest";
import { checks, runCheck } from "./check-live.mjs";

afterEach(() => vi.unstubAllGlobals());

const marathon = checks.find((check) => check.url.endsWith("/projects/marathon-prep-bot"));

test("updated archive counts and headings do not report downtime", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(
    '<h1>Marathon Prep Bot</h1><p>HealthFit exports more than 1,400 workouts.</p><a href="/fitness">Progress</a>',
    { headers: { "content-type": "text/html" } },
  )));
  await expect(runCheck(marathon)).resolves.toHaveProperty("status", 200);
});

test("a 200 response with the wrong page still fails", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("<h1>Not found</h1>", {
    headers: { "content-type": "text/html" },
  })));
  await expect(runCheck(marathon)).rejects.toThrow("missing expected copy");
});

test("HTTP failures still fail the monitor", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("Unavailable", { status: 503 })));
  await expect(runCheck({ ...marathon, attempts: 1 })).rejects.toThrow("returned 503");
});

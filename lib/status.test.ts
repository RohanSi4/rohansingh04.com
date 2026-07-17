import { describe, expect, it } from "vitest";
import { normalizeDemoUrl, parseStatus, relativeCheckTime } from "./status";

const generatedAt = "2026-07-17T12:00:00.000Z";

describe("parseStatus", () => {
  it("maps a valid payload by normalized url", () => {
    const map = parseStatus({
      generatedAt,
      results: [
        { url: "https://demo.example/", ok: true, status: 200 },
        { url: "https://down.example", ok: false, status: 500 },
      ],
    });

    expect(map).not.toBeNull();
    expect(map?.get("https://demo.example")).toEqual({ ok: true, generatedAt });
    expect(map?.get("https://down.example")?.ok).toBe(false);
  });

  it("skips malformed rows but keeps good ones", () => {
    const map = parseStatus({
      generatedAt,
      results: [
        null,
        { url: 42, ok: true },
        { url: "https://demo.example", ok: "yes" },
        { url: "https://demo.example", ok: true, status: 200 },
      ],
    });

    expect(map?.size).toBe(1);
    expect(map?.get("https://demo.example")?.ok).toBe(true);
  });

  it.each([
    ["null", null],
    ["a string", "nope"],
    ["missing results", { generatedAt }],
    ["non-array results", { generatedAt, results: {} }],
    ["bad generatedAt", { generatedAt: "not a date", results: [] }],
    ["empty results", { generatedAt, results: [] }],
    ["only malformed rows", { generatedAt, results: [{ ok: true }] }],
  ])("returns null for %s", (_label, payload) => {
    expect(parseStatus(payload)).toBeNull();
  });
});

describe("normalizeDemoUrl", () => {
  it("strips trailing slashes only", () => {
    expect(normalizeDemoUrl("https://demo.example/")).toBe("https://demo.example");
    expect(normalizeDemoUrl("https://demo.example/app/")).toBe("https://demo.example/app");
    expect(normalizeDemoUrl("https://demo.example")).toBe("https://demo.example");
  });
});

describe("relativeCheckTime", () => {
  const now = Date.parse(generatedAt);

  it("floors to minutes, hours, then days", () => {
    expect(relativeCheckTime(generatedAt, now + 30_000)).toBe("just now");
    expect(relativeCheckTime(generatedAt, now + 5 * 60_000)).toBe("5m ago");
    expect(relativeCheckTime(generatedAt, now + 3 * 3_600_000)).toBe("3h ago");
    expect(relativeCheckTime(generatedAt, now + 72 * 3_600_000)).toBe("3d ago");
  });

  it("degrades to 'recently' on bad input", () => {
    expect(relativeCheckTime("not a date", now)).toBe("recently");
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const corePages = [
  { path: "/", heading: "I like making things I actually want to use." },
  { path: "/projects", heading: "Things I've built on my own and with good people." },
  { path: "/projects/marathon-prep-bot", heading: "Marathon Prep Bot" },
  { path: "/projects/spotify-recommender", heading: "Signal" },
  { path: "/resume", heading: "Rohan Singh" },
] as const;

for (const entry of corePages) {
  test(`${entry.path} renders without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(entry.path);
    await expect(page.getByRole("heading", { level: 1, name: entry.heading })).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });

  test(`${entry.path} has no detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(entry.path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("featured projects show current proof and working calls to action", async ({ page }) => {
  await page.goto("/projects/marathon-prep-bot");
  await expect(page.getByText("Solo builder and the runner using it every week")).toBeVisible();
  await expect(page.getByText("1,300+", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /try it/i })).toHaveAttribute("href", "/fitness");
  await expect(page.getByText(/working code stays private/i)).toBeVisible();

  await page.goto("/projects/spotify-recommender");
  await expect(page.getByText(/Searches Spotify's real catalog/)).toBeVisible();
  await expect(page.getByRole("link", { name: /open the demo/i })).toHaveAttribute(
    "href",
    "https://signal-recommender.vercel.app",
  );
  await expect(page.locator("body")).not.toContainText(/72[- ]?(tracks?|songs?)/i);
});

for (const path of ["/projects/marathon-prep-bot", "/projects/spotify-recommender"]) {
  test(`${path} keeps the project title aligned with its proof`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);

    const title = await page.getByRole("heading", { level: 1 }).boundingBox();
    const proof = await page.getByLabel("Project proof").boundingBox();

    expect(title).not.toBeNull();
    expect(proof).not.toBeNull();
    expect(Math.abs((title?.y ?? 0) - (proof?.y ?? 0))).toBeLessThan(120);
  });
}

test("the portfolio and project pages use distinct tab icons", async ({ page }) => {
  const paths = [
    "/",
    "/projects/marathon-prep-bot",
    "/projects/movie-recommender",
    "/projects/spotify-recommender",
    "/projects/parking-shark",
    "/projects/personal-site",
    "/projects/health-tracker-ios",
  ];
  const icons = new Set<string>();

  for (const path of paths) {
    await page.goto(path);
    const href = await page.locator('link[rel="icon"]').getAttribute("href");
    expect(href).toBeTruthy();
    icons.add(href ?? "");
  }

  expect(icons.size).toBe(paths.length);
});

test("the homepage portrait appears in the first mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const portrait = page.getByRole("img", {
    name: "Illustrated portrait of Rohan wearing sunglasses",
  });
  const bounds = await portrait.boundingBox();

  await expect(portrait).toBeVisible();
  expect(bounds).not.toBeNull();
  expect((bounds?.y ?? 844) + (bounds?.height ?? 0)).toBeLessThanOrEqual(844);
});

test("web resume includes the selected project proof", async ({ page }) => {
  await page.goto("/resume");
  const projects = page.getByRole("heading", { level: 2, name: "selected projects" });
  await expect(projects).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Marathon Prep Bot" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Movie Recommender" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Signal" })).toBeVisible();
});

test("keyboard users can skip the header", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "skip to content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile navigation opens and reaches the project page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "open menu" }).click();
  const navigation = page.getByRole("navigation", { name: "site navigation" });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

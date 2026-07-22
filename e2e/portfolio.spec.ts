import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const corePages = [
  { path: "/", heading: "I like making things I actually want to use." },
  { path: "/projects", heading: "Things I've built on my own and with good people." },
  { path: "/projects/marathon-prep-bot", heading: "Marathon Prep Bot" },
  { path: "/projects/health-tracker-ios", heading: "Today" },
  { path: "/projects/spotify-recommender", heading: "Signal" },
  { path: "/notes", heading: "Things worth writing down." },
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

  await page.goto("/projects/health-tracker-ios");
  await expect(page.getByText(/native app, encrypted sync, and public\/private data contract/)).toBeVisible();
  await expect(page.getByText(/700\+ exercise catalog/)).toBeVisible();
  await expect(page.getByRole("link", { name: /try it/i })).toHaveAttribute("href", "/fitness");
  await expect(page.getByRole("link", { name: /see the code/i })).toHaveAttribute(
    "href",
    "https://github.com/RohanSi4/today-fitness-ios",
  );
});

for (const path of ["/projects/marathon-prep-bot", "/projects/health-tracker-ios"]) {
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

test("notes render the essay and the way back", async ({ page }) => {
  await page.goto("/notes/llm-marathon-coach");
  await expect(
    page.getByRole("heading", { level: 1, name: "My marathon coach is a chat window" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "← all notes" }).first()).toBeVisible();
});

test("web resume includes the selected project proof", async ({ page }) => {
  await page.goto("/resume");
  const projects = page.getByRole("heading", { level: 2, name: "selected projects" });
  await expect(projects).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Marathon Prep Bot" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Shortlist" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Today" })).toBeVisible();
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

test("fitness keeps the weekly plan compact until the expanded view is opened", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fitness");

  const expandedView = page.getByText("expanded view", { exact: true });
  await expect(expandedView).toBeVisible();
  await expect(page.getByText("full week", { exact: true })).toBeHidden();

  await expandedView.click();
  await expect(page.getByText("full week", { exact: true })).toBeVisible();
  await expect(page.getByText("Bring cold water.", { exact: true })).toBeVisible();
  await expect(page.getByText("Take gels around 35, 70, and 100 minutes.", { exact: true })).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

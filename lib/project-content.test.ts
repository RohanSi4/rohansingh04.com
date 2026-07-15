import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ProjectMeta } from "./types";

const root = process.cwd();
const projectsRoot = path.join(root, "content", "projects");
const projectDirectories = fs
  .readdirSync(projectsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function projectMeta(directory: string): ProjectMeta {
  return JSON.parse(
    fs.readFileSync(path.join(projectsRoot, directory, "meta.json"), "utf8"),
  ) as ProjectMeta;
}

function internalRouteExists(url: string): boolean {
  const route = url.split(/[?#]/, 1)[0];
  if (route === "/") return fs.existsSync(path.join(root, "app", "page.tsx"));
  const segments = route.replace(/^\//, "").split("/").filter(Boolean);
  return fs.existsSync(path.join(root, "app", ...segments, "page.tsx"));
}

describe("project portfolio content", () => {
  it("keeps metadata, folders, and case-study routes in sync", () => {
    const slugs = new Set<string>();

    for (const directory of projectDirectories) {
      const metaPath = path.join(projectsRoot, directory, "meta.json");
      const mdxPath = path.join(projectsRoot, directory, "index.mdx");
      expect(fs.existsSync(metaPath), `${directory} is missing meta.json`).toBe(true);
      expect(fs.existsSync(mdxPath), `${directory} is missing index.mdx`).toBe(true);

      const meta = projectMeta(directory);
      expect(meta.slug, `${directory} has an empty slug`).toBe(directory);
      expect(slugs.has(meta.slug), `duplicate project slug: ${meta.slug}`).toBe(false);
      slugs.add(meta.slug);

      expect(meta.title.trim().length, `${directory} has an empty title`).toBeGreaterThan(0);
      expect(meta.summary.trim().length, `${directory} has a thin summary`).toBeGreaterThan(80);
      expect(meta.outcome.trim().length, `${directory} has a thin outcome`).toBeGreaterThan(40);
      expect(meta.role.trim().length, `${directory} has no role`).toBeGreaterThan(10);
      expect(meta.proofPoints.length, `${directory} needs two or three proof points`).toBeGreaterThanOrEqual(2);
      expect(meta.proofPoints.length, `${directory} needs two or three proof points`).toBeLessThanOrEqual(3);
      for (const point of meta.proofPoints) {
        expect(point.trim().length, `${directory} has a thin proof point`).toBeGreaterThan(25);
      }
      expect(meta.tags.length, `${directory} has no technology tags`).toBeGreaterThan(0);
      expect(meta.startDate, `${directory} has an invalid start date`).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);

      if (meta.endDate) {
        expect(meta.endDate, `${directory} has an invalid end date`).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
        expect(meta.endDate >= meta.startDate, `${directory} ends before it starts`).toBe(true);
      }
      if (meta.status === "in-progress") {
        expect(meta.endDate, `${directory} is in progress but has an end date`).toBeNull();
      }

      const caseStudy = fs.readFileSync(mdxPath, "utf8");
      expect(caseStudy.trim().length, `${directory} case study is too thin`).toBeGreaterThan(300);
    }
  });

  it("keeps project proof links and screenshots resolvable", () => {
    for (const directory of projectDirectories) {
      const meta = projectMeta(directory);
      const caseStudy = fs.readFileSync(
        path.join(projectsRoot, directory, "index.mdx"),
        "utf8",
      );

      expect(meta.liveUrl, `${directory} has no working-product proof link`).toBeTruthy();
      if (meta.liveUrl?.startsWith("/")) {
        expect(internalRouteExists(meta.liveUrl), `${directory} points to missing route ${meta.liveUrl}`).toBe(true);
      } else {
        expect(meta.liveUrl, `${directory} demo must use HTTPS`).toMatch(/^https:\/\//);
      }

      if (meta.githubUrl) {
        expect(meta.githubUrl, `${directory} code link must use HTTPS`).toMatch(/^https:\/\/github\.com\//);
      }

      const markdownTargets = [...caseStudy.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
        .map((match) => match[1])
        .filter((target) => target.startsWith("/"));

      for (const target of markdownTargets) {
        const publicPath = path.join(root, "public", target.replace(/^\//, ""));
        expect(fs.existsSync(publicPath), `${directory} references missing proof asset ${target}`).toBe(true);
        expect(fs.statSync(publicPath).size, `${target} is unexpectedly small`).toBeGreaterThan(10_000);
      }

      const internalLinks = [...caseStudy.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)]+)\)/g)]
        .map((match) => match[1]);
      for (const target of internalLinks) {
        expect(internalRouteExists(target), `${directory} points to missing route ${target}`).toBe(true);
      }
    }
  });

  it("keeps the featured section to the intended three-project layout", () => {
    const featured = projectDirectories.filter((directory) => projectMeta(directory).featured);
    expect(featured).toHaveLength(3);
  });

  it("keeps private Marathon data out of public project content", () => {
    const meta = projectMeta("marathon-prep-bot");
    const caseStudy = fs.readFileSync(
      path.join(projectsRoot, "marathon-prep-bot", "index.mdx"),
      "utf8",
    );
    const publicCopy = JSON.stringify(meta) + caseStudy;
    const privateFields = [
      "start_latlng",
      "sourceFile",
      "injuryNotes",
      "latitude",
      "longitude",
    ];
    for (const field of privateFields) {
      expect(publicCopy, `Marathon content exposes private field ${field}`).not.toContain(field);
    }
    expect(meta.githubUrl, "Marathon code must remain private").toBeNull();
  });
});

import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/content";
import { getAllNotes } from "@/lib/notes";

const base = "https://rohansingh04.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentUpdated = new Date("2026-07-17");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: contentUpdated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/fitness`, lastModified: contentUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/projects`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/notes`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/history`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resume`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/now`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/globe`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/travel-list`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/states`, lastModified: contentUpdated, changeFrequency: "monthly", priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((project) => ({
    url: `${base}/projects/${project.slug}`,
    lastModified: contentUpdated,
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }));

  const noteRoutes: MetadataRoute.Sitemap = getAllNotes().map((note) => ({
    url: `${base}/notes/${note.slug}`,
    lastModified: new Date(note.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...noteRoutes];
}

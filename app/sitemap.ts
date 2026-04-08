import type { MetadataRoute } from "next";

const base = "https://rohansingh04.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/history`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/now`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/globe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/travel-list`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/states`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { getProjectMeta, getAllProjects } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import { getStaticRunningDashboard } from "@/lib/running";
import { getDemoStatus, normalizeDemoUrl, relativeCheckTime } from "@/lib/status";
import { ProjectVisual } from "@/components/projects/ProjectFeatureCard";
import MarathonArchitecture from "@/components/projects/MarathonArchitecture";

const statusLabel = {
  "in-progress": "still working on this",
  shipped: "finished for now",
  archived: "older project",
} as const;

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getProjectMeta(slug);
  if (!meta) return { title: "not found" };
  // og/twitter images intentionally omitted: the colocated opengraph-image.tsx
  // file convention has higher priority and supplies a per-project image
  return {
    title: meta.title,
    description: meta.summary,
    alternates: { canonical: `/projects/${meta.slug}` },
    openGraph: {
      title: `${meta.title} | Rohan Singh`,
      description: meta.summary,
      url: `/projects/${meta.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | Rohan Singh`,
      description: meta.summary,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const meta = getProjectMeta(slug);
  if (!meta) notFound();

  const mdxPath = path.join(process.cwd(), "content", "projects", slug, "index.mdx");
  if (!fs.existsSync(mdxPath)) notFound();
  const source = fs.readFileSync(mdxPath, "utf-8");
  const { content } = await compileMDX({ source, options: { parseFrontmatter: true } });
  const running = meta.slug === "marathon-prep-bot" ? getStaticRunningDashboard() : null;

  const isExternalDemo = Boolean(meta.liveUrl?.startsWith("http"));
  const demoStatus = isExternalDemo ? await getDemoStatus() : null;
  const demoEntry = isExternalDemo && meta.liveUrl
    ? demoStatus?.get(normalizeDemoUrl(meta.liveUrl))
    : undefined;

  const projectSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: meta.title,
    description: meta.summary,
    url: `https://rohansingh04.com/projects/${meta.slug}`,
    author: {
      "@type": "Person",
      name: "Rohan Singh",
      url: "https://rohansingh04.com",
    },
  };
  if (meta.githubUrl) {
    projectSchema.codeRepository = meta.githubUrl;
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema).replace(/</g, "\\u003c") }}
      />
      <header className="site-container page-section pb-10 sm:pb-14">
        <Link href="/projects" className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-fg">← all projects</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.75fr)] lg:items-start lg:gap-16">
          <div className="lg:pt-2">
            <p className="eyebrow mb-4">{statusLabel[meta.status]} · {formatDateRange(meta.startDate, meta.endDate)}</p>
            <h1 className="page-title">{meta.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{meta.summary}</p>
          </div>
          <aside
            aria-label="Project proof"
            className="rounded-2xl border border-border bg-surface/45 p-5 sm:p-7"
          >
            <p className="border-l-2 border-warm pl-4 text-sm font-medium leading-relaxed text-fg sm:text-base">{meta.outcome}</p>
            <dl className="mt-6 border-t border-border pt-5">
              <div>
                <dt className="eyebrow">my role</dt>
                <dd className="mt-2 text-sm leading-relaxed text-fg">{meta.role}</dd>
              </div>
              <div className="mt-5">
                <dt className="eyebrow">proof</dt>
                <dd>
                  <ul className="mt-2 space-y-2">
                    {meta.proofPoints.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-relaxed text-muted">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {meta.tags.map((tag) => <span key={tag} className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted">{tag}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {meta.liveUrl && (meta.liveUrl.startsWith("/") ? (
                <Link href={meta.liveUrl} className="button-primary">try it <span aria-hidden="true">↗</span></Link>
              ) : (
                <a href={meta.liveUrl} target="_blank" rel="noopener noreferrer" className="button-primary">open the demo <span aria-hidden="true">↗</span></a>
              ))}
              {meta.githubUrl && <a href={meta.githubUrl} target="_blank" rel="noopener noreferrer" className="button-secondary">see the code <span aria-hidden="true">↗</span></a>}
            </div>
            {demoEntry?.ok && (
              <p className="mt-3 flex items-center gap-2 font-mono text-[10px] text-muted">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                demo up · checked {relativeCheckTime(demoEntry.generatedAt)}
              </p>
            )}
            {meta.slug === "marathon-prep-bot" && (
              <p className="mt-4 text-xs leading-relaxed text-muted">
                The working code stays private because the repository contains raw
                health, timestamp, and location data.
              </p>
            )}
          </aside>
        </div>
      </header>

      <div className="site-container overflow-hidden rounded-2xl border border-border [&>div]:min-h-[22rem]">
        <ProjectVisual visual={meta.visual} />
      </div>

      {running && (
        <MarathonArchitecture
          totalActivities={running.totals.totalActivities}
          runMiles={running.totals.runMiles}
          trackedSince={running.totals.trackedSince}
        />
      )}

      <div className="content-container pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="text-[0.98rem] leading-7 text-muted [&>h2:first-child]:mt-0 [&_a]:font-medium [&_a]:text-accent-dim [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg [&_img]:my-8 [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_li]:mb-2 [&_p]:mb-5 [&_p]:leading-7 [&_pre]:mb-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface [&_pre]:p-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6">
          {content}
        </div>
      </div>
    </article>
  );
}

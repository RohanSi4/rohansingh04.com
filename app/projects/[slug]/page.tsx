import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { getProjectMeta, getAllProjects } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import { ProjectVisual } from "@/components/projects/ProjectFeatureCard";

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

  return (
    <article>
      <header className="site-container page-section pb-10 sm:pb-14">
        <Link href="/projects" className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-fg">← all work</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end">
          <div>
            <p className="eyebrow mb-4">{meta.status === "in-progress" ? "building now" : "case study"} · {formatDateRange(meta.startDate, meta.endDate)}</p>
            <h1 className="page-title">{meta.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{meta.summary}</p>
          </div>
          <div>
            <p className="border-l-2 border-warm pl-4 text-sm font-medium leading-relaxed text-fg sm:text-base">{meta.outcome}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {meta.tags.map((tag) => <span key={tag} className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted">{tag}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {meta.liveUrl && (meta.liveUrl.startsWith("/") ? (
                <Link href={meta.liveUrl} className="button-primary">view live <span aria-hidden="true">↗</span></Link>
              ) : (
                <a href={meta.liveUrl} target="_blank" rel="noopener noreferrer" className="button-primary">view live <span aria-hidden="true">↗</span></a>
              ))}
              {meta.githubUrl && <a href={meta.githubUrl} target="_blank" rel="noopener noreferrer" className="button-secondary">github <span aria-hidden="true">↗</span></a>}
            </div>
          </div>
        </div>
      </header>

      <div className="site-container overflow-hidden rounded-2xl border border-border [&>div]:min-h-[22rem]">
        <ProjectVisual visual={meta.visual} />
      </div>

      <div className="content-container page-section">
        <div className="text-[0.98rem] leading-7 text-muted [&_a]:font-medium [&_a]:text-accent-dim [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg [&_li]:mb-2 [&_p]:mb-5 [&_p]:leading-7 [&_pre]:mb-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface [&_pre]:p-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6">
          {content}
        </div>
      </div>
    </article>
  );
}

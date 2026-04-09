import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { getProjectMeta, getAllProjects } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((p) => ({ slug: [p.slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getProjectMeta(slug[0]);
  if (!meta) return { title: "not found" };
  return {
    title: meta.title,
    description: meta.tagline,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!slug || slug.length === 0) notFound();

  const meta = getProjectMeta(slug[0]);
  if (!meta) notFound();

  const mdxPath = path.join(process.cwd(), "content", "projects", slug[0], "index.mdx");
  let content: React.ReactElement | null = null;

  if (fs.existsSync(mdxPath)) {
    const source = fs.readFileSync(mdxPath, "utf-8");
    const result = await compileMDX({ source, options: { parseFrontmatter: true } });
    content = result.content;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-2">
        <Link href="/projects" className="text-sm text-muted hover:text-fg transition-colors">
          ← projects
        </Link>
      </div>

      <h1 className="font-serif text-3xl mt-6 mb-2">{meta.title}</h1>
      <p className="text-muted mb-4">{meta.tagline}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {meta.tags.map((tag) => (
          <span key={tag} className="font-mono text-xs border border-border px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted mb-8">
        <span>{formatDateRange(meta.startDate, meta.endDate ?? null)}</span>
        <span className="capitalize">{meta.status}</span>
        {meta.githubUrl && (
          <a href={meta.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            github
          </a>
        )}
        {meta.liveUrl && (
          <a href={meta.liveUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            live
          </a>
        )}
      </div>

      {content ? (
        <div className="prose prose-sm max-w-none text-fg [&_a]:text-accent [&_a]:underline [&_h2]:font-serif [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_code]:font-mono [&_code]:text-sm [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-4">
          {content}
        </div>
      ) : (
        <p className="text-muted text-sm">writeup coming soon.</p>
      )}
    </div>
  );
}

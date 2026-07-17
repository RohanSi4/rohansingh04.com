import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { formatNoteDate, getAllNotes, getNoteSource } from "@/lib/notes";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getAllNotes().find((note) => note.slug === slug);
  if (!meta) return { title: "not found" };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/notes/${meta.slug}` },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const meta = getAllNotes().find((note) => note.slug === slug);
  const source = getNoteSource(slug);
  if (!meta || !source) notFound();

  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
  });

  return (
    <article className="content-container page-section">
      <header className="mb-12">
        <Link
          href="/notes"
          className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-fg"
        >
          ← all notes
        </Link>
        <p className="eyebrow mb-4 mt-8">
          {formatNoteDate(meta.date)} · {meta.readingMinutes} min read
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {meta.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="text-[0.98rem] leading-7 text-muted [&>p:first-of-type]:text-base [&>p:first-of-type]:text-fg [&_a]:font-medium [&_a]:text-accent-dim [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg [&_img]:my-8 [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_li]:mb-2 [&_p]:mb-5 [&_p]:leading-7 [&_pre]:mb-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface [&_pre]:p-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6">
        {content}
      </div>

      <footer className="mt-16 border-t border-border pt-8">
        <Link
          href="/notes"
          className="inline-flex min-h-11 items-center text-sm text-accent-dim transition-colors hover:text-fg"
        >
          ← all notes
        </Link>
      </footer>
    </article>
  );
}

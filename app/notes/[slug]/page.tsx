import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { formatNoteDate, getAllNotes, getNoteSource } from "@/lib/notes";

interface Props {
  params: Promise<{ slug: string }>;
}

// MDX emits a bare <table>. A results table with eight columns is wider than a
// phone, and left alone it makes the whole page scroll sideways, which breaks
// every other paragraph on the page too. Give each table its own scroll
// container so the overflow stays inside the table.
const noteComponents = {
  table: (props: React.ComponentProps<"table">) => (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[34rem] border-collapse text-sm" {...props} />
    </div>
  ),
};

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

  // remark-gfm is required for tables. Without it a markdown table is not a
  // parse error, it renders as a paragraph of literal pipe characters, so the
  // build stays green and the page is quietly broken. Caught exactly that way.
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } },
    components: noteComponents,
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

      <div className="text-[0.98rem] leading-7 text-muted [&>p:first-of-type]:text-base [&>p:first-of-type]:text-fg [&_a]:font-medium [&_a]:text-accent-dim [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-fg [&_img]:my-8 [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_li]:mb-2 [&_p]:mb-5 [&_p]:leading-7 [&_pre]:mb-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface [&_pre]:p-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:whitespace-nowrap [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-mono [&_th]:text-[11px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-fg">
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

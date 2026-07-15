import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { daysSince } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import SpotifyNowPlaying from "@/components/widgets/SpotifyNowPlaying";

export const metadata = pageMetadata({
  title: "Now",
  description: "What Rohan Singh is working on, training for, and thinking about right now.",
  path: "/now",
});

const STALE_DAYS = 90;

export default async function NowPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "content", "now.mdx"),
    "utf-8"
  );

  const { content, frontmatter } = await compileMDX<{ lastUpdated: string }>({
    source,
    options: { parseFrontmatter: true },
  });

  const lastUpdated = frontmatter.lastUpdated;
  const age = daysSince(lastUpdated);
  const isStale = age >= STALE_DAYS;

  return (
    <div className="content-container page-section">
      <header className="mb-10">
      <p className="eyebrow mb-4">right now</p>
      <h1 className="page-title">What I&apos;m up to.</h1>
      <p className="mt-5 text-xs text-muted font-mono">
        last updated {lastUpdated}
        {age > 0 && ` · ${age}d ago`}
      </p>
      </header>

      {isStale && (
        <div className="mb-6 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          This page hasn&apos;t been updated in {age} days, so a few details may have moved on.
        </div>
      )}

      <article className="border-l-2 border-warm pl-5 sm:pl-7">
        <div className="prose prose-base max-w-none text-fg [&_p]:mb-5 [&_p]:leading-relaxed [&_a]:text-accent-dim [&_a]:underline [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
          {content}
        </div>
      </article>

      <section className="surface-card mt-8 px-5 sm:px-6" aria-label="What I'm listening to">
        <SpotifyNowPlaying />
      </section>
    </div>
  );
}

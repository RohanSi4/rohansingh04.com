import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { daysSince } from "@/lib/dates";

export const metadata: Metadata = {
  title: "now",
  description: "what rohan is up to right now",
};

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-2">now</h1>
      <p className="text-xs text-muted font-mono mb-6">
        last updated {lastUpdated}
        {age > 0 && ` · ${age}d ago`}
      </p>

      {isStale && (
        <div className="mb-6 border border-border rounded px-4 py-3 text-sm text-muted bg-surface">
          this page hasn't been updated in {age} days. it might be stale.
        </div>
      )}

      <div className="prose prose-sm max-w-none text-fg [&_p]:mb-4 [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1">
        {content}
      </div>
    </div>
  );
}

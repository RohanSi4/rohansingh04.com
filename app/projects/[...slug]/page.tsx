import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug[slug.length - 1].replace(/-/g, " "),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  // phase 3: read from content/projects/[slug]/index.mdx
  if (!slug || slug.length === 0) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-8">
        {slug[slug.length - 1].replace(/-/g, " ")}
      </h1>
      <p className="text-muted text-sm">coming in phase 3</p>
    </div>
  );
}

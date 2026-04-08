import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "travel list",
  description: "places rohan has visited",
};

export default function TravelListPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl">places</h1>
        <Link href="/globe" className="text-sm text-muted hover:text-fg transition-colors">
          view as globe
        </Link>
      </div>
      <p className="text-muted text-sm">coming in phase 4</p>
    </div>
  );
}

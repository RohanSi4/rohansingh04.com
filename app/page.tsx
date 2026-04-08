import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "rohan singh",
  description: "cs student at uva. building things.",
};

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      {/* health dashboard, spotify, github, featured projects go here in phase 2 */}
      <p className="text-muted text-sm">phase 2 coming soon</p>
    </div>
  );
}

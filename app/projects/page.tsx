import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "projects",
  description: "things rohan has built",
};

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-8">projects</h1>
      <p className="text-muted text-sm">coming in phase 3</p>
    </div>
  );
}

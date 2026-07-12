import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFeatureCard from "@/components/projects/ProjectFeatureCard";

export const metadata: Metadata = {
  title: "work",
  description: "Selected software, data, and machine-learning projects by Rohan Singh.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "work | rohan singh",
    description: "Selected software, data, and machine-learning projects.",
    url: "/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "work | rohan singh",
    description: "Selected software, data, and machine-learning projects.",
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <div>
      <header className="site-container page-section pb-12 sm:pb-16">
        <p className="eyebrow mb-4">selected work</p>
        <h1 className="page-title">Projects that made it past the idea stage.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          I like projects with a real data source, a useful interface, and enough
          constraints to force good decisions. These are the ones worth explaining.
        </p>
      </header>

      <section className="border-y border-border bg-surface/40">
        <div className="site-container page-section">
          <div className="grid gap-5 lg:grid-cols-2">
            {featured.map((project, index) => (
              <div key={project.slug} className={index === 0 ? "lg:col-span-2" : ""}>
                <ProjectFeatureCard project={project} lead={index === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="site-container page-section">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow mb-3">archive</p><h2 className="section-title">Earlier builds.</h2></div>
            <Link href="/history" className="text-sm text-muted hover:text-fg">see the timeline →</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rest.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </section>
      )}
    </div>
  );
}

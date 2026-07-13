import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects, getFeaturedProjects } from "@/lib/content";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFeatureCard from "@/components/projects/ProjectFeatureCard";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things Rohan Singh made around running, movies, music, health, and whatever else caught his attention.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | Rohan Singh",
    description: "Things I made because I wanted them to exist.",
    url: "/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Rohan Singh",
    description: "Things I made because I wanted them to exist.",
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const featured = getFeaturedProjects();
  const rest = projects.filter((project) => !project.featured);

  return (
    <div>
      <header className="site-container page-section pb-12 sm:pb-16">
        <p className="eyebrow mb-4">projects</p>
        <h1 className="page-title">Things I made because I wanted them to exist.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Most started with something I wanted for myself: better marathon training,
          movie picks I could trust, or a site that felt more like me. Here&apos;s what I
          ended up making.
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
            <div><p className="eyebrow mb-3">more projects</p><h2 className="section-title">A few more things I made.</h2></div>
            <Link href="/history" className="text-sm text-muted hover:text-fg">where I&apos;ve worked →</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rest.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </section>
      )}
    </div>
  );
}

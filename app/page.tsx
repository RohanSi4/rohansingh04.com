import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProjects, getHistory, getPlaces, getSiteConfig, getStates } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import { getRunningDashboard } from "@/lib/running";
import ProjectFeatureCard from "@/components/projects/ProjectFeatureCard";
import FitnessPreview from "@/components/fitness/FitnessPreview";

export const metadata: Metadata = {
  title: { absolute: "Rohan Singh — projects, running, and more" },
  description:
    "I'm Rohan, a UVA computer science student who likes making things around running, movies, music, travel, and whatever else I'm curious about.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rohan Singh — projects, running, and more",
    description: "A UVA student making things he actually wants to use.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohan Singh — projects, running, and more",
    description: "A UVA student making things he actually wants to use.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const site = getSiteConfig();
  const history = getHistory();
  const [running, featured, places, states] = await Promise.all([
    getRunningDashboard(),
    Promise.resolve(getFeaturedProjects().slice(0, 3)),
    getPlaces(),
    getStates(),
  ]);
  const experience = history
    .filter((entry) => entry.type === "work")
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 3);
  const visitedStates = states.filter((state) => state.visited).length;
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Rohan Singh",
    url: "https://rohansingh04.com",
    sameAs: [
      "https://github.com/RohanSi4",
      "https://linkedin.com/in/rohansingh4",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Virginia",
    },
    knowsAbout: ["software engineering", "data engineering", "machine learning"],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }}
      />
      <section className="site-container grid gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_22rem] lg:items-end lg:py-32">
        <div>
          <p className="eyebrow mb-5">hey, i&apos;m rohan</p>
          <h1 className="page-title max-w-[16ch]">
            I like making things I actually want to use.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            I&apos;m a computer science student at UVA, spending this summer in San Jose
            working on machine learning at Expedia. Most of my projects start with
            something I&apos;m already into—running, movies, music, or a problem that keeps
            bugging me.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects" className="button-primary">see what I&apos;ve made <span aria-hidden="true">→</span></Link>
            <a href="mailto:rohan.singh04@outlook.com" className="button-secondary">say hey</a>
          </div>
        </div>

        <aside className="surface-card overflow-hidden" aria-label="What Rohan is doing right now">
          <div className="border-b border-border bg-surface px-5 py-4">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <span className="size-1.5 rounded-full bg-warm ring-4 ring-warm/15" />
              right now
            </p>
          </div>
          <dl className="divide-y divide-border bg-bg">
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm">
              <dt className="text-muted">in</dt><dd className="font-medium text-fg">{site.currentLocation}</dd>
            </div>
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm">
              <dt className="text-muted">this summer</dt><dd className="font-medium text-fg">ML at {site.currentRole.org}</dd>
            </div>
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm">
              <dt className="text-muted">training for</dt><dd className="font-medium leading-relaxed text-fg">my first {running.race.name}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="site-container page-section">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow mb-3">a few favorites</p><h2 className="section-title">Projects I kept coming back to.</h2></div>
            <Link href="/projects" className="text-sm text-muted transition-colors hover:text-fg">see everything →</Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {featured.map((project, index) => (
              <div key={project.slug} className={index === 0 ? "lg:col-span-2" : ""}>
                <ProjectFeatureCard project={project} lead={index === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container page-section">
        <div className="mb-10 grid gap-5 md:grid-cols-[1fr_.7fr] md:items-end">
          <div><p className="eyebrow mb-3">where I&apos;ve worked</p><h2 className="section-title">Some work I&apos;m proud of.</h2></div>
          <p className="text-sm leading-relaxed text-muted">
            I&apos;ve gotten to work on machine learning, backend code, and tools used by
            real people. These are a few things I&apos;m glad I got to build.
          </p>
        </div>
        <ol className="grid overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3 md:gap-px">
          {experience.map((entry) => (
            <li key={entry.id} className="flex flex-col border-b border-border bg-bg p-6 last:border-b-0 md:border-b-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted">{formatDateRange(entry.startDate, entry.endDate)}</p>
              <h3 className="mt-4 font-serif text-xl font-semibold text-fg">{entry.org}</h3>
              <p className="mt-1 text-sm text-muted">{entry.title}</p>
              <p className="mt-5 text-sm leading-relaxed text-fg">{entry.bullets?.[0] ?? entry.summary}</p>
            </li>
          ))}
        </ol>
        <Link href="/history" className="mt-5 inline-flex min-h-11 items-center text-sm text-accent-dim hover:text-fg">the full timeline →</Link>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="site-container page-section">
          <div className="mb-10 grid gap-5 md:grid-cols-[1fr_.7fr] md:items-end">
            <div><p className="eyebrow mb-3">the rest of me</p><h2 className="section-title">I do other stuff too.</h2></div>
            <p className="text-sm leading-relaxed text-muted">
              Running, lifting, travel, and music are a big part of my life—and,
              somehow, they keep turning into side projects.
            </p>
          </div>

          <FitnessPreview data={running} />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Link href="/globe" className="group surface-card relative min-h-64 overflow-hidden p-6 transition-colors hover:border-accent sm:p-8">
              <div className="absolute -right-16 -top-20 size-64 rounded-full border border-accent/20" aria-hidden="true" />
              <div className="absolute -right-6 top-2 size-44 rounded-full border border-accent/15" aria-hidden="true" />
              <p className="eyebrow">places</p>
              <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight">Places I&apos;ve been.</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">Trips I remember, places I want to go back to, and a globe that&apos;s fun to spin.</p>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between border-t border-border pt-4 sm:bottom-8 sm:left-8 sm:right-8">
                <span className="font-mono text-xs text-muted">{places.length} places · {visitedStates} states</span><span className="text-sm text-accent-dim transition-transform group-hover:translate-x-1">explore →</span>
              </div>
            </Link>

            <Link href="/now" className="group surface-card flex min-h-64 flex-col p-6 transition-colors hover:border-accent sm:p-8">
              <p className="eyebrow">right now</p>
              <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight">{site.currentLocation}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">What I&apos;m doing, what I&apos;m training for, and whatever has my attention lately.</p>
              <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
                <span className="font-mono text-xs text-muted">summer 2026</span><span className="text-sm text-accent-dim transition-transform group-hover:translate-x-1">read more →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

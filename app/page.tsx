import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProjects, getHistory, getPlaces, getSiteConfig, getStates } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import { getRunningDashboard } from "@/lib/running";
import ProjectFeatureCard from "@/components/projects/ProjectFeatureCard";
import FitnessPreview from "@/components/fitness/FitnessPreview";
import SpotifyNowPlaying from "@/components/widgets/SpotifyNowPlaying";
import GithubLatestCommit from "@/components/widgets/GithubLatestCommit";

export const metadata: Metadata = {
  title: { absolute: "Rohan Singh — software, data, and useful systems" },
  description:
    "Rohan Singh is a computer science student at UVA building data-rich products, reliable systems, and personal tools.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "rohan singh — software, data, and useful systems",
    description: "CS at UVA. Building thoughtful software from messy, real-world data.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "rohan singh — software, data, and useful systems",
    description: "CS at UVA. Building thoughtful software from messy, real-world data.",
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
          <p className="eyebrow mb-5">CS at UVA · graduating May 2027</p>
          <h1 className="page-title max-w-[13ch]">
            I build useful software from messy, real-world data.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            I&apos;m Rohan, a computer science student interested in software, data, and
            machine-learning systems. I like taking projects past the notebook—into
            APIs, interfaces, and tools people can actually use.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects" className="button-primary">see my work <span aria-hidden="true">→</span></Link>
            <a href="mailto:rohan.singh04@outlook.com" className="button-secondary">email me</a>
          </div>
        </div>

        <aside className="surface-card overflow-hidden" aria-label="Current status">
          <div className="border-b border-border bg-surface px-5 py-4">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <span className="size-1.5 rounded-full bg-warm ring-4 ring-warm/15" />
              currently
            </p>
          </div>
          <dl className="divide-y divide-border bg-bg">
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm">
              <dt className="text-muted">location</dt><dd className="font-medium text-fg">{site.currentLocation}</dd>
            </div>
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm">
              <dt className="text-muted">focus</dt><dd className="font-medium leading-relaxed text-fg">{site.currentFocus}</dd>
            </div>
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 px-5 py-4 text-sm">
              <dt className="text-muted">looking for</dt><dd className="font-medium text-fg">software and data opportunities</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="site-container page-section">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow mb-3">selected work</p><h2 className="section-title">Things I&apos;ve built.</h2></div>
            <Link href="/projects" className="text-sm text-muted transition-colors hover:text-fg">all projects →</Link>
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
          <div><p className="eyebrow mb-3">experience</p><h2 className="section-title">Built in real teams, too.</h2></div>
          <p className="text-sm leading-relaxed text-muted">
            Internships and research taught me how to work through constraints, measure
            impact, and leave systems better than I found them.
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
        <Link href="/history" className="mt-5 inline-flex min-h-11 items-center text-sm text-accent-dim hover:text-fg">full experience →</Link>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="site-container page-section">
          <div className="mb-10 grid gap-5 md:grid-cols-[1fr_.7fr] md:items-end">
            <div><p className="eyebrow mb-3">outside the editor</p><h2 className="section-title">A few things I keep alive.</h2></div>
            <p className="text-sm leading-relaxed text-muted">
              This site doubles as a home for the parts of my life that do not fit on a résumé.
            </p>
          </div>

          <FitnessPreview data={running} />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Link href="/globe" className="group surface-card relative min-h-64 overflow-hidden p-6 transition-colors hover:border-accent sm:p-8">
              <div className="absolute -right-16 -top-20 size-64 rounded-full border border-accent/20" aria-hidden="true" />
              <div className="absolute -right-6 top-2 size-44 rounded-full border border-accent/15" aria-hidden="true" />
              <p className="eyebrow">places</p>
              <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight">Learning the map by going.</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">An interactive globe, a states map, and the places that have made it into the story so far.</p>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between border-t border-border pt-4 sm:bottom-8 sm:left-8 sm:right-8">
                <span className="font-mono text-xs text-muted">{places.length} places · {visitedStates} states</span><span className="text-sm text-accent-dim transition-transform group-hover:translate-x-1">explore →</span>
              </div>
            </Link>

            <Link href="/now" className="group surface-card flex min-h-64 flex-col p-6 transition-colors hover:border-accent sm:p-8">
              <p className="eyebrow">right now</p>
              <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight">{site.currentLocation}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{site.currentFocus}.</p>
              <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
                <span className="font-mono text-xs text-muted">updated Jul 12</span><span className="text-sm text-accent-dim transition-transform group-hover:translate-x-1">read more →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="site-container py-14 sm:py-20" aria-labelledby="live-title">
        <div className="grid gap-6 md:grid-cols-[.7fr_1fr] md:items-start">
          <div>
            <p className="eyebrow mb-3">live signals</p>
            <h2 id="live-title" className="font-serif text-2xl font-semibold tracking-tight">What the site sees right now.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">A small pulse from what I&apos;m listening to and what I last pushed.</p>
          </div>
          <div className="surface-card divide-y divide-border px-5 sm:px-6">
            <SpotifyNowPlaying />
            <GithubLatestCommit />
          </div>
        </div>
      </section>
    </div>
  );
}

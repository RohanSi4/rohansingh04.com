import Link from "next/link";
import { getFeaturedProjects, getHistory, getSiteConfig } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Résumé",
  description: "Rohan Singh's education, software engineering experience, and technical skills.",
  path: "/resume",
});

const skillGroups = [
  {
    label: "languages",
    items: ["Python", "Java", "JavaScript", "TypeScript", "Go", "C++", "SQL"],
  },
  {
    label: "frameworks & libraries",
    items: [
      "React",
      "Next.js",
      "Angular",
      "Spring Boot",
      "Flask",
      "GraphQL",
      "LightGBM",
      "scikit-learn",
      "SciPy",
      "NetworkX",
      "cuGraph",
      "REST",
      "Tailwind CSS",
    ],
  },
  {
    label: "cloud & devops",
    items: [
      "AWS",
      "Azure",
      "Docker",
      "Jenkins",
      "Gradle",
      "Terraform",
      "Git",
      "Cypress",
      "Playwright",
      "Cucumber",
    ],
  },
  {
    label: "databases",
    items: ["MongoDB", "PostgreSQL", "MySQL"],
  },
  {
    label: "certifications",
    items: [
      "AWS Cloud Practitioner",
      "Oracle Cloud Infrastructure Generative AI Professional",
      "PCAP",
    ],
  },
] as const;

const uvaCoursework =
  "Relevant coursework: Machine Learning, Software Engineering, Computer Architecture, Data Structures, Algorithms";

export default function ResumePage() {
  const history = getHistory();
  const site = getSiteConfig();
  const projects = getFeaturedProjects();
  const education = history
    .filter((e) => e.type === "school")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const experience = history
    .filter((e) => e.type === "work")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="content-container page-section">
      <header className="mb-12 border-b border-border pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow mb-4">résumé</p>
            <h1 className="page-title">Rohan Singh</h1>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href="/rohan-singh-resume.pdf"
              download="Rohan-Singh-Resume.pdf"
              className="button-primary w-fit"
            >
              download PDF <span aria-hidden="true">↓</span>
            </a>
            <p className="font-mono text-[10px] text-muted">PDF updated July 2026</p>
          </div>
        </div>

        <p className="mt-5 text-base text-muted">
          Computer science at UVA, graduating May 2027 · interested in software, data, and machine learning
        </p>
        <p className="mt-3 flex flex-wrap gap-x-2 text-sm text-muted">
          <span>{site.currentLocation}</span><span aria-hidden="true">·</span>
          <a href="mailto:rohan.singh04@outlook.com" className="text-accent hover:underline">
            rohan.singh04@outlook.com
          </a><span aria-hidden="true">·</span>
          <a href="https://github.com/RohanSi4" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            github
          </a><span aria-hidden="true">·</span>
          <a href="https://rohansingh04.com" className="text-accent hover:underline">
            rohansingh04.com
          </a>
        </p>
      </header>

      {/* education */}
      <section className="mb-12">
        <h2 className="eyebrow mb-5 border-b border-border pb-3">
          education
        </h2>
        <div className="space-y-5">
          {education.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold">{e.org}</span>
                <span className="text-sm text-muted font-mono">
                  {formatDateRange(e.startDate, e.endDate ?? null)}
                </span>
              </div>
              <div className="text-sm text-muted">{e.title}</div>
              {e.summary && (
                <p className="text-sm text-muted mt-1">{e.summary}</p>
              )}
              {e.id === "uva-cs" && (
                <p className="mt-1 text-sm leading-relaxed text-muted">{uvaCoursework}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* experience */}
      <section className="mb-12">
        <h2 className="eyebrow mb-5 border-b border-border pb-3">
          experience
        </h2>
        <div className="space-y-8">
          {experience.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold">{e.org}</span>
                <span className="text-sm text-muted font-mono">
                  {formatDateRange(e.startDate, e.endDate ?? null)}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-sm text-muted mb-2">
                <span>{e.title}</span>
                <span>{e.location}</span>
              </div>
              {e.bullets && e.bullets.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  {e.bullets.map((bullet) => (
                    <li key={bullet} className="text-sm text-muted">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">{e.summary}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="eyebrow mb-5 border-b border-border pb-3">
          selected projects
        </h2>
        <div className="space-y-6">
          {projects.map((project) => (
            <article key={project.slug}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-fg">{project.title}</h3>
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex min-h-11 items-center text-sm text-accent-dim hover:text-fg"
                >
                  case study <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="text-sm text-muted">{project.role}</p>
              <ul className="mt-2 space-y-1.5">
                {project.proofPoints.slice(0, 2).map((point) => (
                  <li key={point} className="flex gap-2 text-sm leading-relaxed text-muted">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* skills */}
      <section>
        <h2 className="eyebrow mb-5 border-b border-border pb-3">
          skills
        </h2>
        <dl className="space-y-4">
          {skillGroups.map((group) => (
            <div key={group.label} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="eyebrow pt-0.5">{group.label}</dt>
              <dd className="text-sm leading-relaxed text-muted">{group.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

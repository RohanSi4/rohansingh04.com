import type { Metadata } from "next";
import { getHistory, getSiteConfig } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Rohan Singh's education, software engineering experience, and technical skills.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  const history = getHistory();
  const site = getSiteConfig();
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
          <a
            href="/rohan-singh-resume.pdf"
            download="Rohan-Singh-Resume.pdf"
            className="button-primary w-fit shrink-0"
          >
            download PDF <span aria-hidden="true">↓</span>
          </a>
        </div>

        <p className="mt-5 text-base text-muted">
          Computer science at UVA, graduating May 2027 · software, data, and ML systems
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

      {/* skills note */}
      <section>
        <h2 className="eyebrow mb-5 border-b border-border pb-3">
          skills
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Python · Java · Go · TypeScript · React · Next.js · Spring Boot ·
          GraphQL · AWS · MongoDB · Postgres
        </p>
      </section>
    </div>
  );
}

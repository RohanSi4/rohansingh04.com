import type { Metadata } from "next";
import { getHistory } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import experience from "@/content/experience.json";

export const metadata: Metadata = {
  title: "resume",
  description: "rohan singh's resume",
};

type ExperienceEntry = {
  id: string;
  title: string;
  org: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
};

export default function ResumePage() {
  const history = getHistory();
  const education = history
    .filter((e) => e.type === "school")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const exp = (experience as ExperienceEntry[]).sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-serif text-2xl">resume</h1>
        <a
          href="/resume.pdf"
          download
          className="text-sm text-accent hover:underline transition-colors"
        >
          download pdf
        </a>
      </div>

      {/* header */}
      <div className="mb-10">
        <p className="font-semibold text-lg">rohan singh</p>
        <p className="text-sm text-muted">
          charlottesville, va ·{" "}
          <a href="mailto:rohan@rohansingh04.com" className="text-accent hover:underline">
            rohan@rohansingh04.com
          </a>{" "}
          ·{" "}
          <a href="https://github.com/RohanSi4" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            github
          </a>{" "}
          ·{" "}
          <a href="https://rohansingh04.com" className="text-accent hover:underline">
            rohansingh04.com
          </a>
        </p>
      </div>

      {/* education */}
      <section className="mb-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-border pb-2">
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
      <section className="mb-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-border pb-2">
          experience
        </h2>
        <div className="space-y-6">
          {exp.map((e) => (
            <div key={e.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold">{e.org}</span>
                <span className="text-sm text-muted font-mono">
                  {formatDateRange(e.startDate, e.endDate)}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-sm text-muted mb-2">
                <span>{e.title}</span>
                <span>{e.location}</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {e.bullets.map((b, i) => (
                  <li key={i} className="text-sm text-muted">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* skills note */}
      <section>
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-border pb-2">
          skills
        </h2>
        <p className="text-sm text-muted">
          python · java · go · typescript · react · next.js · spring boot ·
          graphql · aws · mongodb · postgres
        </p>
      </section>
    </div>
  );
}

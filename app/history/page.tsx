import { getHistory } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Experience",
  description: "Where Rohan Singh has worked, what he did there, and the results he is proud of.",
  path: "/history",
});

const typeLabel: Record<string, string> = {
  work: "work",
  school: "school",
  event: "event",
};

export default function HistoryPage() {
  const entries = getHistory().sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  return (
    <div className="content-container page-section">
      <header className="mb-14 max-w-2xl">
        <p className="eyebrow mb-4">experience</p>
        <h1 className="page-title">Places I&apos;ve worked and what I did there.</h1>
        <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
          I&apos;ve gotten to work on machine learning, backend code, and tools used by
          real people. Here are the parts I&apos;m most proud of.
        </p>
      </header>

      <div className="relative">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" aria-hidden="true" />

        <ol className="space-y-12">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-8">
              <div className="absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-accent bg-bg" aria-hidden="true" />

              <article className="surface-card p-5 sm:p-7">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-serif text-xl font-semibold text-fg sm:text-2xl">{entry.org}</h2>
                <span className="text-xs text-muted font-mono uppercase tracking-wide">
                  {typeLabel[entry.type] ?? entry.type}
                </span>
              </div>

              <p className="mb-2 text-sm font-medium text-fg">{entry.title}</p>

              <div className="mb-4 flex flex-wrap gap-x-3 text-xs text-muted">
                <span>{formatDateRange(entry.startDate, entry.endDate ?? null)}</span>
                {entry.location && <span>{entry.location}</span>}
              </div>

              {entry.summary && (
                <p className="text-sm text-muted leading-relaxed">{entry.summary}</p>
              )}
              {entry.bullets && entry.bullets.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
                  {entry.bullets.slice(0, 3).map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-fg">
                      <span className="mt-[0.7em] size-1 shrink-0 rounded-full bg-warm" aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

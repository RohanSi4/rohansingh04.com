import type { Metadata } from "next";
import { getHistory } from "@/lib/content";
import { formatDateRange } from "@/lib/dates";

export const metadata: Metadata = {
  title: "history",
  description: "rohan's work, school, and key events",
};

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-12">history</h1>

      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <ol className="space-y-10">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-8">
              {/* dot */}
              <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-accent bg-bg" />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <span className="font-semibold text-fg">{entry.org}</span>
                <span className="text-xs text-muted font-mono uppercase tracking-wide">
                  {typeLabel[entry.type] ?? entry.type}
                </span>
              </div>

              <div className="text-sm text-fg mb-1">{entry.title}</div>

              <div className="flex flex-wrap gap-x-3 text-xs text-muted mb-2">
                <span>{formatDateRange(entry.startDate, entry.endDate ?? null)}</span>
                {entry.location && <span>{entry.location}</span>}
              </div>

              {entry.summary && (
                <p className="text-sm text-muted leading-relaxed">{entry.summary}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

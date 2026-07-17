import Link from "next/link";
import { formatNoteDate, getAllNotes } from "@/lib/notes";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Notes",
  description:
    "Occasional writing from Rohan Singh on the systems he builds: LLM tooling, data pipelines, and how this site works.",
  path: "/notes",
});

export default function NotesPage() {
  const notes = getAllNotes();

  return (
    <div className="content-container page-section">
      <header className="mb-12">
        <p className="eyebrow mb-4">notes</p>
        <h1 className="page-title">Things worth writing down.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Longer looks at how the things I build actually work. Occasional, not
          scheduled. There&apos;s an <a href="/feed.xml" className="text-accent-dim underline underline-offset-4 hover:text-fg">RSS feed</a> if
          that&apos;s your thing.
        </p>
      </header>

      <ol className="space-y-4">
        {notes.map((note) => (
          <li key={note.slug}>
            <Link
              href={`/notes/${note.slug}`}
              className="group surface-card block p-5 transition-colors hover:border-accent sm:p-7"
            >
              <p className="font-mono text-xs text-muted">
                {formatNoteDate(note.date)} · {note.readingMinutes} min read
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-fg transition-colors group-hover:text-accent-dim sm:text-3xl">
                {note.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                {note.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm text-accent-dim transition-transform group-hover:translate-x-1">
                read it →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

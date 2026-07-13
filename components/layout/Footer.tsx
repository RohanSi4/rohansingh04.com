import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface/45">
      <div className="site-container py-12 sm:py-16">
        <div className="grid gap-8 border-b border-border pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow mb-3">want to talk?</p>
            <h2 className="max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Say hey.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              If you want to chat about a project, an internship, running, or anything
              else, send me a note.
            </p>
          </div>
          <a href="mailto:rohan.singh04@outlook.com" className="button-primary w-fit">
            email me <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="flex flex-col gap-5 pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Rohan Singh · UVA computer science · graduating May 2027</p>
          <nav aria-label="Footer links" className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="mailto:rohan.singh04@outlook.com" className="inline-flex min-h-11 items-center transition-colors hover:text-fg">
              email
            </a>
            <a
              href="https://linkedin.com/in/rohansingh4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
            >
              linkedin <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://github.com/RohanSi4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
            >
              github <span aria-hidden="true">↗</span>
            </a>
            <Link href="/resume" className="inline-flex min-h-11 items-center transition-colors hover:text-fg">
              resume
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

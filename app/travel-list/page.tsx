import type { Metadata } from "next";
import Link from "next/link";
import { getPlaces } from "@/lib/content";
import TravelNav from "@/components/globe/TravelNav";

export const metadata: Metadata = {
  title: "travel list",
  description: "A chronological list of places Rohan has visited.",
  alternates: { canonical: "/travel-list" },
};

export const dynamic = "force-dynamic";

const UNKNOWN_DATE_KEY = "not-sure-when";

function formatVisitedDate(value: string | null, approximate = false): string {
  if (!value) return "not sure when";
  const [year, month] = value.split("-").map(Number);
  if (!year) return value;
  if (approximate) return String(year);
  if (!month) return String(year);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export default async function TravelListPage() {
  const places = (await getPlaces()).sort((a, b) =>
    (b.visitedDate ?? "").localeCompare(a.visitedDate ?? "")
  );

  const byYear = places.reduce<Record<string, typeof places>>((acc, p) => {
    const year = p.visitedDate?.slice(0, 4) ?? UNKNOWN_DATE_KEY;
    (acc[year] ??= []).push(p);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => {
    if (a === UNKNOWN_DATE_KEY) return 1;
    if (b === UNKNOWN_DATE_KEY) return -1;
    return Number(b) - Number(a);
  });
  const countryCount = new Set(places.map((place) => place.country)).size;

  return (
    <div className="site-container page-section">
      <header className="max-w-3xl">
        <p className="eyebrow mb-4">travel · chronological</p>
        <h1 className="page-title">Places, in the order I found them.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {places.length} stops across {countryCount} countries, from recent trips back
          through the earliest entries in the archive.
        </p>
        <TravelNav current="list" />
      </header>

      <div className="mt-12 max-w-4xl space-y-12">
        {years.map((year) => (
          <section key={year} aria-labelledby={`travel-year-${year}`}>
            <h2 id={`travel-year-${year}`} className="eyebrow mb-4 border-b border-border pb-3">
              {year === UNKNOWN_DATE_KEY ? "not sure when" : year}
            </h2>
            <ul className="divide-y divide-border border-y border-border">
              {byYear[year].map((place) => (
                <li key={place.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8">
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl font-semibold tracking-tight text-fg">
                      {place.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{place.country}</p>
                    {place.notes && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{place.notes}</p>
                    )}
                  </div>
                  <div className="shrink-0 sm:text-right">
                    {place.visitedDate ? (
                      <time dateTime={place.visitedDate} className="font-mono text-xs text-muted">
                        {formatVisitedDate(place.visitedDate, place._needsDate)}
                        {place._needsDate && (
                          <span className="ml-1 text-muted/70">(approx.)</span>
                        )}
                      </time>
                    ) : (
                      <span className="font-mono text-xs text-muted">not sure when</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">
        Prefer the spatial version? <Link href="/globe" className="font-medium text-accent-dim underline decoration-border underline-offset-4 hover:decoration-accent">Open the interactive globe.</Link>
      </p>
    </div>
  );
}

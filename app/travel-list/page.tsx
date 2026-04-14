import type { Metadata } from "next";
import Link from "next/link";
import { getPlaces } from "@/lib/content";

export const metadata: Metadata = {
  title: "travel list",
  description: "places rohan has visited",
};

export default async function TravelListPage() {
  const places = (await getPlaces()).sort((a, b) =>
    b.visitedDate.localeCompare(a.visitedDate)
  );

  const byYear = places.reduce<Record<string, typeof places>>((acc, p) => {
    const year = p.visitedDate.slice(0, 4);
    (acc[year] ??= []).push(p);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl">places</h1>
        <Link
          href="/globe"
          className="text-sm text-muted hover:text-fg transition-colors font-mono"
        >
          view as globe →
        </Link>
      </div>

      <div className="space-y-10">
        {years.map((year) => (
          <section key={year}>
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4 border-b border-border pb-2">
              {year}
            </h2>
            <ul className="space-y-4">
              {byYear[year].map((place) => (
                <li key={place.id} className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-medium text-fg">{place.name}</p>
                    <p className="text-sm text-muted">{place.country}</p>
                    {place.notes && (
                      <p className="text-xs text-muted mt-0.5">{place.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-muted font-mono">
                      {place.visitedDate}
                      {place._needsDate && (
                        <span className="text-xs text-muted/60 ml-1">(approx)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted/50">
                      {place.lat.toFixed(1)}°, {place.lng.toFixed(1)}°
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

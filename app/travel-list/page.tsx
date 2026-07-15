import Image from "next/image";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { getPlaces } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import TravelNav from "@/components/globe/TravelNav";

export const metadata = pageMetadata({
  title: "Travel journal",
  description: "Places Rohan has visited and the photos he brought home.",
  path: "/travel-list",
});

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
  const [loadedPlaces, admin] = await Promise.all([getPlaces(), isAdmin()]);
  const places = loadedPlaces.sort((a, b) =>
    (b.visitedDate ?? "").localeCompare(a.visitedDate ?? ""),
  );
  const countryCount = new Set(places.map((place) => place.country)).size;
  const photoEntries = places.flatMap((place) =>
    place.photos.map((url) => ({ place, url })),
  );

  const byYear = places.reduce<Record<string, typeof places>>((acc, place) => {
    const year = place.visitedDate?.slice(0, 4) ?? UNKNOWN_DATE_KEY;
    (acc[year] ??= []).push(place);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => {
    if (a === UNKNOWN_DATE_KEY) return 1;
    if (b === UNKNOWN_DATE_KEY) return -1;
    return Number(b) - Number(a);
  });

  return (
    <div className="site-container page-section">
      <header className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">somewhere new whenever I can</p>
          <h1 className="page-title">Places I&apos;ve made it to.</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Family trips, quick layovers, long weekends, and a Ring Road lap I&apos;m
            still thinking about. The photos will keep filling in as I find them.
          </p>
          <TravelNav current="list" isAdmin={admin} />
        </div>

        <dl className="grid grid-cols-3 gap-3 border-y border-border py-5 lg:grid-cols-1 lg:border-y-0 lg:border-l lg:py-0 lg:pl-7">
          <div>
            <dt className="eyebrow">countries</dt>
            <dd className="mt-1 font-serif text-3xl font-semibold">{countryCount}</dd>
          </div>
          <div>
            <dt className="eyebrow">stops</dt>
            <dd className="mt-1 font-serif text-3xl font-semibold">{places.length}</dd>
          </div>
          <div>
            <dt className="eyebrow">photos</dt>
            <dd className="mt-1 font-serif text-3xl font-semibold">{photoEntries.length}</dd>
          </div>
        </dl>
      </header>

      {photoEntries.length > 0 ? (
        <section className="mt-14" aria-labelledby="travel-photos-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">photo journal</p>
              <h2 id="travel-photos-heading" className="section-title">A few views from the road.</h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm text-muted sm:block">
              Real photos from the trips, with more to come.
            </p>
          </div>

          <div className={`grid gap-3 ${photoEntries.length > 1 ? "md:grid-cols-12" : ""}`}>
            {photoEntries.slice(0, 5).map(({ place, url }, index) => (
              <figure
                key={`${place.id}-${url}`}
                className={`group relative min-h-72 overflow-hidden rounded-2xl bg-surface ${
                  index === 0
                    ? "md:col-span-8 md:row-span-2 md:min-h-[34rem]"
                    : "md:col-span-4 md:min-h-[16.6rem]"
                } ${photoEntries.length === 1 ? "min-h-[32rem] sm:min-h-[42rem]" : ""}`}
              >
                <Image
                  src={url}
                  alt={`A view from ${place.name}, ${place.country}`}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-5 pt-20 text-white">
                  <figcaption className="font-serif text-2xl font-semibold tracking-tight">
                    {place.name}
                  </figcaption>
                  <p className="mt-1 text-sm text-white/70">
                    {place.country} · {formatVisitedDate(place.visitedDate, place._needsDate)}
                  </p>
                </div>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-20" aria-labelledby="every-stop-heading">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow mb-2">the full list</p>
          <h2 id="every-stop-heading" className="section-title">Every stop so far.</h2>
        </div>

        <div className="space-y-14">
          {years.map((year) => (
            <section key={year} aria-labelledby={`travel-year-${year}`}>
              <h3 id={`travel-year-${year}`} className="eyebrow mb-4 border-b border-border pb-3">
                {year === UNKNOWN_DATE_KEY ? "not sure when" : year}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byYear[year].map((place, index) => (
                  <article key={place.id} className="surface-card group overflow-hidden">
                    {place.photos[0] ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                        <Image
                          src={place.photos[0]}
                          alt={`A view from ${place.name}, ${place.country}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        />
                        {place.photos.length > 1 ? (
                          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {place.photos.length} photos
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,var(--surface),color-mix(in_srgb,var(--accent)_18%,var(--surface)))] p-5">
                        <span className="font-serif text-7xl font-semibold tracking-tighter text-accent/15">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="absolute bottom-5 left-5 eyebrow">photo coming when I find it</p>
                      </div>
                    )}

                    <div className="p-5">
                      <p className="eyebrow">{place.country}</p>
                      <h4 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-fg">
                        {place.name}
                      </h4>
                      {place.notes ? (
                        <p className="mt-3 text-sm leading-relaxed text-muted">{place.notes}</p>
                      ) : null}
                      <p className="mt-5 font-mono text-xs text-muted">
                        {formatVisitedDate(place.visitedDate, place._needsDate)}
                        {place._needsDate ? " (approx.)" : ""}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <p className="mt-14 text-sm text-muted">
        Want the spinny version?{" "}
        <Link href="/globe" className="font-medium text-accent-dim underline decoration-border underline-offset-4 hover:decoration-accent">
          Open the globe.
        </Link>
      </p>
    </div>
  );
}

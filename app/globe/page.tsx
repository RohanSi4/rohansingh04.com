import Image from "next/image";
import Link from "next/link";
import { getPlaces } from "@/lib/content";
import { isAdmin } from "@/lib/admin-auth";
import { pageMetadata } from "@/lib/metadata";
import GlobeLoader from "@/components/globe/GlobeLoader";
import TravelNav from "@/components/globe/TravelNav";

export const metadata = pageMetadata({
  title: "Travel globe",
  description: "Places Rohan has visited around the world.",
  path: "/globe",
});

export default async function GlobePage() {
  const [places, admin] = await Promise.all([getPlaces(), isAdmin()]);
  const countryCount = new Set(places.map((place) => place.country)).size;
  const photoEntries = places.flatMap((place) =>
    place.photos.map((url) => ({ place, url })),
  );

  return (
    <div className="site-container page-section">
      <header className="max-w-3xl">
        <p className="eyebrow mb-4">places that stuck with me</p>
        <h1 className="page-title">Where I&apos;ve made it so far.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {places.length} stops across {countryCount} countries so far. Spin the globe,
          find a trip, or head to the photo journal for the parts worth keeping.
        </p>
        <TravelNav current="globe" isAdmin={admin} />
      </header>

      <section
        className="relative mt-10 h-[min(72svh,46rem)] min-h-[31rem] overflow-hidden rounded-2xl border border-border bg-black shadow-2xl"
        aria-labelledby="globe-heading"
      >
        <h2 id="globe-heading" className="sr-only">Interactive travel globe</h2>
        <GlobeLoader places={places} isAdmin={admin} />
        <p className="pointer-events-none absolute bottom-4 right-4 hidden rounded-full bg-black/70 px-3 py-2 font-mono text-xs text-white/70 backdrop-blur-sm sm:block">
          drag to rotate · scroll to zoom
        </p>
      </section>

      {photoEntries.length > 0 ? (
        <section className="mt-16" aria-labelledby="globe-photos-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">from the camera roll</p>
              <h2 id="globe-photos-heading" className="section-title">Some proof I was there.</h2>
            </div>
            <Link href="/travel-list" className="button-secondary">see every trip</Link>
          </div>

          <div className={`grid gap-3 ${photoEntries.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
            {photoEntries.slice(0, 3).map(({ place, url }, index) => (
              <figure
                key={`${place.id}-${url}`}
                className={`group relative min-h-80 overflow-hidden rounded-2xl bg-surface ${
                  photoEntries.length === 1 ? "sm:min-h-[38rem]" : ""
                }`}
              >
                <Image
                  src={url}
                  alt={`A view from ${place.name}, ${place.country}`}
                  fill
                  sizes={photoEntries.length === 1 ? "100vw" : "(max-width: 640px) 100vw, 33vw"}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-20 font-serif text-2xl font-semibold text-white">
                  {place.name}, {place.country}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

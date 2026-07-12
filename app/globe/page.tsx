import type { Metadata } from "next";
import { getPlaces } from "@/lib/content";
import { isAdmin } from "@/lib/admin-auth";
import GlobeLoader from "@/components/globe/GlobeLoader";
import TravelNav from "@/components/globe/TravelNav";

export const metadata: Metadata = {
  title: "travel",
  description: "Places Rohan has visited around the world.",
  alternates: { canonical: "/globe" },
};

export default async function GlobePage() {
  const [places, admin] = await Promise.all([getPlaces(), isAdmin()]);
  const countryCount = new Set(places.map((place) => place.country)).size;

  return (
    <div className="site-container page-section">
      <header className="max-w-3xl">
        <p className="eyebrow mb-4">outside the code editor</p>
        <h1 className="page-title">A growing map of places I&apos;ve been.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {places.length} stops across {countryCount} countries so far. Spin the globe,
          jump straight to a place, or switch views to explore the list.
        </p>
        <TravelNav current="globe" />
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
    </div>
  );
}

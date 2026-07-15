import { getStates } from "@/lib/content";
import { isAdmin } from "@/lib/admin-auth";
import { pageMetadata } from "@/lib/metadata";
import StatesMap from "@/components/states/StatesMap";
import TravelNav from "@/components/globe/TravelNav";

export const metadata = pageMetadata({
  title: "States",
  description: "US states Rohan has visited.",
  path: "/states",
});

export default async function StatesPage() {
  const [states, admin] = await Promise.all([getStates(), isAdmin()]);

  return (
    <div className="site-container page-section">
      <header className="max-w-3xl">
        <p className="eyebrow mb-4">travel · United States</p>
        <h1 className="page-title">The states I&apos;ve made it to.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          A tile map of road trips, college stops, weekends away, and places that
          felt worth remembering. Select any state for the details.
        </p>
        <TravelNav current="states" isAdmin={admin} />
      </header>

      <section className="surface-card mt-10 p-4 sm:p-8" aria-labelledby="states-map-heading">
        <h2 id="states-map-heading" className="sr-only">Visited states map</h2>
        <StatesMap states={states} isAdmin={admin} />
      </section>
    </div>
  );
}

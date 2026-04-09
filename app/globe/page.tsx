import type { Metadata } from "next";
import Link from "next/link";
import { getPlaces } from "@/lib/content";
import GlobeLoader from "@/components/globe/GlobeLoader";

export const metadata: Metadata = {
  title: "globe",
  description: "places rohan has been",
};

export default function GlobePage() {
  const places = getPlaces();

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-black">
      <GlobeLoader places={places} />
      <Link
        href="/travel-list"
        className="absolute bottom-6 left-6 text-white/40 hover:text-white/70 text-sm transition-colors font-mono"
      >
        view as list →
      </Link>
      <p className="absolute bottom-6 right-6 text-white/20 text-xs font-mono hidden sm:block">
        drag to rotate · scroll to zoom
      </p>
    </div>
  );
}

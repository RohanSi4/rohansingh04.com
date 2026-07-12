"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/lib/types";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" role="status" aria-live="polite">
      <p className="font-mono text-sm text-white/70">loading the globe…</p>
    </div>
  ),
});

export default function GlobeLoader({
  places,
  isAdmin,
}: {
  places: Place[];
  isAdmin: boolean;
}) {
  return <GlobeScene places={places} isAdmin={isAdmin} />;
}

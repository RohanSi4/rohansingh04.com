"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/lib/types";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-white/30 text-sm font-mono">loading...</p>
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

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "globe",
  description: "places rohan has been",
};

// globe forces dark background regardless of site theme
// we handle this via a wrapper class applied server-side
export default function GlobePage() {
  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-black flex items-center justify-center">
      <p className="text-white/40 text-sm">3d globe coming in phase 4</p>
      <Link
        href="/travel-list"
        className="absolute bottom-6 left-6 text-white/40 hover:text-white/70 text-sm transition-colors"
      >
        view as list
      </Link>
    </div>
  );
}

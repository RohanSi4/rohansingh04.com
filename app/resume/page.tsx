import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "resume",
  description: "rohan singh's resume",
};

export default function ResumePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl">resume</h1>
        <a
          href="/resume.pdf"
          download
          className="text-sm text-accent hover:text-accent-dim transition-colors"
        >
          download pdf
        </a>
      </div>
      <p className="text-muted text-sm">coming in phase 3</p>
    </div>
  );
}

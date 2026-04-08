import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "history",
  description: "rohan's work, school, and key events",
};

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-8">history</h1>
      <p className="text-muted text-sm">coming in phase 3</p>
    </div>
  );
}

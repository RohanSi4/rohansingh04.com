import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "guestbook",
  description: "leave a note",
};

export default function GuestbookPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-8">guestbook</h1>
      <p className="text-muted text-sm">coming in phase 5</p>
    </div>
  );
}

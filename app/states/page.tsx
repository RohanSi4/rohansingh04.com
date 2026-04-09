import type { Metadata } from "next";
import { getStates } from "@/lib/content";
import StatesMap from "@/components/states/StatesMap";

export const metadata: Metadata = {
  title: "states",
  description: "us states rohan has visited",
};

export default function StatesPage() {
  const states = getStates();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-8">states</h1>
      <StatesMap states={states} />
    </div>
  );
}

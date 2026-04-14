import type { Metadata } from "next";
import { getStates } from "@/lib/content";
import { isAdmin } from "@/lib/admin-auth";
import StatesMap from "@/components/states/StatesMap";

export const metadata: Metadata = {
  title: "states",
  description: "us states rohan has visited",
};

export default async function StatesPage() {
  const [states, admin] = await Promise.all([getStates(), isAdmin()]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-2xl mb-8">states</h1>
      <StatesMap states={states} isAdmin={admin} />
    </div>
  );
}

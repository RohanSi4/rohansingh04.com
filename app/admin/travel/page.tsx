import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getPlaces } from "@/lib/content";
import TravelPhotoManager from "@/components/admin/TravelPhotoManager";

export const metadata: Metadata = {
  title: "travel photos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TravelPhotoAdminPage() {
  if (!(await isAdmin())) redirect("/admin");
  const places = await getPlaces();

  return (
    <main className="site-container page-section">
      <Link href="/travel-list" className="text-sm text-muted hover:text-fg">
        ← back to travel
      </Link>
      <header className="mt-8 max-w-3xl">
        <p className="eyebrow mb-4">travel photos</p>
        <h1 className="page-title">Drop in the photos. The page handles the rest.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Pick a place, add as many photos as you want, and they will show up in the
          travel photo journal. Uploads save as soon as they finish.
        </p>
      </header>
      <TravelPhotoManager initialPlaces={places} />
    </main>
  );
}

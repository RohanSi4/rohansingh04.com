"use client";

import Image from "next/image";
import { useState } from "react";
import type { Place } from "@/lib/types";
import PhotoUpload from "./PhotoUpload";

export default function TravelPhotoManager({ initialPlaces }: { initialPlaces: Place[] }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [busyPhoto, setBusyPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const sortedPlaces = [...places].sort((a, b) =>
    (b.visitedDate ?? "").localeCompare(a.visitedDate ?? ""),
  );

  function replacePlace(updated: Place) {
    setPlaces((current) => current.map((place) => (
      place.id === updated.id ? updated : place
    )));
  }

  async function attachPhoto(placeId: string, url: string) {
    setError("");
    const response = await fetch(`/api/admin/places/${placeId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error(`could not attach photo (${response.status})`);
    replacePlace(await response.json());
  }

  async function removePhoto(placeId: string, url: string) {
    setBusyPhoto(url);
    setError("");
    try {
      const response = await fetch(`/api/admin/places/${placeId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error(`could not remove photo (${response.status})`);
      replacePlace(await response.json());
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "could not remove photo");
    } finally {
      setBusyPhoto(null);
    }
  }

  return (
    <div className="mt-10 space-y-5">
      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      {sortedPlaces.map((place) => (
        <section key={place.id} className="surface-card grid gap-5 p-5 sm:grid-cols-[12rem_1fr] sm:p-6">
          <div>
            <p className="eyebrow">{place.country}</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">{place.name}</h2>
            <p className="mt-2 text-sm text-muted">
              {place.photos.length} {place.photos.length === 1 ? "photo" : "photos"}
            </p>
          </div>

          <div className="min-w-0">
            {place.photos.length > 0 ? (
              <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {place.photos.map((url) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-bg">
                    <Image
                      src={url}
                      alt={`From ${place.name}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 12rem"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(place.id, url)}
                      disabled={busyPhoto === url}
                      className="absolute right-2 top-2 min-h-11 rounded-full bg-black/75 px-3 text-xs font-medium text-white opacity-100 backdrop-blur-sm transition-opacity disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                      {busyPhoto === url ? "removing" : "remove"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 rounded-xl border border-dashed border-border p-5 text-sm text-muted">
                No photos here yet. Add a few and they will show up in the travel photo journal.
              </p>
            )}

            <PhotoUpload
              folder={`places/${place.id}`}
              label={`add photos from ${place.name}`}
              onUploaded={(url) => attachPhoto(place.id, url)}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

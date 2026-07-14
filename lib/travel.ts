import type { Place } from "./types";

export function addSeedPhotos(
  places: Place[],
  seedPlaces: Place[],
): { places: Place[]; changed: boolean } {
  const seedPhotos = new Map(
    seedPlaces
      .filter((place) => place.photos.length > 0)
      .map((place) => [place.id, place.photos]),
  );
  let changed = false;

  const merged = places.map((place) => {
    const photos = seedPhotos.get(place.id);
    if (!photos || place.photos.length > 0) return place;
    changed = true;
    return { ...place, photos: [...photos] };
  });

  return { places: merged, changed };
}

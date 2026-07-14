import { describe, expect, it } from "vitest";
import type { Place } from "./types";
import { addSeedPhotos } from "./travel";

function place(id: string, photos: string[]): Place {
  return {
    id,
    name: id,
    country: "Test",
    lat: 0,
    lng: 0,
    visitedDate: null,
    notes: "",
    photos,
    tripSlug: null,
  };
}

describe("travel photo seeds", () => {
  it("adds a seeded photo to an existing trip with no photos", () => {
    const result = addSeedPhotos(
      [place("iceland", [])],
      [place("iceland", ["/images/iceland.jpg"])],
    );

    expect(result.changed).toBe(true);
    expect(result.places[0].photos).toEqual(["/images/iceland.jpg"]);
  });

  it("keeps photos already uploaded by the user", () => {
    const result = addSeedPhotos(
      [place("iceland", ["https://blob.example/my-photo.jpg"])],
      [place("iceland", ["/images/iceland.jpg"])],
    );

    expect(result.changed).toBe(false);
    expect(result.places[0].photos).toEqual(["https://blob.example/my-photo.jpg"]);
  });
});

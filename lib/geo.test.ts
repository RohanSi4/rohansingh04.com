import { describe, it, expect } from "vitest";
import { latLngToXyz, xyzToLatLng, angularDistance } from "./geo";

describe("latLngToXyz", () => {
  it("north pole is [0, 1, 0]", () => {
    const [x, y, z] = latLngToXyz(90, 0);
    expect(x).toBeCloseTo(0, 5);
    expect(y).toBeCloseTo(1, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it("south pole is [0, -1, 0]", () => {
    const [x, y, z] = latLngToXyz(-90, 0);
    expect(x).toBeCloseTo(0, 5);
    expect(y).toBeCloseTo(-1, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it("equator / prime meridian is [1, 0, 0]", () => {
    const [x, y, z] = latLngToXyz(0, 0);
    expect(x).toBeCloseTo(1, 5);
    expect(y).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it("output is on the unit sphere (magnitude = 1)", () => {
    const points: [number, number][] = [
      [38.9, -77.0],  // dc
      [51.5, -0.1],   // london
      [-33.9, 151.2], // sydney
      [35.7, 139.7],  // tokyo
    ];
    for (const [lat, lng] of points) {
      const [x, y, z] = latLngToXyz(lat, lng);
      const mag = Math.sqrt(x * x + y * y + z * z);
      expect(mag).toBeCloseTo(1, 5);
    }
  });

  it("radius parameter scales the output", () => {
    const r = 2.5;
    const [x, y, z] = latLngToXyz(0, 0, r);
    const mag = Math.sqrt(x * x + y * y + z * z);
    expect(mag).toBeCloseTo(r, 5);
  });
});

describe("xyzToLatLng", () => {
  it("round-trips through latLngToXyz", () => {
    const cases: [number, number][] = [
      [38.7, -9.1],   // lisbon
      [41.4, 2.2],    // barcelona
      [-22.9, -43.2], // rio
    ];
    for (const [lat, lng] of cases) {
      const [x, y, z] = latLngToXyz(lat, lng);
      const result = xyzToLatLng(x, y, z);
      expect(result.lat).toBeCloseTo(lat, 4);
      expect(result.lng).toBeCloseTo(lng, 4);
    }
  });
});

describe("angularDistance", () => {
  it("same point is 0 degrees", () => {
    expect(angularDistance(40, -74, 40, -74)).toBeCloseTo(0, 5);
  });

  it("opposite poles are 180 degrees", () => {
    expect(angularDistance(90, 0, -90, 0)).toBeCloseTo(180, 3);
  });

  it("DC to London is roughly 53 degrees", () => {
    // ~5900 km / 6371 km earth radius = ~53 degrees of arc
    const deg = angularDistance(38.9, -77.0, 51.5, -0.1);
    expect(deg).toBeGreaterThan(52);
    expect(deg).toBeLessThan(54);
  });
});

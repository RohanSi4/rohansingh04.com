/**
 * Geographic coordinate conversions for the 3D globe.
 *
 * Three.js uses a right-handed coordinate system: Y is up, Z points toward
 * the camera at rest. We map:
 *   latitude  -> elevation above the equatorial plane (Y axis)
 *   longitude -> rotation around the Y axis in the XZ plane
 *
 * The formula is standard spherical-to-Cartesian:
 *   x = R * cos(lat) * cos(lng)
 *   y = R * sin(lat)
 *   z = R * cos(lat) * sin(lng)
 *
 * This puts longitude=0, latitude=0 (null island, Gulf of Guinea) at
 * [R, 0, 0] -- i.e. the rightward face of the sphere. The globe mesh
 * in Earth.tsx may need a Y rotation to align the texture correctly.
 */

/** Convert lat/lng degrees to a unit-sphere XYZ position. */
export function latLngToXyz(
  lat: number,
  lng: number,
  radius = 1
): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.sin(theta);
  return [x, y, z];
}

/** Inverse: convert an XYZ point on a sphere back to lat/lng degrees. */
export function xyzToLatLng(
  x: number,
  y: number,
  z: number
): { lat: number; lng: number } {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const lat = (Math.asin(y / radius) * 180) / Math.PI;
  const lng = (Math.atan2(z, x) * 180) / Math.PI;
  return { lat, lng };
}

/** Great-circle distance between two lat/lng points, in degrees (0-180). */
export function angularDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const [x1, y1, z1] = latLngToXyz(lat1, lng1);
  const [x2, y2, z2] = latLngToXyz(lat2, lng2);
  const dot = x1 * x2 + y1 * y2 + z1 * z2;
  return (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;
}

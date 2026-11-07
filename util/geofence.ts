import type { Feature, Polygon } from 'geojson';

export const GEOFENCE_RADIUS_M = 50;

export type LngLat = [number, number]; // [longitude, latitude]

/** Haversine distance in meters between two [lng, lat] points. */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Polygon approximating a circle of `radiusM` meters around `center`. */
export function circlePolygon(
  center: LngLat,
  radiusM: number = GEOFENCE_RADIUS_M,
  steps = 48,
): Feature<Polygon> {
  const [lng, lat] = center;
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));

  const ring: LngLat[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}
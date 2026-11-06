export type LngLat = [number, number];

const R = 6371000; // earth radius, meters
const rad = (d: number) => (d * Math.PI) / 180;

export const haversine = (a: LngLat, b: LngLat) => {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const insideRing = (p: LngLat, ring: number[][]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > p[1] !== yj > p[1] &&
      p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
};

/** True when the point is inside the shape's outline (needs a geofence). */
export const isInside = (
  p: LngLat,
  shape: { geofence?: { coordinates?: unknown } | null },
) => {
  const ring = (shape.geofence?.coordinates as number[][][] | undefined)?.[0];
  return !!ring && ring.length > 2 && insideRing(p, ring);
};

export const formatDistance = (m: number) =>
  m < 1000
    ? `${Math.max(Math.round(m / 5) * 5, 5)} m`
    : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;

export const formatDuration = (seconds: number) => {
  const mins = Math.max(Math.round(seconds / 60), 1);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};
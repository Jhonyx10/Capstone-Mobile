import { useEffect, useMemo, useRef, useState } from 'react';
import { haversine } from './geo';
import type { LngLat } from './geo';

// change to 'walking' or 'cycling' if tanods usually go on foot
const PROFILE = 'driving';
// fetch a new road route only after the user moved this far (meters)
const REFETCH_DISTANCE = 50;

export interface TripRoute {
  /** starts at the user's current position */
  coordinates: LngLat[];
  meters: number;
  /** null for a straight line */
  seconds: number | null;
  kind: 'road' | 'straight';
}

interface Road {
  key: string;
  coords: LngLat[];
  meters: number;
  seconds: number;
}

/**
 * Route from the user to the operation. Shows a straight line straight away,
 * then swaps in the road route from the Mapbox Directions API when it arrives.
 */
export const useRouteToOperation = (
  from: LngLat | null,
  to: LngLat | null,
  token: string | null,
) => {
  const [road, setRoad] = useState<Road | null>(null);
  const fetchedFrom = useRef<LngLat | null>(null);
  const mounted = useRef(true);
  const toKey = to ? `${to[0]},${to[1]}` : '';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!from || !to || !token) return;
    if (
      fetchedFrom.current &&
      haversine(fetchedFrom.current, from) < REFETCH_DISTANCE &&
      road?.key === toKey
    ) {
      return;
    }
    fetchedFrom.current = from;

    const url =
      `https://api.mapbox.com/directions/v5/mapbox/${PROFILE}/` +
      `${from[0]},${from[1]};${to[0]},${to[1]}` +
      `?geometries=geojson&overview=full&access_token=${token}`;

    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('route'))))
      .then(json => {
        const r = json?.routes?.[0];
        if (r && mounted.current) {
          setRoad({
            key: toKey,
            coords: r.geometry.coordinates,
            meters: r.distance,
            seconds: r.duration,
          });
        }
      })
      .catch(() => {
        // keep the straight line; try again after the next move
        fetchedFrom.current = null;
      });
  }, [from?.[0], from?.[1], toKey, token]);

  const route = useMemo<TripRoute | null>(() => {
    if (!from || !to) return null;
    if (road && road.key === toKey) {
      return {
        coordinates: [from, ...road.coords],
        meters: road.meters,
        seconds: road.seconds,
        kind: 'road',
      };
    }
    return {
      coordinates: [from, to],
      meters: haversine(from, to),
      seconds: null,
      kind: 'straight',
    };
  }, [from?.[0], from?.[1], to?.[0], to?.[1], road, toKey]);

  return route;
};
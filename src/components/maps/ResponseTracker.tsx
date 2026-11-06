import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  ShapeSource,
  LineLayer,
  CircleLayer,
} from '@rnmapbox/maps';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import useAppStore from '../../../store/useAppStore';
import getRequestResponse from '../../hooks/useRequestResponse';
import useUserRequest from '../../hooks/useUserRequest';
import { RequestResponse } from '../../types/RequestResponseType';
import Icon from '../Icon';
import BoundaryLayer, { getBoundaryBounds } from './BoundaryLayer';

// Echo/Pusher setup
const echo = new Echo({
  broadcaster: 'pusher',
  key: 'bc4ea4d02a3232a7df3c',
  cluster: 'ap1',
  forceTLS: true,
  client: new Pusher('bc4ea4d02a3232a7df3c', { cluster: 'ap1' }),
});

interface TanodLocationEvent {
  tanodId: number;
  latitude: number;
  longitude: number;
}

// hex values for Mapbox layers / Icon (same as slate-900, lime-400, red-500)
const COLORS = {
  ink: '#0F172A',
  lime: '#A3E635',
  alert: '#EF4444',
  white: '#FFFFFF',
  slate: '#94A3B8',
};

const toNum = (v: unknown) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// 0.42 km -> "420 m", 1.5 km -> "1.50 km"
const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;

const BOUNDS = getBoundaryBounds();

export default function ResponseTracker({ requestId }: { requestId: number }) {
  const user = useAppStore(s => s.user);
  const mapboxToken = useAppStore(s => s.mapbox_token);

  const [tanodCoords, setTanodCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [routeKm, setRouteKm] = useState<number | null>(null);

  const { data: responses = [] } = getRequestResponse();
  const { data: request } = useUserRequest();

  const requestResponse = responses.find(
    (r: RequestResponse) => r.user_id === user?.id,
  );

  // primitives, so effects don't re-run on every render
  const rLng = toNum(requestResponse?.longitude ?? request?.longitude);
  const rLat = toNum(requestResponse?.latitude ?? request?.latitude);
  const tLng = tanodCoords?.[0] ?? null;
  const tLat = tanodCoords?.[1] ?? null;

  // Listen for Tanod location updates via Pusher
  useEffect(() => {
    const channel = echo.channel('locations');

    channel.listen('.location.updated', (event: TanodLocationEvent) => {
      const lng = toNum(event.longitude);
      const lat = toNum(event.latitude);
      if (lng != null && lat != null) setTanodCoords([lng, lat]);
    });

    return () => {
      echo.leave('locations');
    };
  }, []);

  // Route between Tanod and the request. Coordinates are rounded to ~11 m so
  // small GPS jitter doesn't trigger a new Directions call.
  const routeKey =
    tLng != null && tLat != null && rLng != null && rLat != null
      ? `${tLng.toFixed(4)},${tLat.toFixed(4)};${rLng.toFixed(
          4,
        )},${rLat.toFixed(4)}`
      : null;

  useEffect(() => {
    if (!routeKey || !mapboxToken) return;
    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${routeKey}?geometries=geojson&access_token=${mapboxToken}`,
        );
        const json = await res.json();
        if (cancelled || !json.routes?.length) return;

        setRouteKm(json.routes[0].distance / 1000);
        setRoute({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: json.routes[0].geometry,
              properties: {},
            },
          ],
        });
      } catch (err) {
        if (!cancelled) console.error('Error fetching route:', err);
      }
    };

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [routeKey, mapboxToken]);

  // Both markers are drawn as map layers instead of native PointAnnotation views
  const points = useMemo(() => {
    const features: any[] = [];
    if (rLng != null && rLat != null) {
      features.push({
        type: 'Feature',
        properties: { kind: 'request' },
        geometry: { type: 'Point', coordinates: [rLng, rLat] },
      });
    }
    if (tLng != null && tLat != null) {
      features.push({
        type: 'Feature',
        properties: { kind: 'tanod' },
        geometry: { type: 'Point', coordinates: [tLng, tLat] },
      });
    }
    return { type: 'FeatureCollection' as const, features };
  }, [rLng, rLat, tLng, tLat]);

  const center: [number, number] | undefined =
    tLng != null && tLat != null
      ? [tLng, tLat]
      : rLng != null && rLat != null
      ? [rLng, rLat]
      : undefined;

  const arrived = routeKm != null && routeKm <= 0.02;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Light}
        logoEnabled={false}
        attributionPosition={{ bottom: 8, left: 8 }}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        <Camera
          zoomLevel={15}
          centerCoordinate={center}
          animationMode="easeTo"
          animationDuration={800}
        />
        <BoundaryLayer />
        {/* Route first, so the markers draw on top */}
        {route && (
          <ShapeSource id="trackerRouteSource" shape={route}>
            <LineLayer
              id="trackerRouteCasing"
              style={{
                lineColor: COLORS.ink,
                lineWidth: 8,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
            <LineLayer
              id="trackerRouteLine"
              aboveLayerID="trackerRouteCasing"
              style={{
                lineColor: COLORS.lime,
                lineWidth: 4.5,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          </ShapeSource>
        )}

        <ShapeSource id="trackerPointsSource" shape={points}>
          <CircleLayer
            id="trackerPoints"
            style={{
              circleRadius: 11,
              circleColor: [
                'match',
                ['get', 'kind'],
                'tanod',
                COLORS.lime,
                COLORS.alert,
              ],
              circleStrokeWidth: 3,
              circleStrokeColor: [
                'match',
                ['get', 'kind'],
                'tanod',
                COLORS.ink,
                COLORS.white,
              ],
            }}
          />
        </ShapeSource>
      </MapView>

      {/* Status card */}
      <View style={styles.cardWrap} pointerEvents="none">
        <View className="rounded-3xl bg-slate-900/95 p-4 shadow-lg">
          <View className="flex-row items-end justify-between">
            <View style={{ flexShrink: 1, paddingRight: 12 }}>
              <View className="flex-row items-center gap-1.5">
                <Icon name="alert-triangle" size={14} color={COLORS.slate} />
                <Text className="text-xs text-slate-400">Location</Text>
              </View>
              <Text className="text-2xl font-bold text-white">
                {arrived
                  ? 'The tanod has arrived'
                  : tanodCoords
                  ? 'The tanod is on the way'
                  : 'Waiting for responders...'}
              </Text>
            </View>

            <View className="items-end">
              <View className="flex-row items-center gap-1.5">
                <Icon name="navigation" size={14} color={COLORS.lime} />
                <Text className="text-xs text-slate-400">Distance</Text>
              </View>
              <Text className="text-3xl font-bold text-lime-400">
                {routeKm != null ? formatDistance(routeKm) : '--'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  cardWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
  },
});

import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Camera,
  CircleLayer,
  FillLayer,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';
import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon,
} from 'geojson';
import { useColorScheme } from 'nativewind';
import useAppStore from '../../../store/useAppStore';
import Icon from '../Icon';
import Enter from '../Enter';
import type { Operation, OperationArea } from '../../types/OperationType';
import Mapbox from '@rnmapbox/maps';
import type { LngLat } from '../../../util/geo';
import type { TripRoute } from '../../../util/useRouteToOperation';

/* ---------- shared staffing helpers (also used by OperationDetails) ---------- */

Mapbox.setAccessToken(useAppStore.getState().mapbox_token);

export type AreaState = 'full' | 'partial' | 'empty';

export const STATE_COLORS: Record<AreaState, string> = {
  full: '#65A30D',
  partial: '#3B82F6',
  empty: '#F59E0B',
};

export const STATE_LABELS: Record<AreaState, string> = {
  full: 'Full',
  partial: 'Partial',
  empty: 'Unstaffed',
};

export const activeUsers = (a: OperationArea) =>
  (a.users ?? []).filter(u => (u.pivot?.status ?? u.status) === 'active');

export const areaState = (a: OperationArea): AreaState => {
  const n = activeUsers(a).length;
  if (n === 0) return 'empty';
  return n >= a.capacity ? 'full' : 'partial';
};

/* ---------- map ---------- */

const LIME = '#84CC16';

/** Area(s) the logged-in tanod is assigned to. Not used by any staffing state. */
export const MINE_COLOR = '#7C3AED';

/** The device's own position and the route from it. Distinct from staffing colors. */
export const USER_COLOR = '#DB2777';

const colorByState = [
  'match',
  ['get', 'state'],
  'full',
  STATE_COLORS.full,
  'partial',
  STATE_COLORS.partial,
  STATE_COLORS.empty,
];

const isSelected = ['==', ['get', 'selected'], 1];
const isMine = ['==', ['get', 'mine'], 1];

interface Props {
  operation: Operation;
  areas: OperationArea[];
  selectedAreaId: number | null;
  onSelectArea: (id: number | null) => void;
  /** ids of the areas the logged-in user is assigned to */
  myAreaIds?: number[];
  /** device position */
  userLocation?: LngLat | null;
  /** route from the user to the operation location */
  route?: TripRoute | null;
  /** the operation's own location */
  destination?: LngLat | null;
  /** one-line summary of the trip, e.g. "1.2 km, about 6 min by road" */
  tripLabel?: string | null;
  height?: number;
}

const OperationMap = ({
  operation,
  areas,
  selectedAreaId,
  onSelectArea,
  myAreaIds = [],
  userLocation = null,
  route = null,
  destination = null,
  tripLabel = null,
  height = 300,
}: Props) => {
  const mineKey = myAreaIds.join(',');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cameraRef = useRef<Camera>(null);
  const firstFit = useRef(true);
  const [ready, setReady] = useState(false);

  // box around the operation border and every area
  const bounds = useMemo(() => {
    const pts: number[][] = [...(operation.geofence?.coordinates?.[0] ?? [])];
    areas.forEach(a => pts.push(...(a.geofence?.coordinates?.[0] ?? [])));
    if (!pts.length) return null;
    const lngs = pts.map(p => p[0]);
    const lats = pts.map(p => p[1]);
    return {
      ne: [Math.max(...lngs), Math.max(...lats)],
      sw: [Math.min(...lngs), Math.min(...lats)],
    };
  }, [operation, areas]);

  const fitAll = (duration: number) => {
    if (bounds) {
      cameraRef.current?.fitBounds(
        bounds.ne,
        bounds.sw,
        [60, 40, 60, 40],
        duration,
      );
    }
  };

  // opening zoom-in, and fly to an area when one is selected
  useEffect(() => {
    if (!ready) return;
    const area = areas.find(a => a.id === selectedAreaId);
    if (area) {
      cameraRef.current?.setCamera({
        centerCoordinate: [Number(area.longitude), Number(area.latitude)],
        zoomLevel: 20,
        animationDuration: 700,
        animationMode: 'flyTo',
      });
      return;
    }
    fitAll(firstFit.current ? 1400 : 700);
    firstFit.current = false;
  }, [ready, selectedAreaId]);

  const borderShape = useMemo<Feature<Polygon> | null>(
    () =>
      operation.geofence?.coordinates
        ? {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: operation.geofence.coordinates,
            },
          }
        : null,
    [operation],
  );

  const areaShape = useMemo<FeatureCollection<Polygon>>(
    () => ({
      type: 'FeatureCollection',
      features: areas
        .filter(a => a.geofence?.coordinates)
        .map(a => ({
          type: 'Feature' as const,
          id: a.id,
          properties: {
            id: a.id,
            state: areaState(a),
            selected: a.id === selectedAreaId ? 1 : 0,
            mine: myAreaIds.includes(a.id) ? 1 : 0,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: a.geofence.coordinates,
          },
        })),
    }),
    [areas, selectedAreaId, mineKey],
  );

  // One point per area. Pins, staffing count and name are all drawn by map
  // layers, so there are no native annotation views to mount or remount.
  const pinShape = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: areas
        .filter(
          a =>
            Number.isFinite(Number(a.longitude)) &&
            Number.isFinite(Number(a.latitude)),
        )
        .map(a => ({
          type: 'Feature' as const,
          id: a.id,
          properties: {
            id: a.id,
            name: a.name,
            state: areaState(a),
            selected: a.id === selectedAreaId ? 1 : 0,
            mine: myAreaIds.includes(a.id) ? 1 : 0,
            count: `${activeUsers(a).length}/${a.capacity}`,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [Number(a.longitude), Number(a.latitude)],
          },
        })),
    }),
    [areas, selectedAreaId, mineKey],
  );

  const routeShape = useMemo<Feature<LineString> | null>(
    () =>
      route && route.coordinates.length > 1
        ? {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: route.coordinates },
          }
        : null,
    [route],
  );

  const userShape = useMemo<Feature<Point> | null>(
    () =>
      userLocation
        ? {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: userLocation },
          }
        : null,
    [userLocation?.[0], userLocation?.[1]],
  );

  const destShape = useMemo<Feature<Point> | null>(
    () =>
      destination
        ? {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: destination },
          }
        : null,
    [destination?.[0], destination?.[1]],
  );

  // fit the camera around the whole trip
  const showRoute = () => {
    const pts: number[][] =
      route?.coordinates ??
      (userLocation && destination ? [userLocation, destination] : []);
    if (pts.length < 2) return;
    const lngs = pts.map(p => p[0]);
    const lats = pts.map(p => p[1]);
    cameraRef.current?.fitBounds(
      [Math.max(...lngs), Math.max(...lats)],
      [Math.min(...lngs), Math.min(...lats)],
      [90, 60, 90, 60],
      800,
    );
  };

  return (
    <View
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700"
    >
      <MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Light}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        compassEnabled={false}
        pitchEnabled={false}
        onDidFinishLoadingMap={() => setReady(true)}
      >
        <Camera
          ref={cameraRef}
          maxZoomLevel={21}
          defaultSettings={{
            centerCoordinate: [
              Number(operation.longitude),
              Number(operation.latitude),
            ],
            zoomLevel: 15,
          }}
        />

        {/* operation border */}
        {borderShape && (
          <ShapeSource id="opBorder" shape={borderShape}>
            <FillLayer
              id="opBorderFill"
              style={{ fillColor: LIME, fillOpacity: 0.08 }}
            />
            <LineLayer
              id="opBorderLine"
              style={{ lineColor: LIME, lineWidth: 2.5, lineDasharray: [2, 2] }}
            />
          </ShapeSource>
        )}

        {/* areas, colored by staffing */}
        <ShapeSource id="opAreas" shape={areaShape}>
          <FillLayer
            id="opAreasFill"
            style={{
              fillColor: ['case', isMine, MINE_COLOR, colorByState] as never,
              fillOpacity: [
                'case',
                isSelected,
                0.55,
                isMine,
                0.4,
                0.3,
              ] as never,
            }}
          />
          <LineLayer
            id="opAreasLine"
            style={{
              lineColor: ['case', isMine, MINE_COLOR, colorByState] as never,
              lineWidth: [
                'case',
                ['all', isSelected, isMine],
                5,
                isSelected,
                3,
                isMine,
                4,
                1.5,
              ] as never,
            }}
          />
        </ShapeSource>

        {/* route from the user to the operation */}
        {routeShape && (
          <ShapeSource id="opRoute" shape={routeShape}>
            {/* white outline, road routes only */}
            <LineLayer
              id="opRouteCasing"
              style={{
                lineColor: '#FFFFFF',
                lineWidth: 7,
                lineOpacity: route?.kind === 'road' ? 0.9 : 0,
                lineCap: 'round' as const,
                lineJoin: 'round' as const,
              }}
            />
            {/* solid line for a road route */}
            <LineLayer
              id="opRouteLine"
              style={{
                lineColor: USER_COLOR,
                lineWidth: 4,
                lineOpacity: route?.kind === 'road' ? 1 : 0,
                lineCap: 'round' as const,
                lineJoin: 'round' as const,
              }}
            />
            {/* dashed line for the straight-line fallback */}
            <LineLayer
              id="opRouteStraight"
              style={{
                lineColor: USER_COLOR,
                lineWidth: 4,
                lineOpacity: route?.kind === 'straight' ? 1 : 0,
                lineDasharray: [1.5, 1.5],
              }}
            />
          </ShapeSource>
        )}

        {/* the operation location */}
        {destShape && (
          <ShapeSource id="opDest" shape={destShape}>
            <CircleLayer
              id="opDestDot"
              style={{
                circleRadius: 9,
                circleColor: '#FFFFFF',
                circleStrokeColor: '#5D8736',
                circleStrokeWidth: 4,
              }}
            />
            <SymbolLayer
              id="opDestLabel"
              style={{
                textField: 'Operation',
                textSize: 12,
                textOffset: [0, -1.9],
                textAllowOverlap: true,
                textColor: '#5D8736',
                textHaloColor: isDark ? '#0F172A' : '#FFFFFF',
                textHaloWidth: 1.5,
              }}
            />
          </ShapeSource>
        )}

        {/* tappable pins: halo, dot, staffing count, name */}
        <ShapeSource
          id="opPins"
          shape={pinShape}
          hitbox={{ width: 44, height: 44 }}
          onPress={e => {
            const id = e.features?.[0]?.properties?.id;
            if (id !== undefined && id !== null) onSelectArea(Number(id));
          }}
        >
          <CircleLayer
            id="opPinHalo"
            filter={['any', isSelected, isMine] as never}
            style={{
              circleRadius: 26,
              circleColor: ['case', isMine, MINE_COLOR, colorByState] as never,
              circleOpacity: 0.3,
            }}
          />
          <CircleLayer
            id="opPinDot"
            style={{
              circleRadius: ['case', isSelected, 18, isMine, 17, 15] as never,
              circleColor: colorByState as never,
              circleStrokeColor: [
                'case',
                isMine,
                MINE_COLOR,
                '#FFFFFF',
              ] as never,
              circleStrokeWidth: ['case', isMine, 4, 2] as never,
            }}
          />
          <SymbolLayer
            id="opPinCount"
            style={{
              textField: ['get', 'count'] as never,
              textSize: 11,
              textColor: '#FFFFFF',
              textAllowOverlap: true,
              textIgnorePlacement: true,
            }}
          />
          <SymbolLayer
            id="opPinName"
            style={{
              textField: [
                'case',
                isMine,
                ['concat', ['get', 'name'], ' (you)'],
                ['get', 'name'],
              ] as never,
              textSize: 12,
              textOffset: [0, 2.2],
              textAllowOverlap: true,
              textColor: isDark ? '#E2E8F0' : '#1F2937',
              textHaloColor: isDark ? '#0F172A' : '#FFFFFF',
              textHaloWidth: 1.5,
            }}
          />
        </ShapeSource>

        {/* where the user is right now */}
        {userShape && (
          <ShapeSource id="opUser" shape={userShape}>
            <CircleLayer
              id="opUserHalo"
              style={{
                circleRadius: 18,
                circleColor: USER_COLOR,
                circleOpacity: 0.25,
              }}
            />
            <CircleLayer
              id="opUserDot"
              style={{
                circleRadius: 7,
                circleColor: USER_COLOR,
                circleStrokeColor: '#FFFFFF',
                circleStrokeWidth: 3,
              }}
            />
            <SymbolLayer
              id="opUserLabel"
              style={{
                textField: 'You',
                textSize: 12,
                textOffset: [0, -1.8],
                textAllowOverlap: true,
                textColor: USER_COLOR,
                textHaloColor: isDark ? '#0F172A' : '#FFFFFF',
                textHaloWidth: 1.5,
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      {/* legend */}
      <Enter
        index={2}
        className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-white/90 px-3 py-1.5 dark:bg-slate-800/90"
      >
        {(['full', 'partial', 'empty'] as AreaState[]).map(s => (
          <View key={s} className="mr-3 flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATE_COLORS[s] }}
            />
            <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
              {STATE_LABELS[s]}
            </Text>
          </View>
        ))}
        {userLocation && (
          <View className="mr-3 flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: USER_COLOR }}
            />
            <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
              You
            </Text>
          </View>
        )}
        {myAreaIds.length > 0 && (
          <View className="mr-1 flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: MINE_COLOR }}
            />
            <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
              Your area
            </Text>
          </View>
        )}
      </Enter>

      {/* show the whole operation again */}
      <Enter index={3} className="absolute right-3 top-3">
        <Pressable
          onPress={() => {
            onSelectArea(null);
            fitAll(700);
          }}
          accessibilityLabel="Show whole operation"
          className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:opacity-80 dark:bg-slate-800/90"
        >
          <Icon name="crosshair" tone="neutral" size={20} />
        </Pressable>
      </Enter>

      {/* the one distance: user to the operation */}
      {tripLabel ? (
        <Enter
          index={4}
          className="absolute left-3 top-3 max-w-[70%] flex-row items-center rounded-full bg-white/90 px-3 py-1.5 dark:bg-slate-800/90"
        >
          <Icon name="crosshair" color={USER_COLOR} size={14} />
          <Text
            numberOfLines={1}
            className="ml-1.5 flex-shrink text-xs font-semibold text-gray-800 dark:text-gray-100"
          >
            {tripLabel}
          </Text>
        </Enter>
      ) : null}

      {/* show the whole route */}
      {userLocation && destination ? (
        <Enter index={5} className="absolute right-3 top-16">
          <Pressable
            onPress={showRoute}
            accessibilityLabel="Show route to the operation"
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:opacity-80 dark:bg-slate-800/90"
          >
            <Icon name="map" color={USER_COLOR} size={20} />
          </Pressable>
        </Enter>
      ) : null}
    </View>
  );
};

export default OperationMap;

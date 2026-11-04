import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Camera,
  FillLayer,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';
import type { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { useColorScheme } from 'nativewind';
import useAppStore from '../../../store/useAppStore';
import Icon from '../Icon';
import Enter from '../Enter';
import type { Operation, OperationArea } from '../../types/OperationType';
import Config from 'react-native-config';
import Mapbox from '@rnmapbox/maps';

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

console.log('CONFIG TOKEN:', JSON.stringify(Config.MAPBOX_TOKEN));
console.log(
  'STORE TOKEN:',
  JSON.stringify(useAppStore.getState().mapbox_token),
);

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

/** Pin for an area: color shows staffing; selected pin gets a halo and grows */
const AreaPin = ({
  state,
  selected,
}: {
  state: AreaState;
  selected: boolean;
}) => (
  <View className="h-12 w-12 items-center justify-center">
    {selected && (
      <View
        className="absolute h-11 w-11 rounded-full"
        style={{ backgroundColor: `${STATE_COLORS[state]}55` }}
      />
    )}
    <View
      className="h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md"
      style={{
        backgroundColor: STATE_COLORS[state],
        transform: [{ scale: selected ? 1.15 : 1 }],
      }}
    >
      <Icon name="shield" size={16} strokeWidth={2.4} color="#FFFFFF" />
    </View>
  </View>
);

interface Props {
  operation: Operation;
  areas: OperationArea[];
  selectedAreaId: number | null;
  onSelectArea: (id: number | null) => void;
  height?: number;
}

const OperationMap = ({
  operation,
  areas,
  selectedAreaId,
  onSelectArea,
  height = 300,
}: Props) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const map_styles = useAppStore(s => s.map_styles);
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
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: a.geofence.coordinates,
          },
        })),
    }),
    [areas, selectedAreaId],
  );

  const labelShape = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: areas
        .filter(a => Number.isFinite(Number(a.longitude)))
        .map(a => ({
          type: 'Feature' as const,
          id: a.id,
          properties: { name: a.name },
          geometry: {
            type: 'Point' as const,
            coordinates: [Number(a.longitude), Number(a.latitude)],
          },
        })),
    }),
    [areas],
  );

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
              fillColor: colorByState as never,
              fillOpacity: ['case', isSelected, 0.55, 0.3] as never,
            }}
          />
          <LineLayer
            id="opAreasLine"
            style={{
              lineColor: colorByState as never,
              lineWidth: ['case', isSelected, 3, 1.5] as never,
            }}
          />
        </ShapeSource>

        {/* names under the pins */}
        <ShapeSource id="opLabels" shape={labelShape}>
          <SymbolLayer
            id="opLabelText"
            style={{
              textField: ['get', 'name'] as never,
              textSize: 12,
              textOffset: [0, 2.2],
              textAllowOverlap: true,
              textColor: isDark ? '#E2E8F0' : '#1F2937',
              textHaloColor: isDark ? '#0F172A' : '#FFFFFF',
              textHaloWidth: 1.5,
            }}
          />
        </ShapeSource>

        {/* tappable pins */}
        {areas.map(a => {
          const selected = a.id === selectedAreaId;
          return (
            <PointAnnotation
              key={`area-${a.id}-${selected ? 1 : 0}`}
              id={`area-${a.id}`}
              coordinate={[Number(a.longitude), Number(a.latitude)]}
              anchor={{ x: 0.5, y: 0.5 }}
              onSelected={() => onSelectArea(a.id)}
            >
              <AreaPin state={areaState(a)} selected={selected} />
            </PointAnnotation>
          );
        })}
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
    </View>
  );
};

export default OperationMap;

import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Camera,
  CircleLayer,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import useAppStore from '../../../store/useAppStore';
import Icon from '../Icon';
import Enter from '../Enter';
import Mapbox from '@rnmapbox/maps';
import type { SightingPoint } from '../../../util/sightingsHelper';

Mapbox.setAccessToken(useAppStore.getState().mapbox_token);

const THEME = '#5D8736';
export const LATEST_COLOR = '#DC2626';
export const EARLIER_COLOR = THEME;

const colorByLatest = [
  'case',
  ['==', ['get', 'latest'], 1],
  LATEST_COLOR,
  EARLIER_COLOR,
];
const isSelected = ['==', ['get', 'selected'], 1];

interface Props {
  /** newest first, as returned by normalizeSightings */
  sightings: SightingPoint[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  height?: number;
}

const SightingsMap = ({
  sightings,
  selectedId,
  onSelect,
  height = 300,
}: Props) => {
  const cameraRef = useRef<Camera>(null);
  const firstFit = useRef(true);
  const [ready, setReady] = useState(false);

  const bounds = useMemo(() => {
    if (!sightings.length) return null;
    const lngs = sightings.map(s => s.lng);
    const lats = sightings.map(s => s.lat);
    return {
      ne: [Math.max(...lngs), Math.max(...lats)],
      sw: [Math.min(...lngs), Math.min(...lats)],
    };
  }, [sightings]);

  const fitAll = (duration: number) => {
    if (!bounds) return;
    if (sightings.length === 1) {
      cameraRef.current?.setCamera({
        centerCoordinate: [sightings[0].lng, sightings[0].lat],
        zoomLevel: 16,
        animationDuration: duration,
        animationMode: 'flyTo',
      });
      return;
    }
    cameraRef.current?.fitBounds(
      bounds.ne,
      bounds.sw,
      [70, 50, 70, 50],
      duration,
    );
  };

  // opening zoom-in, and fly to a sighting when one is selected
  useEffect(() => {
    if (!ready) return;
    const s = sightings.find(x => x.id === selectedId);
    if (s) {
      cameraRef.current?.setCamera({
        centerCoordinate: [s.lng, s.lat],
        zoomLevel: 17,
        animationDuration: 700,
        animationMode: 'flyTo',
      });
      return;
    }
    fitAll(firstFit.current ? 1400 : 700);
    firstFit.current = false;
  }, [ready, selectedId]);

  // path in the order it was seen, oldest to newest
  const trailShape = useMemo<Feature<LineString> | null>(() => {
    if (sightings.length < 2) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [...sightings].reverse().map(s => [s.lng, s.lat]),
      },
    };
  }, [sightings]);

  const pointShape = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: sightings.map(s => ({
        type: 'Feature' as const,
        id: s.id,
        properties: {
          id: s.id,
          n: String(s.n),
          latest: s.latest ? 1 : 0,
          selected: s.id === selectedId ? 1 : 0,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [s.lng, s.lat],
        },
      })),
    }),
    [sightings, selectedId],
  );

  const first = sightings[sightings.length - 1] ?? sightings[0];

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
            centerCoordinate: [first.lng, first.lat],
            zoomLevel: 15,
          }}
        />

        {/* movement trail */}
        {trailShape && (
          <ShapeSource id="sightTrail" shape={trailShape}>
            <LineLayer
              id="sightTrailLine"
              style={{
                lineColor: EARLIER_COLOR,
                lineWidth: 2.5,
                lineOpacity: 0.7,
                lineDasharray: [2, 2],
              }}
            />
          </ShapeSource>
        )}

        {/* tappable sightings: halo, dot, sequence number */}
        <ShapeSource
          id="sightPoints"
          shape={pointShape}
          hitbox={{ width: 44, height: 44 }}
          onPress={e => {
            const id = e.features?.[0]?.properties?.id;
            if (id !== undefined && id !== null) onSelect(Number(id));
          }}
        >
          <CircleLayer
            id="sightHalo"
            filter={isSelected as never}
            style={{
              circleRadius: 26,
              circleColor: colorByLatest as never,
              circleOpacity: 0.3,
            }}
          />
          <CircleLayer
            id="sightDot"
            style={{
              circleRadius: ['case', isSelected, 17, 14] as never,
              circleColor: colorByLatest as never,
              circleStrokeColor: '#FFFFFF',
              circleStrokeWidth: 2,
            }}
          />
          <SymbolLayer
            id="sightNumber"
            style={{
              textField: ['get', 'n'] as never,
              textSize: 12,
              textColor: '#FFFFFF',
              textAllowOverlap: true,
              textIgnorePlacement: true,
            }}
          />
        </ShapeSource>
      </MapView>

      {/* legend */}
      <Enter
        index={2}
        className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-white/90 px-3 py-1.5 dark:bg-slate-800/90"
      >
        {[
          { color: LATEST_COLOR, label: 'Latest' },
          { color: EARLIER_COLOR, label: 'Earlier' },
        ].map(l => (
          <View key={l.label} className="mr-3 flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            <Text className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
              {l.label}
            </Text>
          </View>
        ))}
      </Enter>

      {/* show every sighting again */}
      <Enter index={3} className="absolute right-3 top-3">
        <Pressable
          onPress={() => {
            onSelect(null);
            fitAll(700);
          }}
          accessibilityLabel="Show all sightings"
          className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:opacity-80 dark:bg-slate-800/90"
        >
          <Icon name="crosshair" tone="neutral" size={20} />
        </Pressable>
      </Enter>
    </View>
  );
};

export default SightingsMap;

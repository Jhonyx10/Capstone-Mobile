import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  Camera,
  HeatmapLayer,
  PointAnnotation,
  ShapeSource,
} from '@rnmapbox/maps';
import type { FeatureCollection, Point } from 'geojson';
import { useQuery } from '@tanstack/react-query';
import useAppStore from '../../../store/useAppStore';
import { getIncidentLocations } from '../../../util/getIncidentLocations';
// adjust this path to wherever your Icon.tsx lives
import Icon from '../Icon';
import BoundaryLayer, { getBoundaryBounds } from './BoundaryLayer';

const bounds = getBoundaryBounds();

/** Pin for a past incident: deep-red badge, a step quieter than the live request pins */
const IncidentPin = () => (
  <View className="h-9 w-9 items-center justify-center">
    <View className="h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-red-900 shadow-md">
      <Icon name="alert-circle" size={16} strokeWidth={2.4} color="#FFFFFF" />
    </View>
  </View>
);

const IncidentLocations = () => {
  const { base_url, token } = useAppStore();

  const { data } = useQuery({
    queryKey: ['incident_locations'],
    queryFn: () => getIncidentLocations({ base_url, token }),
    enabled: !!token,
  });

  // Only rows with usable coordinates
  const incidents = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map((item: any, index: number) => ({
        id: String(item?.id ?? index),
        // accept nested { location: {...} } or flat fields; Laravel often sends decimals as strings
        lng: Number(item?.location?.longitude ?? item?.longitude),
        lat: Number(item?.location?.latitude ?? item?.latitude),
      }))
      .filter(i => Number.isFinite(i.lng) && Number.isFinite(i.lat))
      .map(i => ({
        id: i.id,
        coords: [i.lng, i.lat] as [number, number],
      }));
  }, [data]);

  // Same points as GeoJSON for the heatmap
  const shape = useMemo<FeatureCollection<Point> | null>(() => {
    if (!incidents.length) return null;
    return {
      type: 'FeatureCollection',
      features: incidents.map(i => ({
        type: 'Feature' as const,
        id: i.id,
        properties: {},
        geometry: { type: 'Point' as const, coordinates: i.coords },
      })),
    };
  }, [incidents]);

  return (
    <>
      {/* Frame the whole barangay when the heatmap opens */}
      {bounds && (
        <Camera
          bounds={{
            ...bounds,
            paddingTop: 120,
            paddingBottom: 60,
            paddingLeft: 40,
            paddingRight: 40,
          }}
          animationDuration={0}
        />
      )}

      <BoundaryLayer />

      {/* Heat underneath... */}
      {shape && (
        <ShapeSource id="incidentSource" shape={shape}>
          <HeatmapLayer
            id="incidentHeat"
            maxZoomLevel={17}
            style={{
              heatmapRadius: [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                18,
                16,
                48,
              ],
              heatmapIntensity: [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                0.8,
                16,
                2,
              ],
              heatmapOpacity: 0.8,
              // transparent -> yellow -> orange -> red -> deep red
              heatmapColor: [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(254, 240, 138, 0)',
                0.2,
                'rgba(254, 240, 138, 0.6)',
                0.45,
                'rgba(251, 146, 60, 0.8)',
                0.7,
                'rgba(239, 68, 68, 0.9)',
                1,
                'rgba(127, 29, 29, 1)',
              ],
            }}
          />
        </ShapeSource>
      )}

      {/* ...pins on top, always visible at every zoom */}
      {incidents.map(item => (
        <PointAnnotation
          key={`incident-${item.id}`}
          id={`incident-${item.id}`}
          coordinate={item.coords}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <IncidentPin />
        </PointAnnotation>
      ))}
    </>
  );
};

export default IncidentLocations;

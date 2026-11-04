import React from 'react';
import { FillLayer, LineLayer, ShapeSource } from '@rnmapbox/maps';
import type { FeatureCollection } from 'geojson';
// adjust the file name if yours differs (e.g. .geojson). Needs
// "resolveJsonModule": true in tsconfig.json.
import boundaryJson from '../../assets/geometry/igpityoungsville.json';

// Accept a FeatureCollection, a single Feature, or a bare geometry
const toFeatureCollection = (g: any): FeatureCollection => {
  if (g?.type === 'FeatureCollection') return g;
  if (g?.type === 'Feature')
    return { type: 'FeatureCollection', features: [g] };
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: g }],
  };
};

export const boundaryShape = toFeatureCollection(boundaryJson);

// Bounding box of the boundary, used to frame the map
export const getBoundaryBounds = (): {
  ne: [number, number];
  sw: [number, number];
} | null => {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const walk = (c: any) => {
    if (typeof c?.[0] === 'number') {
      minLng = Math.min(minLng, c[0]);
      maxLng = Math.max(maxLng, c[0]);
      minLat = Math.min(minLat, c[1]);
      maxLat = Math.max(maxLat, c[1]);
    } else if (Array.isArray(c)) {
      c.forEach(walk);
    }
  };
  boundaryShape.features.forEach((f: any) => walk(f.geometry?.coordinates));

  if (!isFinite(minLng)) return null;
  return { ne: [maxLng, maxLat], sw: [minLng, minLat] };
};

/** Barangay boundary: faint lime wash with a dashed outline. Drop it inside any MapView. */
const BoundaryLayer = () => (
  <ShapeSource id="boundarySource" shape={boundaryShape}>
    <FillLayer
      id="boundaryFill"
      style={{ fillColor: '#A3E635', fillOpacity: 0.08 }}
    />
    <LineLayer
      id="boundaryLine"
      style={{
        lineColor: '#4D7C0F', // lime-700, readable on the light base map
        lineWidth: 2.5,
        lineDasharray: [2, 1.5],
        lineJoin: 'round',
      }}
    />
  </ShapeSource>
);

export default BoundaryLayer;

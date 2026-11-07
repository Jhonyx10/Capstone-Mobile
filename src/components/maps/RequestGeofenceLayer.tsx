import React, { useMemo } from 'react';
import { ShapeSource, FillLayer, LineLayer, CircleLayer } from '@rnmapbox/maps';
import type { FeatureCollection } from 'geojson';
import getRequestResponse from '../../hooks/useRequestResponse';
import { getRequestCoords } from '../../hooks/useDuplicateRequest';
import { circlePolygon, GEOFENCE_RADIUS_M } from '../../../util/geofence';

const RED = '#EF4444';
const WHITE = '#FFFFFF';

/** Draws every incident request as a pin with a 50 m geofence around it. */
const RequestGeofenceLayer = () => {
  const { data } = getRequestResponse() as { data?: any[] };

  const { pins, fences } = useMemo(() => {
    const pins: FeatureCollection = { type: 'FeatureCollection', features: [] };
    const fences: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    (Array.isArray(data) ? data : []).forEach((r, i) => {
      const coords = getRequestCoords(r);
      if (!coords) return;

      pins.features.push({
        type: 'Feature',
        id: r.id ?? i,
        properties: { id: r.id ?? i },
        geometry: { type: 'Point', coordinates: coords },
      });
      fences.features.push(circlePolygon(coords, GEOFENCE_RADIUS_M));
    });

    return { pins, fences };
  }, [data]);

  return (
    <>
      {/* geofences first so the pins draw on top */}
      <ShapeSource id="requestGeofenceSource" shape={fences}>
        <FillLayer
          id="requestGeofenceFill"
          style={{ fillColor: RED, fillOpacity: 0.15 }}
        />
        <LineLayer
          id="requestGeofenceLine"
          style={{ lineColor: RED, lineWidth: 1.5, lineDasharray: [2, 2] }}
        />
      </ShapeSource>

      <ShapeSource id="requestPinSource" shape={pins}>
        <CircleLayer
          id="requestPinDot"
          style={{
            circleRadius: 8,
            circleColor: RED,
            circleStrokeWidth: 2.5,
            circleStrokeColor: WHITE,
          }}
        />
      </ShapeSource>
    </>
  );
};

export default RequestGeofenceLayer;

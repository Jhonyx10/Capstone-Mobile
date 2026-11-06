import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type { LngLat } from './geo';

type Fix = { coords: { latitude: number; longitude: number } };

/**
 * Live position of the device, as [lng, lat]. Uses Mapbox's location manager,
 * so no extra location package is needed.
 */
export const useUserLocation = () => {
  const [coords, setCoords] = useState<LngLat | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;
    const onUpdate = (loc: Fix) => {
      if (active) {
        setCoords([loc.coords.longitude, loc.coords.latitude]);
      }
    };

    (async () => {
      try {
        const granted =
          Platform.OS === 'android'
            ? await Mapbox.requestAndroidLocationPermissions()
            : true;
        if (!active) return;
        if (!granted) {
          setDenied(true);
          return;
        }
        const last = await Mapbox.locationManager.getLastKnownLocation();
        if (last) onUpdate(last as Fix);
        Mapbox.locationManager.addListener(onUpdate as never);
        Mapbox.locationManager.start(5); // meters between updates
      } catch {
        if (active) setDenied(true);
      }
    })();

    return () => {
      active = false;
      Mapbox.locationManager.removeListener(onUpdate as never);
    };
  }, []);

  return { coords, denied };
};
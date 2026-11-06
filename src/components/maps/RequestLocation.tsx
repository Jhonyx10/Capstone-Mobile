import Mapbox, { UserLocation, Camera } from '@rnmapbox/maps';
import useAppStore from '../../../store/useAppStore';
import BoundaryLayer from './BoundaryLayer';

Mapbox.setAccessToken(useAppStore.getState().mapbox_token);

interface Props {
  onLocationChange?: (coords: [number, number]) => void;
}

const RequestLocation = ({ onLocationChange }: Props) => (
  <>
    {/* Boundary at the bottom so everything else draws on top */}
    <BoundaryLayer />

    <UserLocation
      visible
      onUpdate={location => {
        if (!location?.coords) return;
        onLocationChange?.([
          location.coords.longitude,
          location.coords.latitude,
        ]);
      }}
    />

    <Camera
      // shown until the first GPS fix, so the map doesn't start over Europe
      defaultSettings={{
        centerCoordinate: [124.5736, 8.5222],
        zoomLevel: 15,
      }}
      zoomLevel={15}
      maxZoomLevel={22}
      minZoomLevel={14}
      followUserLocation
      followUserMode={Mapbox.UserTrackingMode.Follow}
    />
  </>
);

export default RequestLocation;

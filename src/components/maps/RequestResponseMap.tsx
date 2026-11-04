import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Mapbox, {
  UserLocation,
  Camera,
  PointAnnotation,
  ShapeSource,
  LineLayer,
} from '@rnmapbox/maps';
import getRequestResponse from '../../hooks/useRequestResponse';
import useAppStore from '../../../store/useAppStore';
import useResponseStore from '../../../store/useResponseStore';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
// adjust this path to wherever your Icon.tsx lives
import Icon from '../Icon';
import BoundaryLayer from './BoundaryLayer';

type ReportFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'report'
>;

interface Props {
  mapboxToken: string;
  seconds: number;
  currentDistance: number;
  setCurrentDistance: React.Dispatch<React.SetStateAction<number>>;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// Same values as Tailwind slate-900 / lime-400 / red-500 (needed as hex for
// Mapbox layers and Icon colors, which cannot take className)
const COLORS = {
  ink: '#0F172A',
  lime: '#A3E635',
  alert: '#EF4444',
  white: '#FFFFFF',
};

// Haversine distance function (in km)
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Pin for a request: red alert badge, or a dark badge with a lime flag once selected. */
const RequestPin = ({ selected }: { selected: boolean }) => (
  <View className="h-14 w-14 items-center justify-center">
    {selected && (
      <View className="absolute h-[52px] w-[52px] rounded-full bg-lime-400/30" />
    )}
    <View
      className={`items-center justify-center rounded-full border-[2.5px] shadow-md ${
        selected
          ? 'h-10 w-10 border-lime-400 bg-slate-900'
          : 'h-[34px] w-[34px] border-white bg-red-500'
      }`}
    >
      <Icon
        name={selected ? 'flag' : 'alert-triangle'}
        size={selected ? 18 : 16}
        strokeWidth={2.4}
        color={selected ? COLORS.lime : COLORS.white}
      />
    </View>
  </View>
);

const RequestResponseMap = ({
  mapboxToken,
  seconds,
  setCurrentDistance,
  start,
  stop,
  reset,
}: Props) => {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // zustand states
  const {
    route,
    setRoute,
    selectedDestination,
    setSelectedDestination,
    setDistance,
    setResponseTime,
    setRequestId,
  } = useResponseStore();

  const { user, token, base_url, setCurrentLocation } = useAppStore();
  const { data } = getRequestResponse();
  const navigation = useNavigation<ReportFormNavigationProp>();

  // Update route whenever user moves or destination changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userCoords || !selectedDestination) return;

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${selectedDestination.coords[0]},${selectedDestination.coords[1]}?geometries=geojson&access_token=${mapboxToken}`,
        );
        const json = await res.json();

        if (json.routes && json.routes.length > 0) {
          const routeData = json.routes[0];

          const routeDistance = parseFloat(
            (routeData.distance / 1000).toFixed(2),
          );
          setDistance(routeDistance);

          setRoute({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: routeData.geometry,
                properties: {},
              },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching route:', err);
      }
    };

    fetchRoute();
  }, [selectedDestination, userCoords, mapboxToken]);

  // Stream Tanod location continuously
  useEffect(() => {
    if (!user?.id || !selectedDestination) return;
    let subscription: any;

    async function startStreaming() {
      const granted = await Mapbox.requestAndroidLocationPermissions();
      if (!granted) return;

      subscription = Mapbox.locationManager.addListener(location => {
        const { latitude, longitude } = location.coords;

        if (!token) return;

        if (selectedDestination) {
          const [reqLon, reqLat] = selectedDestination.coords;
          const distance = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            reqLat,
            reqLon,
          );
          setCurrentDistance(distance);

          if (distance <= 0.02) {
            stop();
            reset();
            setResponseTime(seconds);
            navigation.navigate('report_form');
            if (subscription) subscription.remove();
            Mapbox.locationManager.stop();
            return;
          }
        }

        // Send Tanod location to backend to trigger broadcast
        axios.post(
          `${base_url}update-location`,
          { user_id: user?.id, latitude, longitude },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      });

      Mapbox.locationManager.start();
    }

    startStreaming();

    return () => {
      if (subscription) subscription.remove();
      Mapbox.locationManager.stop();
    };
  }, [user?.id, token, base_url, selectedDestination]);

  return (
    <>
      {/* Boundary at the bottom, then the route, so markers draw on top */}
      <BoundaryLayer />

      {route && (
        <ShapeSource id="selectedRouteSource" shape={route}>
          {/* dark casing gives the line contrast on any map style */}
          <LineLayer
            id="selectedRouteCasing"
            style={{
              lineColor: COLORS.ink,
              lineWidth: 8,
              lineJoin: 'round',
              lineCap: 'round',
            }}
          />
          <LineLayer
            id="selectedRouteLine"
            aboveLayerID="selectedRouteCasing"
            style={{
              lineColor: COLORS.lime,
              lineWidth: 4.5,
              lineJoin: 'round',
              lineCap: 'round',
            }}
          />
        </ShapeSource>
      )}

      {/* Tanod's own position */}
      <UserLocation
        visible
        onUpdate={location => {
          if (!location?.coords) return;

          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setUserCoords([location.coords.longitude, location.coords.latitude]);
          setCurrentLocation(coords);
        }}
      />

      {/* Camera follows Tanod */}
      <Camera
        zoomLevel={15}
        maxZoomLevel={22}
        minZoomLevel={14}
        followUserLocation
        followUserMode={Mapbox.UserTrackingMode.Follow}
      />

      {/* Request markers */}
      {Array.isArray(data) &&
        data.map((item: any, index: number) => {
          const selected = selectedDestination?.request_id === item.id;
          return (
            <PointAnnotation
              // selected state is in the key so Android re-snapshots the view
              key={`marker-${item.id ?? index}-${selected ? 'on' : 'off'}`}
              id={`marker-${item.id ?? index}`}
              title={`Request ${item.id}`}
              coordinate={[item.longitude, item.latitude]}
              anchor={{ x: 0.5, y: 0.5 }}
              onSelected={() => {
                reset();
                start();
                setRequestId(item.id);
                setSelectedDestination({
                  coords: [item.longitude, item.latitude],
                  request_id: item.id,
                });
              }}
            >
              <RequestPin selected={selected} />
            </PointAnnotation>
          );
        })}
    </>
  );
};

export default RequestResponseMap;

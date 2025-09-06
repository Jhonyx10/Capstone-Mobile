import React, { useEffect, useState } from "react";
import { View} from "react-native";
import Mapbox, {
  UserLocation,
  Camera,
  PointAnnotation,
  ShapeSource,
  LineLayer,
} from "@rnmapbox/maps";
import type { FeatureCollection, LineString } from "geojson";
import getRequestResponse from "../../hooks/useRequestResponse";
import useAppStore from "../../../store/useAppStore";
import useResponseStore from "../../../store/useResponseStore";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation"; 

type ReportFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'report'>;

interface Props {
  mapboxToken: string;
  seconds: number;
  currentDistance: number;
  setCurrentDistance: React.Dispatch<React.SetStateAction<number>>;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

interface SelectedDestination {
  coords: [number, number];
  request_id: number;
}

// Haversine distance function (in km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const RequestResponseMap = ({ mapboxToken, seconds,  setCurrentDistance, start, stop, reset }: Props) => {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<FeatureCollection<LineString> | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<SelectedDestination | null>(null);
  const { setDistance, setResponseTime } = useResponseStore()
  const { user, token, base_url } = useAppStore();
  const { data } = getRequestResponse();
  const navigation = useNavigation<ReportFormNavigationProp>();

  // 🚘 Update route whenever user moves or destination changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userCoords || !selectedDestination) return;

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${selectedDestination.coords[0]},${selectedDestination.coords[1]}?geometries=geojson&access_token=${mapboxToken}`
        );
        const json = await res.json();

        if (json.routes && json.routes.length > 0) {
           const routeData = json.routes[0];
        
        // ✅ Fixed total distance of the route in KM
        const routeDistance = parseFloat((routeData.distance / 1000).toFixed(2));
        console.log("📏 Total route distance:", routeDistance, "km");
        setDistance(routeDistance)

          setRoute({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: json.routes[0].geometry,
                properties: {},
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    };

    fetchRoute();
  }, [selectedDestination, userCoords, mapboxToken]);

  // 📡 Stream Tanod location continuously
  useEffect(() => {
    if (!user?.id || !selectedDestination) return;
    let subscription: any;

    async function startStreaming() {
      const granted = await Mapbox.requestAndroidLocationPermissions();
      if (!granted) return;

      subscription = Mapbox.locationManager.addListener((location) => {
        const { latitude, longitude } = location.coords;

         if (!token) return;
        // ✅ Log every streamed location update
        console.log("📡 Streaming Tanod location:", { latitude, longitude });

        // ✅ If a request is selected, calculate distance
        if (selectedDestination) {
          const [reqLon, reqLat] = selectedDestination.coords;
          const distance = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            reqLat,
            reqLon
          );
          console.log(
            `📏 Distance to Request ${selectedDestination.request_id}: ${distance.toFixed(2)} km`
          );
          console.log(distance.toFixed(2))
          console.log(`Timer ${seconds}`)
          setCurrentDistance(distance)

          if (distance <= 0.5) {
            console.log("✅ Arrived at request, stopping timer & streaming...");
            stop();
            setResponseTime(seconds);
            navigation.navigate('report_form')
            if (subscription) subscription.remove();
            Mapbox.locationManager.stop();
            return; // exit early
          }
        }
        // Send Tanod location to backend -> triggers broadcast
        axios.post(
          `${base_url}update-location`,
          {
            user_id: user?.id,
            latitude,
            longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
      {/* Track user location on map */}
      <UserLocation
        visible
        onUpdate={(location) => {
          if (!location?.coords) return;
          setUserCoords([location.coords.longitude, location.coords.latitude]);
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

      {/* Render request markers */}
      {Array.isArray(data) &&
        data.map((item: any, index: number) => (
          <PointAnnotation
            key={`marker-${index}`}
            id={`marker-${index}`}
            title={`Request ${item.id}`}
            coordinate={[item.longitude, item.latitude]}
            anchor={{ x: 0.5, y: 0.5 }}
            onSelected={() => {
              reset();
              start();
             setSelectedDestination({
                coords: [item.longitude, item.latitude],
                request_id: item.id,
              })
            }}
          >
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 20,
                backgroundColor: "red",
                borderWidth: 2,
                borderColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </PointAnnotation>
        ))}

      {/* Render selected route */}
      {route && (
        <ShapeSource id="selectedRouteSource" shape={route}>
          <LineLayer
            id="selectedRouteLine"
            style={{
              lineColor: "tomato",
              lineWidth: 3,
              lineJoin: "round",
              lineCap: "round",
            }}
          />
        </ShapeSource>
      )}
    </>
  );
};

export default RequestResponseMap;

import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Mapbox, {
  MapView,
  Camera,
  PointAnnotation,
  ShapeSource,
  LineLayer,
} from "@rnmapbox/maps";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import useAppStore from "../../../store/useAppStore";
import getRequestResponse from "../../hooks/useRequestResponse";
import { RequestResponse } from "../../types/RequestResponseType";
import useUserRequest from "../../hooks/useUserRequest";

const MAPBOX_TOKEN =
  "pk.eyJ1Ijoiam95MTQzIiwiYSI6ImNtZTBxNmp5azA3eDAyc3B2ZDJ0MzA2bzIifQ.3cAGH461ddRycUmezu3INQ";
Mapbox.setAccessToken(MAPBOX_TOKEN);

// Echo/Pusher setup
const echo = new Echo({
  broadcaster: "pusher",
  key: "bc4ea4d02a3232a7df3c", 
  cluster: "ap1",
  forceTLS: true,
  client: new Pusher("bc4ea4d02a3232a7df3c", { cluster: "ap1" }),
});

interface TanodLocationEvent {
  tanodId: number;
  latitude: number;
  longitude: number;
}

export default function ResponseTracker({ requestId }: { requestId: number }) {
  const { user } = useAppStore();
  const [tanodCoords, setTanodCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<any>(null);

  const { data: responses = [] } = getRequestResponse();

  const requestResponse = responses.find(
    (r: RequestResponse) => r.user_id === user?.id
  );

  const requestCoords: [number, number] | null = requestResponse
    ? [Number(requestResponse.longitude), Number(requestResponse.latitude)]
    : null;

  const safeTanodCoords = tanodCoords
    ? [Number(tanodCoords[0]), Number(tanodCoords[1])]
    : null;
  const safeRequestCoords = requestCoords
    ? [Number(requestCoords[0]), Number(requestCoords[1])]
    : null;

  // Listen for Tanod location updates via Pusher
  useEffect(() => {
    const channel = echo.channel("locations");

    channel.listen(".location.updated", (event: TanodLocationEvent) => {
      console.log("Tanod event received:", event);
      if (event.latitude != null && event.longitude != null) {
        setTanodCoords([Number(event.longitude), Number(event.latitude)]);
      }
    });

    return () => {
      echo.leave("locations");
    };
  }, []);


  // Fetch route between Tanod and User
  useEffect(() => {
    const fetchRoute = async () => {
      if (!safeTanodCoords || !safeRequestCoords) return;

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${safeTanodCoords[0]},${safeTanodCoords[1]};${safeRequestCoords[0]},${safeRequestCoords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
        );
        const json = await res.json();
        if (json.routes?.length) {
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
  }, [safeTanodCoords, safeRequestCoords]);

  const { data: request } = useUserRequest();
  const requestCoordinate: [number, number] | null =
    request?.longitude != null && request?.latitude != null
      ? [Number(request.longitude), Number(request.latitude)]
      : null;

  const centerCoords =
    safeTanodCoords || safeRequestCoords || requestCoordinate || [0, 0];

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        <Camera
          zoomLevel={15}
          centerCoordinate={safeTanodCoords || centerCoords}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Tanod Marker */}
        {safeTanodCoords && (
          <PointAnnotation id="tanod-marker" coordinate={safeTanodCoords}>
            <View
              style={{
                height: 25,
                width: 25,
                borderRadius: 12.5,
                backgroundColor: "red",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          </PointAnnotation>
        )}

        {/* Request Marker */}
        {requestCoordinate && (
          <PointAnnotation id="request-marker" coordinate={requestCoordinate}>
            <View
              style={{
                height: 25,
                width: 25,
                borderRadius: 12.5,
                backgroundColor: "blue",
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          </PointAnnotation>
        )}

        {/* Route Line */}
        {route && (
          <ShapeSource id="routeSource" shape={route}>
            <LineLayer
              id="routeFill"
              style={{
                lineColor: "red",
                lineWidth: 4,
                lineOpacity: 0.8,
              }}
            />
          </ShapeSource>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

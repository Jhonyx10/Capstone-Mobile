import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform, PermissionsAndroid } from "react-native";
import Mapbox, {
  MapView,
  UserLocation,
  Camera,
  PointAnnotation,
  ShapeSource,
  LineLayer,
} from "@rnmapbox/maps";
import type { FeatureCollection, LineString } from "geojson";
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "../../util/getRequest";
import useAppStore from "../../store/useAppStore";

// ✅ Use a single token consistently
const MAPBOX_TOKEN =
  "pk.eyJ1Ijoiam95MTQzIiwiYSI6ImNtZTBxNmp5azA3eDAyc3B2ZDJ0MzA2bzIifQ.3cAGH461ddRycUmezu3INQ";

Mapbox.setAccessToken(MAPBOX_TOKEN);

const MapScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<FeatureCollection<LineString>[]>([]); // ✅ store multiple routes

  const { base_url, token } = useAppStore();

  const { data } = useQuery({
    queryKey: ["request"],
    queryFn: () => getRequest({ base_url, token }),
  });

  // Handle location permissions
  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);

    const getPermission = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };

    getPermission();
  }, []);

  // Fetch multiple routes
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!userCoords || !Array.isArray(data)) return;

      try {
        const fetchedRoutes: FeatureCollection<LineString>[] = [];

        for (const item of data) {
          const destination: [number, number] = [item.longitude, item.latitude];

          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
          );

          const json = await res.json();

          if (json.routes && json.routes.length > 0) {
            const routeGeo: FeatureCollection<LineString> = {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: json.routes[0].geometry,
                  properties: {},
                },
              ],
            };
            fetchedRoutes.push(routeGeo);
          }
        }

        setRoutes(fetchedRoutes);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };

    fetchRoutes();
  }, [data, userCoords]);

  if (!hasPermission) {
    return <View style={styles.page} />;
  }

  return (
    <View style={styles.page}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        {/* Show the user's location */}
        <UserLocation
          visible={true}
          onUpdate={(location) => {
            if (location?.coords) {
              setUserCoords([
                location.coords.longitude,
                location.coords.latitude,
              ]);
            }
          }}
        />

        {/* Camera follows user */}
        <Camera
          zoomLevel={15}
          maxZoomLevel={22}
          minZoomLevel={14}
          followUserLocation={true}
          followUserMode={Mapbox.UserTrackingMode.Follow}
        />

        {/* Render markers from API */}
        {Array.isArray(data) &&
          data.map((item: any, index: number) => (
            <PointAnnotation
              key={`marker-${index}`}
              id={`marker-${index}`}
              coordinate={[item.longitude, item.latitude]}
            >
              <View
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  backgroundColor: "red",
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              />
            </PointAnnotation>
          ))}

        {/* Render multiple routes */}
        {routes.map((route, idx) => (
          <ShapeSource key={`routeSource-${idx}`} id={`routeSource-${idx}`} shape={route}>
            <LineLayer
              id={`routeLine-${idx}`}
              style={{
                lineColor: "tomato",
                lineWidth: 2.5,
                lineJoin: "round",
                lineCap: "round",
              }}
            />
          </ShapeSource>
        ))}
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 },
});

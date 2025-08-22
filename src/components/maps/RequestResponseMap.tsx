import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Mapbox, {
  UserLocation,
  Camera,
  PointAnnotation,
  ShapeSource,
  LineLayer,
} from "@rnmapbox/maps";
import type { FeatureCollection, LineString } from "geojson";
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "../../../util/getRequest";
import useAppStore from "../../../store/useAppStore";

interface Props {
  mapboxToken: string;
}

const RequestResponseMap = ({ mapboxToken }: Props) => {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<FeatureCollection<LineString>[]>([]);
  const { base_url, token } = useAppStore();

  const { data } = useQuery({
    queryKey: ["request"],
    queryFn: () => getRequest({ base_url, token }),
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!userCoords || !Array.isArray(data)) return;

      try {
        const fetchedRoutes: FeatureCollection<LineString>[] = [];

        for (const item of data) {
          const destination: [number, number] = [item.longitude, item.latitude];

          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxToken}`
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
  }, [data, userCoords, mapboxToken]);

  return (
    <>
      {/* Show user location */}
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
        <ShapeSource
          key={`routeSource-${idx}`}
          id={`routeSource-${idx}`}
          shape={route}
        >
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
    </>
  );
};

export default RequestResponseMap;

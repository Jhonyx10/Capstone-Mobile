import { StyleSheet, View, Platform, PermissionsAndroid } from "react-native";
import { useState, useEffect } from "react";
import Mapbox, { MapView, UserLocation, Camera } from "@rnmapbox/maps";

const MAPBOX_TOKEN =
  "pk.eyJ1Ijoiam95MTQzIiwiYSI6ImNtZTBxNmp5azA3eDAyc3B2ZDJ0MzA2bzIifQ.3cAGH461ddRycUmezu3INQ";

Mapbox.setAccessToken(MAPBOX_TOKEN);

interface MapProps {
  onLocationChange?: (coords: [number, number]) => void;
}

const Map = ({ onLocationChange }: MapProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

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

  if (!hasPermission) {
    return <View style={styles.page} />;
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        <UserLocation
          visible={true}
          onUpdate={(location) => {
            if (location?.coords) {
              const coords: [number, number] = [
                location.coords.longitude,
                location.coords.latitude,
              ];
              setUserCoords(coords);
              if (onLocationChange) {
                onLocationChange(coords);
              }
            }
          }}
        />
        <Camera
          zoomLevel={15}
          maxZoomLevel={22}
          minZoomLevel={14}
          followUserLocation={true}
          followUserMode={Mapbox.UserTrackingMode.Follow}
        />
      </MapView>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: { width: 0, height: 0 },
  map: { flex: 1 },
  page: { flex: 1 },
});

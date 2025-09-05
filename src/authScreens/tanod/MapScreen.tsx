import { StyleSheet, View, Text, Platform, PermissionsAndroid, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import Mapbox, { MapView } from "@rnmapbox/maps";
import RequestResponseMap from "../../components/maps/RequestResponseMap";
import IncidentLocations from "../../components/maps/IncidentHeatMap";

const MAPBOX_TOKEN =
  "pk.eyJ1Ijoiam95MTQzIiwiYSI6ImNtZTBxNmp5azA3eDAyc3B2ZDJ0MzA2bzIifQ.3cAGH461ddRycUmezu3INQ";

Mapbox.setAccessToken(MAPBOX_TOKEN);

const MapScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isToggle, setIsToggle] = useState(false);

  const toggle = () => {
    setIsToggle((prev) => !prev);
  };

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
    <View style={styles.page}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        {isToggle ? (
          <IncidentLocations/>
        ) : (
          <RequestResponseMap mapboxToken={MAPBOX_TOKEN} />
        )}
      </MapView>

      {/* Floating button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggle}>
        <Text style={styles.toggleText}>{isToggle ? "Show Route" : "Show HeatMap"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 },
  toggleButton: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

import useAppStore from "../../../store/useAppStore";
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useCameraPermission } from "react-native-vision-camera";
import useZones from "../../hooks/useZone";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";
import usePhotoStore from "../../../store/usePhotoStore";
import { Zone } from "../../types/ZoneType";
import Mapbox from "@rnmapbox/maps";
import { postLocation } from "../../../util/postLocation";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { CreateLocation } from "../../types/LocationType";

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "location_form"
>;

const LocationForm = () => {
    const { base_url, token } = useAppStore()
    const { data } = useZones();
    const { setLandmark } = usePhotoStore();
    const landmark = usePhotoStore((state) => state.landmark);
    const navigation = useNavigation<CameraScreenNavigationProp>();
    const { hasPermission, requestPermission } = useCameraPermission();
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        zone_id: "",
        location_name: "",
        latitude: "",
        longitude: "",
        landmark: landmark,
    });

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({
        ...prev,
        [field]: value,
        }));
    };

    const handleOpenCamera = async () => {
        if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
        }
        navigation.navigate("camera", { status: "landmark" });
    };

    const locationMutation = useMutation({
        mutationFn: postLocation,
        onSuccess: () => {
            setFormData({
            zone_id: "",
            location_name: "",
            latitude: "",
            longitude: "",
            landmark: "",
            });
            queryClient.invalidateQueries({ queryKey: ["locations"] });
            navigation.goBack();
        }
    })

    const handleSubmit = () => {
        const payload: CreateLocation = {
            zone_id: Number(formData.zone_id),
            location_name: formData.location_name,
            latitude: formData.latitude,
            longitude: formData.longitude,
            landmark: landmark ?? undefined
        };
        locationMutation.mutate({ base_url, token, formData: payload})
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incident Location</Text>

      {/* Landmark Image */}
      <View style={styles.imageWrapper}>
        {landmark ? (
          <>
            <Image
              source={{ uri: "file://" + landmark }}
              style={styles.image}
            />
            <TouchableOpacity onPress={() => setLandmark(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholder}>No photo selected</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleOpenCamera} style={styles.button}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Zone Picker */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Zone</Text>
        <Picker
          selectedValue={formData.zone_id}
          onValueChange={(value) => handleChange("zone_id", value)}
        >
          <Picker.Item label="Select Zone Address." color="#888" value="" />
          {data?.map((zone: Zone) => (
            <Picker.Item
              key={zone.id}
              label={zone.zone_name}
              value={zone.id.toString()}
            />
          ))}
        </Picker>
      </View>

      {/* Location Name */}
      <Text style={styles.label}>Location Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter location name"
        value={formData.location_name}
        onChangeText={(text) => handleChange("location_name", text)}
        placeholderTextColor="#888"
      />

      {/* Mapbox User Location */}
      <View style={styles.mapWrapper}>
        <Mapbox.MapView style={styles.map}>
          <Mapbox.Camera followUserLocation followZoomLevel={16} />
          <Mapbox.UserLocation
            visible={true}
            onUpdate={(location) => {
              if (location && location.coords) {
                setFormData((prev) => ({
                  ...prev,
                  latitude: location.coords.latitude.toString(),
                  longitude: location.coords.longitude.toString(),
                }));
              }
            }}
          />
        </Mapbox.MapView>
      </View>
        <View style={{marginTop: 40}}>
            <TouchableOpacity style={styles.button} 
                onPress={handleSubmit}
            >
            <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        </View>
    </View>
  );
};

export default LocationForm;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  imageWrapper: { alignItems: "center", marginBottom: 12 },
  image: { width: 100, height: 100, borderRadius: 12 },
  placeholder: { color: "#888", marginVertical: 8 },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 16,
  },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  inputWrapper: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  mapWrapper: { height: 200, borderRadius: 12, overflow: "hidden", marginBottom: 12, marginTop: 10 },
  map: { flex: 1 },
  coords: { textAlign: "center", fontSize: 14, color: "#444" },
});

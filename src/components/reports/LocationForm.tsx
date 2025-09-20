import useAppStore from "../../../store/useAppStore";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useCameraPermission } from "react-native-vision-camera";
import useZones from "../../hooks/useZone";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";
import usePhotoStore from "../../../store/usePhotoStore";
import { Zone } from "../../types/ZoneType";
import { postLocation } from "../../../util/postLocation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateLocation } from "../../types/LocationType";

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "location_form"
>;

const LocationForm = () => {
  const { base_url, token, currentLocation } = useAppStore();
  const { data } = useZones();
  const { setLandmark } = usePhotoStore();
  const landmark = usePhotoStore((state) => state.landmark);
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const queryClient = useQueryClient();

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
    },
  });

  const handleSubmit = () => {
    const payload: CreateLocation = {
      zone_id: Number(formData.zone_id),
      location_name: formData.location_name,
      latitude: currentLocation?.latitude.toString() ?? "",
      longitude: currentLocation?.longitude.toString() ?? "",
      landmark: landmark ?? undefined,
    };
    locationMutation.mutate({ base_url, token, formData: payload });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>📍 Incident Location</Text>

          {/* Landmark Image */}
          <View style={styles.imageWrapper}>
            {landmark ? (
              <>
                <Image
                  source={{ uri: "file://" + landmark }}
                  style={styles.image}
                />
                <TouchableOpacity
                  onPress={() => setLandmark(null)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.placeholder}>No photo selected</Text>
            )}
          </View>

          <TouchableOpacity onPress={handleOpenCamera} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>📷 Capture Landmark</Text>
          </TouchableOpacity>

          {/* Coordinates */}
          <Text style={styles.coords}>
            Latitude: {currentLocation?.latitude ?? "—"}
          </Text>
          <Text style={styles.coords}>
            Longitude: {currentLocation?.longitude ?? "—"}
          </Text>

          {/* Zone Picker */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Select Zone</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={formData.zone_id}
                onValueChange={(value) => handleChange("zone_id", value)}
              >
                <Picker.Item label="Choose Zone Address" color="#888" value="" />
                {data?.map((zone: Zone) => (
                  <Picker.Item
                    key={zone.id}
                    label={zone.zone_name}
                    value={zone.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Location Name */}
          <Text style={styles.label}>Location Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location name"
            value={formData.location_name}
            onChangeText={(text) => handleChange("location_name", text)}
            placeholderTextColor="#aaa"
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>✅ Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LocationForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(240,240,240,0.9)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  placeholder: {
    color: "#999",
    marginVertical: 8,
    fontSize: 14,
  },
  closeBtn: {
    position: "absolute",
    top: 5,
    right: 30,
    backgroundColor: "#ff4d4d",
    padding: 6,
    borderRadius: 20,
  },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
  primaryBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  coords: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  inputWrapper: { marginBottom: 12 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

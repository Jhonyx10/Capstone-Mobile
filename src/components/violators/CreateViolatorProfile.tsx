import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { useCameraPermission } from "react-native-vision-camera";
import useAppStore from "../../../store/useAppStore";
import useZones from "../../hooks/useZone";
import { Zone } from "../../types/ZoneType";
import { useMutation } from "@tanstack/react-query";
import { postViolator } from "../../../util/ViolatorProfile";
import { CreateViolator } from "../../types/ViolatorType";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation";
import usePhotoStore from "../../../store/usePhotoStore";
import { useQueryClient } from "@tanstack/react-query";

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "violator"
>;

const CreateViolatorProfile = () => {
  const { token, base_url } = useAppStore();
  const { setPhoto } = usePhotoStore();
  const photo = usePhotoStore((state) => state.photo);
  const { data } = useZones();
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const queryClient = useQueryClient()

  const [violator, setViolator] = useState({
    last_name: "",
    first_name: "",
    age: "",
    zone_id: "",
    address: "",
    photo: photo,
  });

  const violatorProfileMutation = useMutation({
    mutationFn: postViolator,
    onSuccess: () => {
      Alert.alert("Success", "Violator created successfully.");
      setViolator({
        last_name: "",
        first_name: "",
        age: "",
        zone_id: "",
        address: "",
        photo: "",
      });
      setPhoto(null);
      queryClient.invalidateQueries({ queryKey: ["violators"] });
      navigation.goBack();
    },
  });

  const handleSubmit = () => {
    const payload: CreateViolator = {
      last_name: violator.last_name,
      first_name: violator.first_name,
      age: Number(violator.age),
      zone_id: Number(violator.zone_id),
      address: violator.address,
      photo: photo ?? undefined,
    };

    violatorProfileMutation.mutate({ base_url, token, violator: payload });
  };

  const handleChange = (field: keyof typeof violator, value: any) => {
    setViolator((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
     navigation.navigate("camera", { status: "violator" });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Violator Form</Text>

      {/* Photo preview */}
      <View style={styles.photoContainer}>
        {photo ? (
          <>
          <Image
            source={{ uri: "file://" + photo }}
            style={styles.photoPreview}
            
          />
          <TouchableOpacity style={styles.deleteBtn}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.deleteBtnText}>X</Text>
          </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.photoPlaceholder}>No photo selected</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleOpenCamera} style={styles.button}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Name row */}
      <View style={styles.row}>
        <View style={styles.inputWrapper}>
          <Text>Last Name</Text>
          <TextInput
            placeholder="Enter last name"
            value={violator.last_name}
            onChangeText={(text) => handleChange("last_name", text)}
            placeholderTextColor="#888"
            style={styles.input}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text>First Name</Text>
          <TextInput
            placeholder="Enter first name"
            value={violator.first_name}
            onChangeText={(text) => handleChange("first_name", text)}
            placeholderTextColor="#888"
            style={styles.input}
          />
        </View>
      </View>

      {/* Age + Zone row */}
      <View style={styles.row}>
        <View style={[styles.inputWrapper, { flex: 1 }]}>
          <Text>Age</Text>
          <TextInput
            placeholder="Enter Age"
            value={violator.age}
            keyboardType="numeric"
            onChangeText={(text) => handleChange("age", text)}
            placeholderTextColor="#888"
            style={styles.input}
          />
        </View>

        <View style={[styles.inputWrapper, { flex: 2 }]}>
          <Text>Zone</Text>
          <Picker
            selectedValue={violator.zone_id}
            onValueChange={(value) => handleChange("zone_id", value)}
          >
            <Picker.Item label="Select Zone Address." color="#888" value="" />
            {data?.map((zone: Zone) => (
              <Picker.Item
                style={styles.picker}
                key={zone.id}
                label={zone.zone_name}
                value={zone.id.toString()}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Address */}
      <View style={styles.inputWrapper}>
        <Text>Address</Text>
        <TextInput
          placeholder="Enter Address"
          value={violator.address}
          onChangeText={(text) => handleChange("address", text)}
          placeholderTextColor="#888"
          style={styles.input}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateViolatorProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  photoPlaceholder: {
    color: "#888",
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 5,
  },
  picker: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "skyblue",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteBtn: {
    height: 30,
    width: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -10,
    right: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'tomato'
  }
});

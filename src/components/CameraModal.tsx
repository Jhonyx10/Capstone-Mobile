import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRef, useEffect } from "react";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  Camera as CameraType,
} from "react-native-vision-camera";
import { RootStackParamList } from "../Navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import usePhotoStore from "../../store/usePhotoStore";
import { useRoute } from "@react-navigation/native";

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "camera"
>;

const CameraModal = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<CameraType>(null);
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute();
  const { status } = route.params as { status: string };

  const setPhoto = usePhotoStore((state) => state.setPhoto);
  const addEvidence = usePhotoStore((state) => state.addEvidence);
  const setLandmark = usePhotoStore((state) => state.setLandmark)

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleTakePhoto = async () => {
    if (cameraRef.current == null) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
      });

      if(status === 'violator') {
         setPhoto(photo.path); 
        navigation.goBack();
      }
     
       if (status === "evidence") {
        addEvidence({
          incident_evidence: photo.path,              
        });
        console.log(photo.path)
        navigation.goBack();
      }

      if(status === 'landmark') {
          setLandmark(photo.path)
          navigation.goBack();
        }
      
    } catch (error) {
      console.error("Failed to take photo:", error);
    }
  };

  if (device == null) {
    return <Text>Loading camera...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Camera fills screen */}
      <Camera
        ref={cameraRef}
        device={device}
        isActive={true}
        photo={true}
        style={StyleSheet.absoluteFill}
      />

      {/* Button overlay */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={{ color: "white", fontSize: 16 }}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraModal;

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: 120,
    height: 50,
    borderRadius: 25,
    backgroundColor: "skyblue",
    justifyContent: "center",
    alignItems: "center",
  },
});

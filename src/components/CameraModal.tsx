import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  Camera as CameraType,
} from 'react-native-vision-camera';
import { RootStackParamList } from '../Navigation';
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import usePhotoStore from '../../store/usePhotoStore';
import Icon from './Icon';

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'camera'
>;

const TITLES: Record<string, string> = {
  violator: 'Violator photo',
  evidence: 'Evidence photo',
  landmark: 'Landmark photo',
};

const CameraModal = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(position);
  const cameraRef = useRef<CameraType>(null);
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { status } = route.params as { status: string };

  const [flashOn, setFlashOn] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const setPhoto = usePhotoStore(state => state.setPhoto);
  const addEvidence = usePhotoStore(state => state.addEvidence);
  const setLandmark = usePhotoStore(state => state.setLandmark);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleTakePhoto = async () => {
    if (cameraRef.current == null || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: flashOn && device?.hasFlash ? 'on' : 'off',
      });

      if (status === 'violator') {
        setPhoto(photo.path);
        navigation.goBack();
      }

      if (status === 'evidence') {
        addEvidence({
          incident_evidence: photo.path,
        });
        console.log(photo.path);
        navigation.goBack();
      }

      if (status === 'landmark') {
        setLandmark(photo.path);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Could not take photo', 'Please try again.');
      setCapturing(false);
    }
  };

  /* ---------- permission missing ---------- */
  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-white/10">
          <Icon name="camera" color="#FFFFFF" size={36} />
        </View>
        <Text className="mt-5 text-lg font-bold text-white">
          Camera access needed
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-300">
          Allow camera access to take photos for your reports.
        </Text>
        <TouchableOpacity
          onPress={() => requestPermission()}
          activeOpacity={0.8}
          className="mt-6 rounded-xl bg-lime-600 px-6 py-3"
        >
          <Text className="font-bold text-white">Allow camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          activeOpacity={0.8}
          className="mt-3 px-6 py-2"
        >
          <Text className="font-semibold text-lime-400">Open settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          className="mt-1 px-6 py-2"
        >
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ---------- camera not ready ---------- */
  if (device == null) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#A3E635" />
        <Text className="mt-3 text-sm text-gray-300">Loading camera...</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          className="mt-6 px-6 py-2"
        >
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Camera fills screen */}
      <Camera
        ref={cameraRef}
        device={device}
        isActive={isFocused}
        photo={true}
        style={StyleSheet.absoluteFill}
      />

      {/* Top bar */}
      <View
        className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="h-11 w-11 items-center justify-center rounded-full bg-black/50"
        >
          <Icon name="x" color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <View className="rounded-full bg-black/50 px-4 py-2">
          <Text className="text-sm font-semibold text-white">
            {TITLES[status] ?? 'Take photo'}
          </Text>
        </View>

        {/* flash (not available on every camera, e.g. most front cameras) */}
        {device.hasFlash ? (
          <TouchableOpacity
            onPress={() => setFlashOn(prev => !prev)}
            activeOpacity={0.7}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              flashOn ? 'bg-lime-600' : 'bg-black/50'
            }`}
          >
            <Icon
              name={flashOn ? 'zap' : 'zap-off'}
              color="#FFFFFF"
              size={20}
            />
          </TouchableOpacity>
        ) : (
          <View className="h-11 w-11" />
        )}
      </View>

      {/* Bottom controls */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between px-10"
        style={{ paddingBottom: insets.bottom + 28 }}
      >
        {/* spacer keeps the shutter centered */}
        <View className="h-12 w-12" />

        {/* Shutter */}
        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={capturing}
          activeOpacity={0.8}
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white">
            {capturing && <ActivityIndicator color="#5D8736" />}
          </View>
        </TouchableOpacity>

        {/* Flip camera */}
        <TouchableOpacity
          onPress={() =>
            setPosition(prev => (prev === 'back' ? 'front' : 'back'))
          }
          disabled={capturing}
          activeOpacity={0.7}
          className="h-12 w-12 items-center justify-center rounded-full bg-black/50"
        >
          <Icon name="refresh-cw" color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraModal;

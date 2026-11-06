import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { launchCamera, Asset } from 'react-native-image-picker';
import DeviceInfo from 'react-native-device-info';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

import useAppStore from '../store/useAppStore';
import { saveSecret } from '../util/phone'
import { residentRegister } from '../util/residentApi';

const ResidentRegisterScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const phone: string = route.params?.phone; // the number picked on the login screen

  const base_url = useAppStore(state => state.base_url);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<Asset | null>(null);

  const captureFace = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert(
        'Camera error',
        res.errorMessage ?? 'Hindi mabuksan ang camera.',
      );
      return;
    }
    if (res.assets?.[0]) setPhoto(res.assets[0]);
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('phone', phone);
      form.append('device_id', await DeviceInfo.getUniqueId());
      form.append('id_photo', {
        uri: photo!.uri,
        name: photo!.fileName ?? 'face.jpg',
        type: photo!.type ?? 'image/jpeg',
      } as any);
      return residentRegister(base_url, form);
    },
    onSuccess: async data => {
      await saveSecret(phone, data.secret); // this is what lets this phone log in later
      Alert.alert(
        'Naipadala na!',
        'Hintayin ang approval ng barangay bago ka makapag-report.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    },
    onError: (e: any) => Alert.alert('Hindi makapag-register', e.message),
  });

  const canSubmit =
    name.trim().length >= 2 && !!photo && !registerMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Text
          entering={FadeInUp.delay(100).duration(300).springify().damping(60)}
          className="text-3xl font-bold text-lime-600 text-center mb-2"
        >
          Mag-register
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(200).duration(300).springify().damping(60)}
          className="text-base text-[#5B5B5B] text-center mb-8 dark:text-gray-300"
        >
          Kumpletuhin ang detalye para ma-verify ng barangay.
        </Animated.Text>

        {/* Number (read-only, from the picker) */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(300).springify().damping(60)}
        >
          <Text className="text-base font-medium text-[#5B5B5B] mb-2 ml-2 dark:text-gray-300">
            Mobile Number
          </Text>
          <View className="p-4 rounded-lg mb-5 bg-lime-100 border border-b-lime-700 dark:bg-slate-800">
            <Text className="text-base font-semibold dark:text-white">
              {phone}
            </Text>
          </View>
        </Animated.View>

        {/* Full name */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(300).springify().damping(60)}
        >
          <Text className="text-base font-medium text-[#5B5B5B] mb-2 ml-2 dark:text-gray-300">
            Buong Pangalan
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Juan Dela Cruz"
            placeholderTextColor="#9ca3af"
            className="p-4 rounded-lg mb-6 bg-transparent border border-b-lime-700 dark:text-white"
          />
        </Animated.View>

        {/* Face capture */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(300).springify().damping(60)}
          className="items-center mb-6"
        >
          <Text className="text-base font-medium text-[#5B5B5B] mb-3 dark:text-gray-300">
            Larawan ng Mukha
          </Text>

          <TouchableOpacity
            onPress={captureFace}
            className="w-44 h-44 rounded-full overflow-hidden items-center justify-center border-2 border-dashed border-lime-700 bg-lime-50 dark:bg-slate-800"
          >
            {photo?.uri ? (
              <Image source={{ uri: photo.uri }} className="w-full h-full" />
            ) : (
              <Text className="text-lime-700 text-center px-4">
                Pindutin para kumuha ng larawan
              </Text>
            )}
          </TouchableOpacity>

          {photo && (
            <TouchableOpacity onPress={captureFace} className="mt-3">
              <Text className="text-lime-600 font-semibold">Kumuha ulit</Text>
            </TouchableOpacity>
          )}
          <Text className="text-xs text-[#5B5B5B] mt-3 text-center dark:text-gray-400">
            Harapin ang camera, walang takip ang mukha, at siguraduhing
            maliwanag.
          </Text>
        </Animated.View>

        {/* Submit */}
        <TouchableOpacity
          onPress={() => registerMutation.mutate()}
          disabled={!canSubmit}
          className="w-full rounded-lg overflow-hidden"
          style={{ opacity: canSubmit ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            className="w-full p-4 rounded-lg items-center"
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">I-submit</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 p-2 items-center"
        >
          <Text className="text-[#5B5B5B] dark:text-gray-300">
            Bumalik sa Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResidentRegisterScreen;

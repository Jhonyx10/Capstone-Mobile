import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Navigation';
import LinearGradient from 'react-native-linear-gradient';

import useAppStore from '../store/useAppStore';
import { pickPhoneNumber, getSecret } from '../util/phone';
import { residentLogin, ApiError } from '../util/residentApi';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'welcome'
>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Welcome = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const setLogin = useAppStore(state => state.setLogin);
  const setUser = useAppStore(state => state.setUser);
  const setToken = useAppStore(state => state.setToken);
  const setOnboarding = useAppStore(state => state.setOnboarding);
  const base_url = useAppStore(state => state.base_url);

  const [guestLoading, setGuestLoading] = useState(false);
  const [unregisteredPhone, setUnregisteredPhone] = useState<string | null>(
    null,
  );

const handleGuestLogin = async () => {
  let phone: string | null = null;

  try {
    // opens Google's phone number picker (no spinner yet)
    phone = await pickPhoneNumber();
    if (!phone) {
      Alert.alert('Walang napili', 'Pumili ng mobile number para magpatuloy.');
      return;
    }

    // a number was chosen, so now we're actually logging in
    setGuestLoading(true);

    const secret = await getSecret(phone);
    const data = await residentLogin(base_url, phone, secret);

    if (data.status === 'pending') {
      Alert.alert(
        'Hinihintay ang approval',
        'Sinusuri pa ng barangay ang iyong registration. Subukan ulit mamaya.',
      );
    } else if (data.status === 'rejected') {
      Alert.alert(
        'Na-reject ang registration',
        data.reject_reason ?? 'Subukang mag-register ulit.',
      );
    } else {
      setToken(data.token);
      setUser(data.user);
      setLogin(true);
      setOnboarding(false);
    }
  } catch (e: any) {
    if (e instanceof ApiError && e.code === 'NOT_REGISTERED') {
      setUnregisteredPhone(phone);
    } else {
      Alert.alert('Hindi makapag-login', e.message ?? 'Subukan ulit.');
    }
  } finally {
    setGuestLoading(false);
  }
};

  const goToRegister = () => {
    const phone = unregisteredPhone;
    setUnregisteredPhone(null);
    if (phone) navigation.navigate('resident_register', { phone });
  };

  return (
    <View className="flex-1 justify-center items-center relative dark:bg-slate-900">
      {/* Background Image */}
      <Image
        source={require('./assets/img/BarangayTanod.png')}
        className="absolute top-0 w-full h-1/2"
        resizeMode="cover"
      />

      {/* Logo */}
      <Animated.Image
        entering={FadeInUp.delay(200).duration(300).springify().damping(50)}
        exiting={FadeInDown.delay(200).duration(300).springify().damping(50)}
        source={require('./assets/img/Barangay.png')}
        className="w-40 h-36 rounded-lg"
      />

      {/* Content Section */}
      <View className="mx-5 py-5">
        <View className="mt-2 items-center">
          {/* Title */}
          <Animated.Text
            entering={FadeInUp.delay(300).duration(300).springify().damping(50)}
            className="text-3xl font-bold  text-lime-600 mb-4"
          >
            Barangay Igpit Tanod
          </Animated.Text>

          {/* Description */}
          <Animated.Text
            entering={FadeInUp.delay(400).duration(300).springify().damping(50)}
            className="text-lg font-medium text-[#5B5B5B] text-center mb-3 dark:text-white"
          >
            May dalawang paraan para makapag-log in piliin mo kung alin ang
            pinaka madali para sa'yo
          </Animated.Text>

          {/* Login Button with Gradient */}
          <AnimatedTouchable
            onPress={() => navigation.navigate('login')}
            disabled={guestLoading}
            className="w-full mt-2 rounded-lg overflow-hidden"
            entering={FadeInUp.delay(500).duration(300).springify().damping(60)}
          >
            <LinearGradient
              colors={['#A9C46C', '#5D8736']}
              className="w-full p-4 rounded-lg items-center"
            >
              <Text className="text-white text-base font-bold">
                Login Account
              </Text>
            </LinearGradient>
          </AnimatedTouchable>

          {/* Guest Login Button */}
          <AnimatedTouchable
            onPress={handleGuestLogin}
            disabled={guestLoading}
            className="w-full p-4 rounded-lg mt-2 items-center border-2 border-[#A9C46C]"
            entering={FadeInUp.delay(600).duration(300).springify().damping(60)}
          >
            {guestLoading ? (
              <ActivityIndicator color="#5D8736" />
            ) : (
              <Text className="text-base font-bold text-[#5B5B5B] dark:text-white">
                Login as Guest
              </Text>
            )}
          </AnimatedTouchable>
        </View>
      </View>

      {/* Footer */}
      <Animated.View
        entering={FadeIn.delay(800).duration(300)}
        className="absolute bottom-5 flex-row items-center justify-center"
      >
        <Image
          source={require('./assets/img/OCC.jpg')}
          className="w-5 h-5 rounded-lg mr-1"
        />
        <Text className="text-[10px] dark:text-white">
          | ©OCC IT Students 2025
        </Text>
      </Animated.View>

      {/* "Number not registered" modal */}
      <Modal
        visible={!!unregisteredPhone}
        transparent
        animationType="fade"
        onRequestClose={() => setUnregisteredPhone(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-white p-6 dark:bg-slate-800">
            <Text className="text-xl font-bold text-center text-lime-600 mb-2">
              Hindi pa rehistrado
            </Text>
            <Text className="text-center text-[#5B5B5B] dark:text-gray-300 mb-1">
              Ang numerong ito ay wala pang account:
            </Text>
            <Text className="text-center text-lg font-bold mb-5 dark:text-white">
              {unregisteredPhone}
            </Text>

            <TouchableOpacity
              className="rounded-lg overflow-hidden"
              onPress={goToRegister}
            >
              <LinearGradient
                colors={['#A9C46C', '#5D8736']}
                className="p-4 items-center rounded-lg"
              >
                <Text className="text-white font-bold">
                  I-register ang numero
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 p-3 items-center"
              onPress={() => setUnregisteredPhone(null)}
            >
              <Text className="text-[#5B5B5B] dark:text-gray-300">
                Kanselahin
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Welcome;

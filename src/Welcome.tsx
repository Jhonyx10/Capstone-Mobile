import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Navigation';
import LinearGradient from 'react-native-linear-gradient';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'welcome'
>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Welcome = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

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
            onPress={() => navigation.navigate('login')}
            className="w-full p-4 rounded-lg mt-2 items-center border-2 border-[#A9C46C]"
            entering={FadeInUp.delay(600).duration(300).springify().damping(60)}
          >
            <Text className="text-base font-bold text-[#5B5B5B] dark:text-white">
              Login as Guest
            </Text>
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
    </View>
  );
};

export default Welcome;

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Navigation';
import useAppStore from '../store/useAppStore';
import { useMutation } from '@tanstack/react-query';
import { Login } from '../util/Login';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'login'
>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const LoginScreen = () => {
  const passwordAnim = useRef<LottieView>(null);
  const eyesAnim = useRef<LottieView>(null);
  const personAnim = useRef<LottieView>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const setLogin = useAppStore(state => state.setLogin);
  const setUser = useAppStore(state => state.setUser);
  const setToken = useAppStore(state => state.setToken);
  const base_url = useAppStore(state => state.base_url);
  const setOnboarding = useAppStore(state => state.setOnboarding);
  const onboarding = useAppStore(state => state.onboarding);
  const { login } = useAppStore();

  const LoginMutation = useMutation({
    mutationFn: Login,
    onSuccess: async data => {
      setToken(data.token);
      setUser(data.user);
      setLogin(true);
      setOnboarding(false);
      console.log(onboarding);
      {
        login && navigation.navigate('authTabs');
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error.message);
    },
  });

  const handleLogin = () => {
    LoginMutation.mutate({ base_url, name, password });
  };

  useEffect(() => {
    // Password animation
    const passwordStart = setTimeout(() => {
      passwordAnim.current?.play();
      const passwordPause = setTimeout(() => {
        passwordAnim.current?.pause();
      }, 2000);
      // cleanup for pause
      return () => clearTimeout(passwordPause);
    }, 1000);

    // Person animation
    const personStart = setTimeout(() => {
      personAnim.current?.play();
      const personPause = setTimeout(() => {
        personAnim.current?.pause();
      }, 2000);
      // cleanup for pause
      return () => clearTimeout(personPause);
    }, 1000);

    // Eyes animation
    const eyesStart = setTimeout(() => {
      eyesAnim.current?.play();
      const eyesPause = setTimeout(() => {
        eyesAnim.current?.pause();
      }, 2000);
      // cleanup for pause
      return () => clearTimeout(eyesPause);
    }, 1200);

    // Proper cleanup for ALL timers
    return () => {
      clearTimeout(passwordStart);
      clearTimeout(personStart);
      clearTimeout(eyesStart);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 items-center justify-center bg-[#f4f4f4] relative dark:bg-slate-900"
      enabled
    >
      <Image
        source={require('./assets/img/BarangayTanod.png')}
        className="absolute top-0 w-full h-1/2"
      />

      <View className="w-full px-5 py-6">
        {/* Centered Logo */}
        <View className="items-center mb-4">
          <Animated.Image
            entering={FadeInUp.delay(200).duration(300).springify().damping(50)}
            source={require('./assets/img/Barangay.png')}
            className="w-36 h-36 rounded-lg"
          />
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeInUp.delay(300).duration(300).springify().damping(60)}
          className="text-3xl font-bold  text-lime-600 text-center mb-5"
        >
          Magandang Araw
        </Animated.Text>

        {/* Description */}
        <Animated.Text
          entering={FadeInUp.delay(400).duration(300).springify().damping(60)}
          className="text-lg font-medium text-[#5B5B5B] text-center mb-10 dark:text-white"
        >
          Mag-log in upang ma-access ang iyong account.
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(500).duration(300).springify().damping(60)}
        >
          {/* Username */}
          <Text className="text-base font-medium text-[#5B5B5B] mb-2 ml-2 dark:text-gray-300">
            Username
          </Text>

          <LottieView
            ref={personAnim}
            source={require('./assets/animation/Profile.json')}
            style={{
              width: 32,
              height: 32,
              position: 'absolute',
              bottom: 27,
              left: 2,
            }}
            autoPlay
            loop={false}
          />

          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setIsInputFocused(true)} // 👈 Hide footer
            onBlur={() => setIsInputFocused(false)}
            autoCapitalize="none"
            style={{ paddingLeft: 36 }}
            className="p-4 rounded-lg mb-5 bg-transparent border border-b-lime-700 dark:text-white"
          />
        </Animated.View>

        {/* Password */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(300).springify().damping(60)}
        >
          <LottieView
            ref={passwordAnim}
            source={require('./assets/animation/Password.json')}
            style={{
              width: 55,
              height: 55,
              position: 'absolute',
              bottom: 24,
              left: -6,
            }}
            autoPlay
            loop={false}
          />

          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 34,
              right: 5,
              zIndex: 20,
            }}
            onPress={() => {
              setShowPassword(showPassword => !showPassword),
                console.log(showPassword);
            }} // toggle on press
          >
            <LottieView
              ref={eyesAnim}
              source={require('./assets/animation/Eyes.json')}
              style={{
                width: 35,
                height: 35,
                opacity: showPassword ? 1 : 0.4, // gray when hidden
              }}
              loop={false}
            />

            {/* Show slash when password is hidden */}
            {!showPassword && (
              <Animated.View
                entering={FadeIn.delay(800).duration(500)}
                style={{
                  position: 'absolute',
                  top: 16,
                  left: -2,
                  width: 40,
                  height: 2,
                  backgroundColor: 'gray',
                  transform: [{ rotate: '45deg' }],
                  zIndex: 20,
                }}
              />
            )}
          </TouchableOpacity>

          <Text className="text-base font-medium text-[#5B5B5B] mb-2 ml-2 dark:text-gray-300">
            Password
          </Text>
          <TextInput
            value={password}
            onFocus={() => setIsInputFocused(true)} // 👈 Hide footer
            onBlur={() => setIsInputFocused(false)}
            style={{ paddingLeft: 36 }}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            className="p-4 rounded-lg mb-2 bg-transparent text-black border border-b-lime-700 dark:text-white"
          />
          <Text className="text-right dark:text-white">
            Nalimutan and Password?{' '}
            <Text className="text-lime-600">Click Here</Text>
          </Text>
        </Animated.View>
        {/* Login Button */}
        <AnimatedTouchable
          onPress={handleLogin}
          className="w-full mt-5 rounded-lg overflow-hidden"
          entering={FadeInUp.delay(500).duration(300).springify().damping(60)}
        >
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            className="w-full p-4 rounded-lg items-center"
          >
            <Text className="text-white text-base font-bold">Login</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </View>
      {/* Footer */}
      {!isInputFocused && ( // 👈 Hide footer when typing
        <Animated.View
          entering={FadeIn.delay(800).duration(300)}
          className="absolute bottom-5 flex-row items-center justify-center"
        >
          <Image
            source={require('./assets/img/OCC.jpg')}
            className="w-5 h-5 rounded-lg mr-1"
          />
          <Text className="text-[10px] dark:text-gray-300">
            | ©OCC IT Students 2025
          </Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

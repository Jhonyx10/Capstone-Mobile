import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import useAppStore from '../store/useAppStore';
import Welcome from './Welcome';
import LoginScreen from './LoginScreen';
import HomeScreen from './authScreens/tanod/HomeScreen';
import ProfileScreen from './authScreens/tanod/ProfileScreen';
import ReportScreen from './authScreens/tanod/ReportScreen';
import ViolatorScreen from './authScreens/tanod/ViolatorScreen';
import MapScreen from './authScreens/tanod/MapScreen';
import Home from './authScreens/resident/HomeScreen';
import Hotline from './authScreens/resident/Hotline';

import CreateViolatorProfile from './components/violators/CreateViolatorProfile';
import ReportForm from './components/reports/ReportForm';
import ViolatorsDetails from './components/violators/ViolatorsDetails';
import CameraModal from './components/CameraModal';
import ReportDetails from './components/reports/ReportDetails';
import ReportViolatorsList from './components/reports/ReportViolatorsList';

import LocationForm from './components/reports/LocationForm';
import TanodTracker from './authScreens/resident/TanodTracker';
import OnboardingScreen from './OnboardingScreen';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { useRef, useEffect, useState } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { colorScheme, useColorScheme } from 'nativewind';
import useAppStore from '../store/useAppStore';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

export type RootStackParamList = {
  welcome: undefined;
  onboarding: undefined;
  login: undefined;
  authTabs: undefined;
  report: undefined;
  violator: undefined;
  violator_form: undefined;
  camera: { status: string };
  report_form: undefined;
  violators_details: { id: number };
  report_details: { id: number };
  violators_list: undefined;
  map: undefined;
  location_form: undefined;
response_tracker: { requestId: number };
  guest: undefined;
};


interface LottieIconProps {
  animationData: AnimationObject;
  focused: boolean;
}

const AuthTabs = () => {
  const { user} = useAppStore();
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      {user?.role != 'resident' ? (
        <>
          <Tabs.Screen name="home" component={HomeScreen} />
          <Tabs.Screen name="map" component={MapScreen} />
          <Tabs.Screen name="report" component={ReportScreen} />
          <Tabs.Screen name="violator" component={ViolatorScreen} />
          <Tabs.Screen name="profile" component={ProfileScreen} />
        </>
      ) : (
        <>
            <Tabs.Screen name="guest" component={Home} />
            <Tabs.Screen name="hotline" component={Hotline} />
        </>
      )}
    </Tabs.Navigator>
  );
};


const LottieIcon: React.FC<LottieIconProps> = ({ animationData, focused }) => {
  const lottieRef = useRef<LottieView>(null);

  if (lottieRef.current) {
    focused ? lottieRef.current.play() : lottieRef.current.reset();
  }
  return (
    <LottieView
      ref={lottieRef}
      style={{ width: 30, height: 30, opacity: focused ? 1 : 0.5 }}
      source={animationData}
      loop={false}
    />
  );
};

const AuthTabs = () => {
  const { colorScheme } = useColorScheme();
  const screenOptions: BottomTabNavigationOptions = {
    tabBarShowLabel: false,
    headerShown: false,
    tabBarStyle: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      left: 10,
      height: 60,
      borderRadius: 10,
      marginHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FCFCFC',
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 100,
    },
  };

  return (
    <Tabs.Navigator screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="relative items-center">
              <View
                className={`absolute bottom-2  items-center justify-center h-full px-6 ${
                  focused
                    ? 'border-t-2  border-green-500'
                    : 'border-t-2  border-transparent'
                }`}
              />
              <LottieIcon
                animationData={require('./assets/animation/HomeBar.json')}
                focused={focused}
              />
              <Text
                className={`text-[10px] text-center  mt-1 ${
                  focused
                    ? 'text-green-500 opacity-100'
                    : 'text-green-500 opacity-70'
                }`}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="relative items-center">
              <View
                className={`absolute bottom-2  items-center justify-center h-full px-6 ${
                  focused
                    ? 'border-t-2 border-green-500'
                    : 'border-t-2 border-transparent'
                }`}
              />
              <LottieIcon
                animationData={require('./assets/animation/LocationTab.json')}
                focused={focused}
              />
              <Text
                className={`text-[10px] text-center  mt-1 ${
                  focused
                    ? 'text-green-500 opacity-100'
                    : 'text-green-500 opacity-90'
                }`}
              >
                Map
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="relative items-center">
              <View
                className={`absolute bottom-2  items-center justify-center h-full px-6 ${
                  focused
                    ? 'border-t-2 border-green-500'
                    : 'border-t-2 border-transparent'
                }`}
              />
              <View style={{ transform: [{ rotate: '46deg' }] }}>
                <LottieIcon
                  animationData={require('./assets/animation/AddBar.json')}
                  focused={focused}
                />
              </View>

              <Text
                className={`text-[10px] text-center  mt-1 ${
                  focused
                    ? 'text-green-500 opacity-100'
                    : 'text-green-500 opacity-90'
                }`}
              >
                Report
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="violator"
        component={ViolatorScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="relative items-center">
              <View
                className={`absolute bottom-2  items-center justify-center h-full px-6 ${
                  focused
                    ? 'border-t-2 border-green-500'
                    : 'border-t-2 border-transparent'
                }`}
              />
              <View style={{ rotation: 10 }}>
                <LottieIcon
                  animationData={require('./assets/animation/MenuBar.json')}
                  focused={focused}
                />
              </View>
              <Text
                className={`text-[9px] text-center mt-1 whitespace-nowrap ${
                  focused
                    ? 'text-green-500 opacity-100'
                    : 'text-green-500 opacity-90'
                }`}
              >
                Violator
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="relative items-center">
              <View
                className={`absolute bottom-2  items-center justify-center h-full px-6 ${
                  focused
                    ? 'border-t-2 border-green-500'
                    : 'border-t-2 border-transparent'
                }`}
              />
              <View style={{ rotation: 10 }}>
                <LottieIcon
                  animationData={require('./assets/animation/ViolatorBar.json')}
                  focused={focused}
                />
              </View>

              <Text
                className={`text-[10px] text-center  mt-1 ${
                  focused
                    ? 'text-green-500 opacity-100'
                    : 'text-green-500 opacity-90'
                }`}
              >
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

const Navigation = () => {
<<<<<<< HEAD
  const { colorScheme } = useColorScheme();
  const { onboarding, login } = useAppStore();
  return (
    <NavigationContainer>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={
          login ? 'authTabs' : onboarding ? 'onboarding' : 'welcome'
        }
      >
        {onboarding && (
          <Stack.Screen name="onboarding" component={OnboardingScreen} />
        )}

        {login ? (
          <Stack.Screen name="authTabs" component={AuthTabs} />
        ) : (
          <>
            <Stack.Screen name="welcome" component={Welcome} />
            <Stack.Screen name="login" component={LoginScreen} />
          </>
        )}
        <Stack.Screen
          name="violator_form"
          component={CreateViolatorProfile}
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />
        <Stack.Screen
          name="camera"
          component={CameraModal}
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />
        <Stack.Screen
          name="report_form"
          component={ReportForm}
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />
        <Stack.Screen
          name="violators_details"
          component={ViolatorsDetails}
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="report_details"
          component={ReportDetails}
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="violators_list"
          component={ReportViolatorsList}
          options={{
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="location_form"
          component={LocationForm}
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />

        <Stack.Screen
          name="response_tracker"
          component={TanodTracker}
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default Navigation;

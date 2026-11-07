import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import useAppStore from '../store/useAppStore';
import Welcome from './Welcome';
import LoginScreen from './LoginScreen';
import ResidentRegisterScreen from './ResidentRegisterScreen';
import HomeScreen from './authScreens/tanod/HomeScreen';
import ProfileScreen from './authScreens/tanod/ProfileScreen';
import ReportScreen from './authScreens/tanod/ReportScreen';
import ViolatorScreen from './authScreens/tanod/ViolatorScreen';
import MapScreen from './authScreens/tanod/MapScreen';
import OperationScreen from './authScreens/tanod/Operation';
import Home from './authScreens/resident/HomeScreen';
import Hotline from './authScreens/public/Hotline';

import CreateViolatorProfile from './components/violators/CreateViolatorProfile';
import ReportForm from './components/reports/ReportForm';
import ViolatorsDetails from './components/violators/ViolatorsDetails';
import CameraModal from './components/CameraModal';
import ReportDetails from './components/reports/ReportDetails';
import ReportViolatorsList from './components/reports/ReportViolatorsList';
import OperationDetails from './components/operations/OperationDetails';

import Profile from './authScreens/resident/Profile'
import Request from './authScreens/resident/Request';

import LocationForm from './components/reports/LocationForm';
import TanodTracker from './authScreens/resident/TanodTracker';
import OnboardingScreen from './OnboardingScreen';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { useRef } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { useColorScheme } from 'nativewind';

import WatchList from './authScreens/public/WatchList';
import WatchListDetails from './components/operations/WatchListDetails';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

export type RootStackParamList = {
  welcome: undefined;
  onboarding: undefined;
  login: undefined;
  resident_register: { phone: string }; // 👈 NEW
  authTabs: undefined;
  report: undefined;
  violator: undefined;
  violator_form: { selectAfterCreate?: boolean } | undefined;
  camera: { status: string };
  report_form: undefined;
  violators_details: { id: number };
  report_details: { id: number };
  violators_list: undefined;
  map: undefined;
  location_form: { selectAfterCreate?: boolean } | undefined;
  response_tracker: { requestId: number };
  guest: undefined;
  operations: undefined;
  operation_details: { id: number };
  watchlists: undefined;
  watch_list_details: { id: number };
  hotline: undefined;
};

interface LottieIconProps {
  animationData: AnimationObject;
  focused: boolean;
}

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

const TabItem = ({
  animation,
  label,
  focused,
  rotate,
}: {
  animation: AnimationObject;
  label: string;
  focused: boolean;
  rotate?: string;
}) => (
  <View className="relative items-center">
    <View
      className={`absolute bottom-2 h-full items-center justify-center px-6 ${
        focused
          ? 'border-t-2 border-green-500'
          : 'border-t-2 border-transparent'
      }`}
    />
    <View style={rotate ? { transform: [{ rotate }] } : undefined}>
      <LottieIcon animationData={animation} focused={focused} />
    </View>
    <Text
      className={`mt-1 text-center text-[10px] text-green-500 ${
        focused ? 'opacity-100' : 'opacity-90'
      }`}
    >
      {label}
    </Text>
  </View>
);

const AuthTabs = () => {
  const { colorScheme } = useColorScheme();
  const { user } = useAppStore();

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

  // residents get their own simple tabs
if (user?.role === 'resident') {
  return (
    <Tabs.Navigator screenOptions={screenOptions}>
      <Tabs.Screen
        name="guest"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              animation={require('./assets/animation/HomeBar.json')}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        component={Request}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              animation={require('./assets/animation/AddBar.json')}
              label="Alert"
              focused={focused}
              rotate="46deg"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        component={WatchList}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              animation={require('./assets/animation/MenuBar.json')}
              label="Watch"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              animation={require('./assets/animation/ViolatorBar.json')}
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

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
          <>
            <Stack.Screen name="authTabs" component={AuthTabs} />
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

            <Stack.Screen
              name="operations"
              component={OperationScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="operation_details"
              component={OperationDetails}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="watchlists"
              component={WatchList}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="watch_list_details"
              component={WatchListDetails}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="hotline"
              component={Hotline}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="welcome" component={Welcome} />
            <Stack.Screen name="login" component={LoginScreen} />
            {/* 👇 NEW: only reachable while logged out */}
            <Stack.Screen
              name="resident_register"
              component={ResidentRegisterScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default Navigation;

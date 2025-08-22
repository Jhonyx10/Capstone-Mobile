import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Welcome from "./Welcome";
import LoginScreen from "./LoginScreen";
import HomeScreen from "./authScreens/HomeScreen";
import ProfileScreen from "./authScreens/ProfileScreen";
import ReportScreen from "./authScreens/ReportScreen";
import ViolatorScreen from "./authScreens/ViolatorScreen";
import CreateViolatorProfile from "./components/violators/CreateViolatorProfile";
import ReportForm from "./components/reports/ReportForm";
import ViolatorsDetails from "./components/violators/ViolatorsDetails";
import CameraModal from "./components/CameraModal";
import ReportDetails from "./components/reports/ReportDetails";
import ReportViolatorsList from "./components/reports/ReportViolatorsList";
import MapScreen from "./authScreens/MapScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

export type RootStackParamList = {
  welcome: undefined;
  login: undefined;
  authTabs: undefined; 
  report: undefined;
  violator: undefined;
  violator_form: undefined;
  camera: { status: string };
  report_form: undefined;
  violators_details:  { id: number };
  report_details: {id: number};
  violators_list: undefined;
  map: undefined;
};

const AuthTabs = () => {
    return(
        <Tabs.Navigator screenOptions={{headerShown: false}}>
            <Tabs.Screen name="home" component={HomeScreen} />
            <Tabs.Screen name="map" component={MapScreen} />
            <Tabs.Screen name="report" component={ReportScreen}/>
            <Tabs.Screen name="violator" component={ViolatorScreen}/>
            <Tabs.Screen name="profile" component={ProfileScreen} />
        </Tabs.Navigator>
    )
}

const Navigation = () => {
    return(
       <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false}}>
                <Stack.Screen name="welcome" component={Welcome} />
                <Stack.Screen name="login" component={LoginScreen}/>
                <Stack.Screen name="authTabs" component={AuthTabs}/>
                {/* application forms screens */}
                <Stack.Screen name="violator_form" component={CreateViolatorProfile}
                 options={{
                    presentation: 'modal',
                     animation: 'fade_from_bottom'
                    }}
                 />
                <Stack.Screen name='camera' component={CameraModal}
                    options={{
                    presentation: 'modal',
                     animation: 'fade_from_bottom'
                    }}
                 />
                 <Stack.Screen name='report_form' component={ReportForm}
                     options={{
                        presentation: 'modal',
                        animation: 'fade_from_bottom'
                     }}/>
                    <Stack.Screen name='violators_details' component={ViolatorsDetails}
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_right'
                    }}
                    />
                    <Stack.Screen name="report_details" component={ReportDetails}
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_right'
                        }}
                    />
                    <Stack.Screen name="violators_list" component={ReportViolatorsList}
                      options={{
                        presentation: 'modal',
                        animation: 'slide_from_right'
                        }}
                    />
            </Stack.Navigator>
       </NavigationContainer>
    )
}
export default Navigation
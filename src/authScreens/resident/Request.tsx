import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  StyleSheet,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useColorScheme } from 'nativewind';
import { useState, useEffect } from 'react';
import Mapbox, { MapView } from '@rnmapbox/maps';
import RequestLocation from '../../components/maps/RequestLocation';
import RequestGeofenceLayer from '../../components/maps/RequestGeofenceLayer';
import RequestForm from '../../components/request/RequestForm';
import Icon from '../../components/Icon';
import Enter from '../../components/Enter';
import useAppStore from '../../../store/useAppStore';

const INK = '#0F172A'; // slate-900 (Icon takes hex, not className)

const Request = () => {
  const mapbox_token = useAppStore(s => s.mapbox_token);
  const [hasPermission, setHasPermission] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const ready = !!userCoords;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (!mapbox_token) return;

    // token first, so it is set before the MapView mounts
    Mapbox.setAccessToken(mapbox_token);
    Mapbox.setTelemetryEnabled(false);

    const getPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    };

    getPermission();
  }, [mapbox_token]);

  if (!hasPermission || !mapbox_token) {
    return <View className="flex-1 bg-slate-200" />;
  }

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Light}
        logoEnabled={false}
        attributionPosition={{ bottom: 8, left: 8 }}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        {/* existing incident requests + their 50 m geofences */}
        <RequestGeofenceLayer />
        <RequestLocation onLocationChange={setUserCoords} />
      </MapView>

      {/* Top pill: lime active segment + live GPS status */}
      <Enter
        from="top"
        className="absolute inset-x-0 top-10 items-center gap-2"
        pointerEvents="box-none"
      >
        <View className="flex-row rounded-full bg-slate-900 p-1 shadow-lg">
          <View className="flex-row items-center gap-1.5 rounded-full bg-lime-400 px-4 py-2">
            <Icon
              name="alert-triangle"
              size={16}
              strokeWidth={2.4}
              color={INK}
            />
            <Text className="text-sm font-semibold text-slate-900">
              Request Help
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 px-4 py-2">
            <View
              className={`h-2.5 w-2.5 rounded-full ${
                ready ? 'bg-lime-400' : 'bg-amber-400'
              }`}
            />
            <Text className="text-sm font-semibold text-slate-400">
              {ready ? 'GPS ready' : 'Locating...'}
            </Text>
          </View>
        </View>
      </Enter>

      {/* Bottom card, lifted above the tab bar */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 16, right: 16, bottom: 96 }}
      >
        <View className="overflow-hidden rounded-3xl border border-white/70 dark:border-transparent">
          {/* real blur of the map behind the card, light mode only */}
          {!isDark && (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={20}
              overlayColor="transparent"
              reducedTransparencyFallbackColor="white"
            />
          )}

          {/* tint on top of the blur keeps the text readable */}
          <View
            className="p-4"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 23, 42, 0.95)' // slate-900
                : 'rgba(255, 255, 255, 0.78)',
            }}
          >
            <RequestForm userCoords={userCoords} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Request;

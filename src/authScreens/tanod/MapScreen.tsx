import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect } from 'react';
import Mapbox, { MapView } from '@rnmapbox/maps';
import RequestResponseMap from '../../components/maps/RequestResponseMap';
import IncidentLocations from '../../components/maps/IncidentHeatMap';
import useTimer from '../../hooks/useTimer';
import useAppStore from '../../../store/useAppStore';
import ResponseTimer from '../../components/ResponseTimer';
// adjust this path to wherever your Icon.tsx lives
import Icon from '../../components/Icon';
import Enter from '../../components/Enter';

// slate-900 / slate-400 (Icon takes hex, not className)
const INK = '#0F172A';
const SLATE = '#94A3B8';

const MapScreen = () => {
  const mapbox_token = useAppStore(s => s.mapbox_token);
  const [hasPermission, setHasPermission] = useState(false);
  const [isHeatmap, setIsHeatmap] = useState(false);
  const { seconds, start, stop, reset } = useTimer();
  const [currentDistance, setCurrentDistance] = useState(0);

  useEffect(() => {
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
  }, []);

  if (!hasPermission) {
    return <View className="flex-1" />;
  }

  return (
    <View className="flex-1">
      {/* Light base map so the red pins, lime route and heat colors stand out */}
      <MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Light}
        logoEnabled={false}
        attributionPosition={{ bottom: 8, left: 8 }}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        {isHeatmap ? (
          <IncidentLocations />
        ) : (
          <RequestResponseMap
            mapboxToken={mapbox_token}
            seconds={seconds}
            currentDistance={currentDistance}
            start={start}
            stop={stop}
            reset={reset}
            setCurrentDistance={setCurrentDistance}
          />
        )}
      </MapView>

      <ResponseTimer seconds={seconds} currentDistance={currentDistance} />

      {/* Mode switch */}
      <Enter
        from="top"
        className="absolute inset-x-0 top-10 items-center gap-2"
        pointerEvents="box-none"
      >
        <View className="flex-row rounded-full bg-slate-900 p-1 shadow-lg">
          <SegmentButton
            label="Respond"
            icon="navigation"
            active={!isHeatmap}
            onPress={() => setIsHeatmap(false)}
          />
          <SegmentButton
            label="Heatmap"
            icon="layers"
            active={isHeatmap}
            onPress={() => setIsHeatmap(true)}
          />
        </View>

        {isHeatmap && (
          <View className="flex-row items-center gap-2 rounded-full bg-slate-900/90 px-3.5 py-1.5">
            <Text className="text-xs text-slate-200">Fewer incidents</Text>
            <View className="flex-row overflow-hidden rounded">
              <View className="h-2 w-[18px] bg-yellow-200" />
              <View className="h-2 w-[18px] bg-orange-400" />
              <View className="h-2 w-[18px] bg-red-500" />
              <View className="h-2 w-[18px] bg-red-900" />
            </View>
            <Text className="text-xs text-slate-200">More</Text>
          </View>
        )}
      </Enter>
    </View>
  );
};

const SegmentButton = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: 'navigation' | 'layers';
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
      active ? 'bg-lime-400' : ''
    }`}
  >
    <Icon
      name={icon}
      size={16}
      strokeWidth={2.4}
      color={active ? INK : SLATE}
    />
    <Text
      className={`text-sm font-semibold ${
        active ? 'text-slate-900' : 'text-slate-400'
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default MapScreen;

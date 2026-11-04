import { View, Text } from 'react-native';
import useResponseStore from '../../store/useResponseStore';
// adjust this path to wherever your Icon.tsx lives
import Icon from './Icon';
import Enter from './Enter';

interface TimerProps {
  seconds: number;
  currentDistance: number;
}

const LIME = '#A3E635'; // lime-400
const SLATE = '#94A3B8'; // slate-400

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// 0.42 km -> "420 m", 1.5 km -> "1.50 km"
const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;

const ResponseTimer = ({ seconds, currentDistance }: TimerProps) => {
  // `distance` is null until a request is selected and its route is loaded
  const { distance } = useResponseStore();

  // Nothing selected yet: tell the responder what to do
  if (distance == null) {
    return (
      <Enter
        pointerEvents="none"
        className="absolute inset-x-4 bottom-8 flex-row items-center gap-3 rounded-2xl bg-slate-900/95 px-4 py-3 shadow-lg"
      >
        <Icon name="target" size={20} color={LIME} />
        <Text className="flex-1 text-sm text-slate-200">
          Tap a red pin to start responding.
        </Text>
      </Enter>
    );
  }

  const hasLive = currentDistance > 0;
  // straight-line distance left vs. route length, so it's an approximation
  const progress =
    distance > 0 && hasLive
      ? Math.min(1, Math.max(0, 1 - currentDistance / distance))
      : 0;

  return (
    <Enter
      pointerEvents="none"
      className="absolute inset-x-4 bottom-8 rounded-3xl bg-slate-900/95 p-4 shadow-lg"
    >
      <View className="flex-row items-end justify-between">
        <View>
          <View className="flex-row items-center gap-1.5">
            <Icon name="clock" size={14} color={SLATE} />
            <Text className="text-xs text-slate-400">Response time</Text>
          </View>
          <Text className="text-4xl font-bold text-white">
            {formatTime(seconds)}
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-1.5">
            <Icon name="navigation" size={14} color={LIME} />
            <Text className="text-xs text-slate-400">Remaining</Text>
          </View>
          <Text className="text-3xl font-bold text-lime-400">
            {hasLive ? formatDistance(currentDistance) : '--'}
          </Text>
        </View>
      </View>

      <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <View
          className="h-full rounded-full bg-lime-400"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Icon name="map-pin" size={12} color={SLATE} />
          <Text className="text-xs text-slate-400">
            Route {formatDistance(distance)}
          </Text>
        </View>
        <Text className="text-xs text-slate-400">
          {Math.round(progress * 100)}% there
        </Text>
      </View>
    </Enter>
  );
};

export default ResponseTimer;

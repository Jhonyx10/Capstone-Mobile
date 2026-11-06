import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppStore from '../../../store/useAppStore';
import { getOperationDetails } from '../../../util/getOperationDetails';
import {
  formatEventDate,
  countdownLabel,
  STATUS_STYLES,
} from '../../../util/operationHelper';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';
import OperationMap, {
  activeUsers,
  areaState,
  MINE_COLOR,
  STATE_COLORS,
  STATE_LABELS,
} from '../maps/OperationMap';
import type { OperationArea } from '../../types/OperationType';
import type { RootStackParamList } from '../../Navigation';
import { useUserLocation } from '../../../util/useUserLocation';
import { useRouteToOperation } from '../../../util/useRouteToOperation';
import { formatDistance, formatDuration, isInside } from '../../../util/geo';
import type { LngLat } from '../../../util/geo';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'operation_details'>;

const GREEN = '#5D8736';
const BAR_HEIGHT = 10;
const DOT = 8;

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel="Go back"
    className="h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-800"
  >
    <Icon name="chevron-left" tone="neutral" size={22} />
  </Pressable>
);

const HeroChip = ({ icon, text }: { icon: IconName; text: string }) => (
  <View className="flex-row items-center rounded-full bg-white/20 px-3 py-1.5">
    <Icon name={icon} size={14} color="#FFFFFF" />
    <Text className="ml-1.5 text-xs font-semibold text-white">{text}</Text>
  </View>
);

// Fixed pixel sizes on purpose: the track must never depend on a percentage
// height or a utility class, or it can stretch to fill the screen.
// The fill grows after the screen settles, on the UI thread.
const ProgressBar = ({ value }: { value: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      350,
      withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
  }, [value]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      className="bg-gray-100 dark:bg-slate-700"
      style={{
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: BAR_HEIGHT,
            borderRadius: BAR_HEIGHT / 2,
            backgroundColor: GREEN,
          },
          fillStyle,
        ]}
      />
    </View>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1">
    <Text className="text-lg font-bold text-gray-900 dark:text-white">
      {value}
    </Text>
    <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
  </View>
);

const AreaRow = ({
  area,
  selected,
  mine,
  onPress,
}: {
  area: OperationArea;
  selected: boolean;
  mine: boolean;
  onPress: () => void;
}) => {
  const users = activeUsers(area);
  const state = areaState(area);
  const slots = Array.from({ length: Math.min(area.capacity, 10) });

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-2xl border bg-white p-4 active:opacity-80 dark:bg-slate-800 ${
        mine
          ? 'border-[#7C3AED] bg-[#7C3AED]/5 dark:bg-[#7C3AED]/15'
          : selected
          ? 'border-lime-500'
          : 'border-gray-100 dark:border-slate-700'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${STATE_COLORS[state]}26` }}
        >
          <Icon
            name={state === 'empty' ? 'alert-triangle' : 'shield'}
            size={20}
            color={STATE_COLORS[state]}
          />
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="mr-2 flex-shrink text-base font-semibold text-gray-900 dark:text-white">
              {area.name}
            </Text>
            {mine ? (
              <View
                className="rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: MINE_COLOR }}
              >
                <Text className="text-[11px] font-bold text-white">
                  Your area
                </Text>
              </View>
            ) : null}
          </View>
          <View className="mt-1 flex-row items-center">
            {slots.map((_, i) => (
              <View
                key={i}
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: DOT / 2,
                  marginRight: 4,
                  backgroundColor:
                    i < users.length ? STATE_COLORS[state] : '#CBD5E1',
                }}
              />
            ))}
            <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {users.length}/{area.capacity} · {STATE_LABELS[state]}
            </Text>
          </View>
        </View>

        <Icon
          name="map-pin"
          color={mine ? MINE_COLOR : undefined}
          tone={selected ? 'lime' : 'muted'}
          size={18}
        />
      </View>

      <View className="mt-3 flex-row flex-wrap">
        {users.length === 0 ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            No tanod assigned yet
          </Text>
        ) : (
          users.map(u => (
            <View
              key={u.id}
              className="mb-1.5 mr-2 flex-row items-center rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-700"
            >
              <Icon name="user" tone="neutral" size={12} />
              <Text className="ml-1 text-xs text-gray-700 dark:text-gray-200">
                {u.name}
              </Text>
            </View>
          ))
        )}
      </View>
    </Pressable>
  );
};

const OperationDetails = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);
  // id of the logged-in tanod. Change this if your store names it differently.
  const myId = useAppStore(s => s.user?.id);
  const mapboxToken = useAppStore(s => s.mapbox_token);
  const { coords: myCoords, denied: locationDenied } = useUserLocation();
  const scrollRef = useRef<ScrollView>(null);
  const mapY = useRef(0);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const {
    data: op,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['operation', params.id],
    queryFn: () =>
      getOperationDetails({ base_url, token, operation_id: params.id }),
    enabled: !!token,
  });

  const goBack = () => navigation.goBack();

  // the operation's own location, and the trip from the user to it
  const destination: LngLat | null =
    op &&
    Number.isFinite(Number(op.longitude)) &&
    Number.isFinite(Number(op.latitude))
      ? [Number(op.longitude), Number(op.latitude)]
      : null;
  const atOperation = !!(op && myCoords && isInside(myCoords, op));
  const route = useRouteToOperation(
    atOperation ? null : myCoords,
    destination,
    mapboxToken,
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (isError || !op) {
    return (
      <View
        className="flex-1 bg-gray-50 px-4 dark:bg-slate-900"
        style={{ paddingTop: insets.top + 8 }}
      >
        <BackButton onPress={goBack} />
        <View className="flex-1 items-center justify-center px-4">
          <Icon name="alert-triangle" color="#F59E0B" size={36} />
          <Text className="mt-3 text-center text-base text-gray-700 dark:text-gray-200">
            {isError
              ? "Couldn't load this operation."
              : 'This operation no longer exists.'}
          </Text>
          {isError && (
            <Pressable
              onPress={() => refetch()}
              className="mt-4 flex-row items-center rounded-full bg-[#5D8736] px-5 py-3 active:opacity-80"
            >
              <Icon
                name="refresh-cw"
                size={16}
                strokeWidth={2.4}
                color="#FFFFFF"
              />
              <Text className="ml-2 font-semibold text-white">Try again</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const areas = op.areas ?? [];
  const totalCapacity = areas.reduce((n, a) => n + a.capacity, 0);
  const assigned = areas.reduce(
    (n, a) => n + Math.min(activeUsers(a).length, a.capacity),
    0,
  );
  const open = Math.max(totalCapacity - assigned, 0);
  const coverage = totalCapacity ? assigned / totalCapacity : 0;
  const date = formatEventDate(op.event_date);
  const countdown =
    op.status === 'upcoming' ? countdownLabel(op.event_date) : null;

  // areas where the logged-in tanod is an active assignee
  const myAreas =
    myId == null
      ? []
      : areas.filter(a =>
          activeUsers(a).some(u => Number(u.id) === Number(myId)),
        );
  const myAreaIds = myAreas.map(a => a.id);

  // the one distance shown: from the user to the operation location
  const tripLabel = !myCoords
    ? null
    : atOperation
    ? "You're at the operation"
    : !route
    ? null
    : route.kind === 'road' && route.seconds != null
    ? `${formatDistance(route.meters)}, about ${formatDuration(
        route.seconds,
      )} by road`
    : `${formatDistance(route.meters)} away in a straight line`;

  // my area first, so it is the first thing in the list
  const orderedAreas = [...areas].sort(
    (a, b) =>
      Number(myAreaIds.includes(b.id)) - Number(myAreaIds.includes(a.id)),
  );

  const pickArea = (id: number | null) => {
    setSelectedAreaId(prev => (id !== null && prev === id ? null : id));
  };

  const pickFromList = (id: number) => {
    pickArea(id);
    // bring the map into view so the camera move is visible
    scrollRef.current?.scrollTo({
      y: Math.max(mapY.current - 12, 0),
      animated: true,
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 32,
      }}
    >
      {/* top bar */}
      <Enter from="top" index={0}>
        <View className="mb-4 flex-row items-center">
          <BackButton onPress={goBack} />
          <Text className="ml-3 text-base font-semibold text-gray-600 dark:text-gray-300">
            Operation details
          </Text>
        </View>
      </Enter>

      {/* hero */}
      <Enter index={1}>
        <LinearGradient
          colors={['#A9C46C', '#5D8736']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, padding: 16 }}
        >
          <View className="flex-row items-start justify-between">
            <Text className="mr-3 flex-1 text-2xl font-bold text-white">
              {op.name}
            </Text>
            <View className="rounded-full bg-white/25 px-3 py-1">
              <Text className="text-xs font-bold text-white">
                {STATUS_STYLES[op.status]?.label ?? op.status}
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row flex-wrap" style={{ gap: 8 }}>
            <HeroChip icon="calendar" text={date ?? 'Date not set'} />
            {countdown ? <HeroChip icon="clock" text={countdown} /> : null}
            <HeroChip
              icon="map-pin"
              text={op.zone?.zone_name ?? 'No zone assigned'}
            />
          </View>
        </LinearGradient>
      </Enter>

      {/* my assignment */}
      {myId != null && (
        <Enter index={2}>
          {myAreas.length > 0 ? (
            <Pressable
              onPress={() => pickFromList(myAreas[0].id)}
              accessibilityRole="button"
              accessibilityLabel="Show my area on the map"
              className="mt-4 flex-row items-center rounded-2xl border border-[#7C3AED] bg-[#7C3AED]/10 p-4 active:opacity-80 dark:bg-[#7C3AED]/20"
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: MINE_COLOR }}
              >
                <Icon name="shield" color="#FFFFFF" size={20} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-600 dark:text-gray-300">
                  Your assignment
                </Text>
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  {myAreas.map(a => a.name).join(', ')}
                </Text>
              </View>
              <Icon name="chevron-right" color={MINE_COLOR} size={20} />
            </Pressable>
          ) : (
            <View className="mt-4 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-800">
              <Icon name="user" tone="muted" size={18} />
              <Text className="ml-3 flex-1 text-sm text-gray-600 dark:text-gray-300">
                You're not assigned to an area in this operation.
              </Text>
            </View>
          )}
        </Enter>
      )}

      {/* staffing */}
      <Enter
        index={3}
        className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
              <Icon name="users" size={16} />
            </View>
            <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
              Staffing
            </Text>
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            {Math.round(coverage * 100)}%
          </Text>
        </View>
        <ProgressBar value={coverage} />
        <View className="mt-4 flex-row">
          <MiniStat label="Areas" value={String(areas.length)} />
          <MiniStat label="Assigned" value={`${assigned}/${totalCapacity}`} />
          <MiniStat label="Open slots" value={String(open)} />
        </View>
      </Enter>

      {/* map */}
      <Enter
        index={4}
        className="mt-4"
        onLayout={e => {
          mapY.current = e.nativeEvent.layout.y;
        }}
      >
        <OperationMap
          operation={op}
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelectArea={pickArea}
          myAreaIds={myAreaIds}
          userLocation={myCoords}
          route={atOperation ? null : route}
          destination={destination}
          tripLabel={tripLabel}
        />
      </Enter>

      {/* areas */}
      <Enter index={5}>
        <View className="mb-1 mt-6 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Areas
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Tap an area to see it on the map
          </Text>
        </View>
      </Enter>

      {locationDenied ? (
        <Text className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          Location is off. Allow it in settings to see the route to this
          operation.
        </Text>
      ) : null}

      {areas.length === 0 ? (
        <Enter index={6}>
          <View className="mt-3 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
            <Icon name="map" size={28} tone="muted" />
            <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No areas have been added to this operation.
            </Text>
          </View>
        </Enter>
      ) : (
        <View className="mt-2">
          {orderedAreas.map((a, i) => (
            <Enter key={a.id} index={6 + i}>
              <AreaRow
                area={a}
                selected={a.id === selectedAreaId}
                mine={myAreaIds.includes(a.id)}
                onPress={() => pickFromList(a.id)}
              />
            </Enter>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default OperationDetails;

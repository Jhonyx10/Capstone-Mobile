import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppStore from '../../../store/useAppStore';
import { getWatchListDetails } from '../../../util/getWatchListDetails';
import { formatEventDate } from '../../../util/operationHelper';
import {
  normalizeSightings,
  formatDateTime,
  timeAgo,
} from '../../../util/sightingsHelper';
import type { SightingPoint } from '../../../util/sightingsHelper';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';
import SightingsMap, {
  LATEST_COLOR,
  EARLIER_COLOR,
} from '../maps/SightingsMap';
import type { RootStackParamList } from '../../Navigation';
import ReportSightingSheet from './ReportSightingSheet';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'watch_list_details'>;

const THEME = '#5D8736';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1">
    <Text
      numberOfLines={1}
      className="text-lg font-bold text-gray-900 dark:text-white"
    >
      {value}
    </Text>
    <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
  </View>
);

const SightingRow = ({
  s,
  selected,
  onPress,
}: {
  s: SightingPoint;
  selected: boolean;
  onPress: () => void;
}) => {
  const color = s.latest ? LATEST_COLOR : EARLIER_COLOR;
  const ago = timeAgo(s.at);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Sighting ${s.n}, show on map`}
      className={`mb-3 flex-row rounded-2xl border bg-white p-4 active:opacity-80 dark:bg-slate-800 ${
        selected ? 'border-[#5D8736]' : 'border-gray-100 dark:border-slate-700'
      }`}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Text className="text-sm font-bold text-white">{s.n}</Text>
      </View>

      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="mr-2 flex-1 text-base font-semibold text-gray-900 dark:text-white">
            {formatDateTime(s.at)}
          </Text>
          {s.latest ? (
            <View className="rounded-full bg-red-100 px-2.5 py-1 dark:bg-red-900/30">
              <Text className="text-[11px] font-bold text-red-700 dark:text-red-400">
                Latest
              </Text>
            </View>
          ) : null}
        </View>

        {ago ? (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {ago}
          </Text>
        ) : null}

        <View className="mt-1.5 flex-row items-center">
          <Icon name="map-pin" tone={selected ? 'lime' : 'muted'} size={14} />
          <Text
            numberOfLines={2}
            className="ml-2 flex-1 text-sm text-gray-600 dark:text-gray-300"
          >
            {s.place ?? `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`}
          </Text>
        </View>

        {s.note ? (
          <Text className="mt-1.5 text-sm text-gray-700 dark:text-gray-200">
            {s.note}
          </Text>
        ) : null}

        {s.by ? (
          <View className="mt-2 flex-row items-center self-start rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-700">
            <Icon name="user" tone="neutral" size={12} />
            <Text className="ml-1 text-xs text-gray-700 dark:text-gray-200">
              {s.by}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const WatchListDetails = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);
  const scrollRef = useRef<ScrollView>(null);
  const mapY = useRef(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  

  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['watch-list', params.id],
    queryFn: () =>
      getWatchListDetails({ base_url, token, watch_list_id: params.id }),
    enabled: !!token,
  });

  const sightings = useMemo(
    () => normalizeSightings(item?.sightings),
    [item?.sightings],
  );

  const goBack = () => navigation.goBack();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color={THEME} />
      </View>
    );
  }

  if (isError || !item) {
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
              ? "Couldn't load this entry."
              : 'This entry no longer exists.'}
          </Text>
          {isError && (
            <Pressable
              onPress={() => refetch()}
              className="mt-4 flex-row items-center rounded-lg bg-[#5D8736] px-5 py-3 active:opacity-80"
            >
              <Icon
                name="refresh-cw"
                size={16}
                strokeWidth={2.4}
                color="#FFFFFF"
              />
              <Text className="ml-2 font-bold text-white">Try again</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const added = formatEventDate(item.created_at);
  const latest = sightings[0];
  const earliest = sightings[sightings.length - 1];
  const showImage = !!item.image_url && !imageFailed;

  const pick = (id: number | null) =>
    setSelectedId(prev => (id !== null && prev === id ? null : id));

  const pickFromList = (id: number) => {
    pick(id);
    // bring the map into view so the camera move is visible
    scrollRef.current?.scrollTo({
      y: Math.max(mapY.current - 12, 0),
      animated: true,
    });
  };

  return (
    <>
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
              Watch list details
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
            <View className="flex-row items-center">
              <View className="h-20 w-20 overflow-hidden rounded-2xl bg-white/25">
                {showImage ? (
                  <Image
                    source={{ uri: item.image_url! }}
                    onError={() => setImageFailed(true)}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Icon
                      name={item.type === 'person' ? 'user' : 'shield'}
                      color="#FFFFFF"
                      size={30}
                    />
                  </View>
                )}
              </View>

              <View className="ml-4 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-2xl font-bold tracking-wide text-white"
                >
                  {item.identifier}
                </Text>
                <Text className="text-sm text-white/80">{cap(item.type)}</Text>
                <View className="mt-2 self-start rounded-full bg-white/25 px-3 py-1">
                  <Text className="text-xs font-bold text-white">
                    {cap(item.status)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap" style={{ gap: 8 }}>
              {item.details ? (
                <HeroChip
                  icon={item.type === 'person' ? 'user' : 'shield'}
                  text={item.details}
                />
              ) : null}
              {added ? (
                <HeroChip icon="calendar" text={`Added ${added}`} />
              ) : null}
            </View>
          </LinearGradient>
        </Enter>
        <Enter index={2} className="mt-4">
          <Pressable
            onPress={() => setReportOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Report a sighting"
            className="flex-row items-center justify-center rounded-2xl bg-[#5D8736] py-4 active:opacity-80"
          >
            <Icon name="map-pin" size={18} strokeWidth={2.4} color="#FFFFFF" />
            <Text className="ml-2 text-base font-bold text-white">
              Report a sighting
            </Text>
          </Pressable>
        </Enter>
        {/* reason */}
        {item.reason ? (
          <Enter
            index={2}
            className="mt-4 flex-row rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Icon name="alert-triangle" color="#F59E0B" size={16} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Reason
              </Text>
              <Text className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">
                {item.reason}
              </Text>
            </View>
          </Enter>
        ) : null}

        {/* sightings summary */}
        <Enter
          index={3}
          className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <View className="mb-3 flex-row items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
              <Icon name="clock" color={THEME} size={16} />
            </View>
            <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
              Sightings
            </Text>
          </View>
          <View className="flex-row">
            <Stat
              label="Total"
              value={String(
                Math.max(sightings.length, item.sightings_count ?? 0),
              )}
            />
            <Stat
              label="Last seen"
              value={timeAgo(latest?.at ?? null) ?? '-'}
            />
            <Stat
              label="First seen"
              value={earliest?.at ? formatEventDate(earliest.at) ?? '-' : '-'}
            />
          </View>
        </Enter>

        {sightings.length === 0 ? (
          <Enter index={4}>
            <View className="mt-4 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
              <Icon name="map" size={28} tone="muted" />
              <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
                No sightings yet
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                When this {item.type} is spotted, each location will appear on a
                map here.
              </Text>
            </View>
          </Enter>
        ) : (
          <>
            {/* map */}
            <Enter
              index={4}
              className="mt-4"
              onLayout={e => {
                mapY.current = e.nativeEvent.layout.y;
              }}
            >
              <SightingsMap
                sightings={sightings}
                selectedId={selectedId}
                onSelect={pick}
              />
            </Enter>

            {/* history */}
            <Enter index={5}>
              <View className="mb-1 mt-6 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  History
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Tap a sighting to see it on the map
                </Text>
              </View>
            </Enter>

            <View className="mt-2">
              {sightings.map((s, i) => (
                <Enter key={s.id} index={6 + i} skip={i > 4}>
                  <SightingRow
                    s={s}
                    selected={s.id === selectedId}
                    onPress={() => pickFromList(s.id)}
                  />
                </Enter>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <ReportSightingSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        subjectId={item.id}
        subjectLabel={item.identifier}
      />
    </>
  );
};

export default WatchListDetails;

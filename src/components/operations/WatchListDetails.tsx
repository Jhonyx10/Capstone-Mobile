import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
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
const COLLAPSED_COUNT = 5; // history rows shown before "Show more"

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
    <Text numberOfLines={1} className="ml-1.5 text-xs font-semibold text-white">
      {text}
    </Text>
  </View>
);

const StatTile = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
      <Icon name={icon} color={THEME} size={15} />
    </View>
    <Text
      numberOfLines={1}
      className="mt-2 text-base font-bold text-gray-900 dark:text-white"
    >
      {value}
    </Text>
    <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
  </View>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View className="ml-3 flex-row items-center">
    <View
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
      {label}
    </Text>
  </View>
);

const TimelineRow = ({
  s,
  selected,
  last,
  onPress,
}: {
  s: SightingPoint;
  selected: boolean;
  last: boolean;
  onPress: () => void;
}) => {
  const color = s.latest ? LATEST_COLOR : EARLIER_COLOR;
  const ago = timeAgo(s.at);

  return (
    <View className="flex-row">
      {/* rail */}
      <View className="mr-3 items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Text className="text-xs font-bold text-white">{s.n}</Text>
        </View>
        {!last ? (
          <View className="mt-1 w-0.5 flex-1 bg-gray-200 dark:bg-slate-700" />
        ) : null}
      </View>

      {/* card */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Sighting ${s.n}, show on map`}
        className={`mb-3 flex-1 rounded-2xl border bg-white p-3.5 active:opacity-80 dark:bg-slate-800 ${
          selected
            ? 'border-[#5D8736]'
            : 'border-gray-100 dark:border-slate-700'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <Text className="mr-2 flex-1 text-[15px] font-semibold text-gray-900 dark:text-white">
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

        <View className="mt-2 flex-row items-center justify-between">
          {s.by ? (
            <View className="flex-row items-center rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-700">
              <Icon name="user" tone="neutral" size={12} />
              <Text className="ml-1 text-xs text-gray-700 dark:text-gray-200">
                {s.by}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {selected ? (
            <Text className="text-xs font-semibold text-lime-700 dark:text-lime-400">
              Showing on map
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
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
  const [imageOpen, setImageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

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
  const isActive = item.status === 'active';

  const visibleSightings = showAll
    ? sightings
    : sightings.slice(0, COLLAPSED_COUNT);
  const hiddenCount = sightings.length - visibleSightings.length;

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
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 110, // clears the sticky report bar
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
              <Pressable
                onPress={() => setImageOpen(true)}
                disabled={!showImage}
                accessibilityLabel="View photo"
                className="h-20 w-20 overflow-hidden rounded-2xl bg-white/25"
              >
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
              </Pressable>

              <View className="ml-4 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-2xl font-bold tracking-wide text-white"
                >
                  {item.identifier}
                </Text>
                <View className="mt-1.5 flex-row items-center">
                  <View className="rounded-full bg-white/25 px-3 py-1">
                    <Text className="text-xs font-bold text-white">
                      {cap(item.type)}
                    </Text>
                  </View>
                  <View
                    className={`ml-2 rounded-full px-3 py-1 ${
                      isActive ? 'bg-red-500' : 'bg-white/25'
                    }`}
                  >
                    <Text className="text-xs font-bold text-white">
                      {cap(item.status)}
                    </Text>
                  </View>
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

            {showImage ? (
              <Text className="mt-3 text-xs text-white/70">
                Tap the photo to enlarge it
              </Text>
            ) : null}
          </LinearGradient>
        </Enter>

        {/* safety tip, only while the entry is still active */}
        {isActive ? (
          <Enter
            index={2}
            className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20"
          >
            <View className="flex-row items-center">
              <Icon name="shield" color="#EF4444" size={18} />
              <Text className="ml-2 text-base font-semibold text-red-900 dark:text-red-200">
                Spotted this {item.type}?
              </Text>
            </View>
            <Text className="mt-1.5 text-sm text-red-900/80 dark:text-red-200/80">
              Don't approach or confront. Report where you saw it, and call the
              hotline if you feel unsafe.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('hotline')}
              accessibilityRole="button"
              className="mt-3 flex-row items-center self-start rounded-full bg-red-500 px-4 py-2 active:opacity-80"
            >
              <Icon
                name="alert-triangle"
                size={14}
                strokeWidth={2.4}
                color="#FFFFFF"
              />
              <Text className="ml-1.5 text-sm font-bold text-white">
                Emergency hotlines
              </Text>
            </Pressable>
          </Enter>
        ) : null}

        {/* reason */}
        {item.reason ? (
          <Enter
            index={3}
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

        {/* stats */}
        <Enter index={4} className="mt-4">
          <View className="flex-row" style={{ gap: 10 }}>
            <StatTile
              icon="eye"
              label="Sightings"
              value={String(
                Math.max(sightings.length, item.sightings_count ?? 0),
              )}
            />
            <StatTile
              icon="clock"
              label="Last seen"
              value={timeAgo(latest?.at ?? null) ?? '-'}
            />
            <StatTile
              icon="calendar"
              label="First seen"
              value={earliest?.at ? formatEventDate(earliest.at) ?? '-' : '-'}
            />
          </View>
        </Enter>

        {sightings.length === 0 ? (
          <Enter index={5}>
            <View className="mt-4 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
              <Icon name="map" size={28} tone="muted" />
              <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
                No sightings yet
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                When this {item.type} is spotted, each location will appear on a
                map here. Be the first to report one.
              </Text>
            </View>
          </Enter>
        ) : (
          <>
            {/* map */}
            <Enter
              index={5}
              className="mt-6"
              onLayout={e => {
                mapY.current = e.nativeEvent.layout.y;
              }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Where it was seen
                </Text>
                <View className="flex-row items-center">
                  <LegendDot color={LATEST_COLOR} label="Latest" />
                  <LegendDot color={EARLIER_COLOR} label="Earlier" />
                </View>
              </View>
              <SightingsMap
                sightings={sightings}
                selectedId={selectedId}
                onSelect={pick}
              />
            </Enter>

            {/* history */}
            <Enter index={6}>
              <View className="mb-3 mt-6 flex-row items-end justify-between">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  History
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Tap a sighting to see it on the map
                </Text>
              </View>
            </Enter>

            <View>
              {visibleSightings.map((s, i) => (
                <Enter key={s.id} index={7 + i} skip={i > 3}>
                  <TimelineRow
                    s={s}
                    selected={s.id === selectedId}
                    last={
                      i === visibleSightings.length - 1 && hiddenCount === 0
                    }
                    onPress={() => pickFromList(s.id)}
                  />
                </Enter>
              ))}
            </View>

            {sightings.length > COLLAPSED_COUNT ? (
              <Pressable
                onPress={() => setShowAll(v => !v)}
                accessibilityRole="button"
                className="mt-1 items-center rounded-2xl border border-gray-100 bg-white py-3 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
              >
                <Text className="text-sm font-semibold text-lime-700 dark:text-lime-400">
                  {showAll
                    ? 'Show fewer'
                    : `Show ${hiddenCount} more ${
                        hiddenCount === 1 ? 'sighting' : 'sightings'
                      }`}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* sticky report bar */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <View
          className="border-t border-gray-200 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-900"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
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
        </View>
      </View>

      <ReportSightingSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        subjectId={item.id}
        subjectLabel={item.identifier}
      />

      {/* full-screen photo */}
      <Modal
        visible={imageOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImageOpen(false)}
      >
        <Pressable
          onPress={() => setImageOpen(false)}
          className="flex-1 items-center justify-center bg-black/90 px-4"
        >
          {showImage ? (
            <Image
              source={{ uri: item.image_url! }}
              resizeMode="contain"
              style={{ width: '100%', height: '80%' }}
            />
          ) : null}
          <Text className="mt-3 text-sm text-white/70">Tap to close</Text>
        </Pressable>
      </Modal>
    </View>
  );
};

export default WatchListDetails;

import { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppStore from '../../../store/useAppStore';
import { getWatchLists } from '../../../util/getWatchLists';
import { formatEventDate } from '../../../util/operationHelper';
import Icon, { IconName } from '../../components/Icon';
import Enter from '../../components/Enter';
import type { WatchListItem } from '../../types/WatchListType';
import type { RootStackParamList } from '../../Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const THEME = '#5D8736';

// classes are written out in full so NativeWind can find them
const STATUS: Record<string, { bar: string; pill: string; text: string }> = {
  active: {
    bar: 'bg-red-500',
    pill: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
  },
  resolved: {
    bar: 'bg-[#5D8736]',
    pill: 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25',
    text: 'text-[#5D8736] dark:text-lime-400',
  },
};
const FALLBACK = {
  bar: 'bg-gray-300 dark:bg-slate-600',
  pill: 'bg-gray-100 dark:bg-slate-700',
  text: 'text-gray-600 dark:text-gray-300',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (t: string) => (t === 'person' ? 'People' : `${cap(t)}s`);
const typeIcon = (t: string): IconName => (t === 'person' ? 'user' : 'shield');

type SortKey = 'new' | 'seen';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'Newest' },
  { key: 'seen', label: 'Most sighted' },
];

interface Option {
  key: string;
  label: string;
  count: number;
}

const buildOptions = (
  items: WatchListItem[],
  pick: (i: WatchListItem) => string,
  label: (key: string) => string,
): Option[] => {
  const counts = new Map<string, number>();
  items.forEach(i => counts.set(pick(i), (counts.get(pick(i)) ?? 0) + 1));
  return [
    { key: 'all', label: 'All', count: items.length },
    ...Array.from(counts, ([key, count]) => ({
      key,
      label: label(key),
      count,
    })),
  ];
};

const HeroStat = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-2xl bg-white/20 px-3 py-2.5">
    <View className="flex-row items-center">
      <Icon name={icon} color="#FFFFFF" size={13} />
      <Text className="ml-1.5 text-xs text-white/80">{label}</Text>
    </View>
    <Text className="mt-0.5 text-lg font-bold text-white">{value}</Text>
  </View>
);

const FilterRow = ({
  options,
  selected,
  onSelect,
}: {
  options: Option[];
  selected: string;
  onSelect: (key: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    // bleed to the screen edges so chips scroll under the padding
    style={{ marginHorizontal: -16, marginBottom: 8 }}
    contentContainerStyle={{ paddingHorizontal: 16 }}
  >
    {options.map(o => {
      const on = o.key === selected;
      return (
        <Pressable
          key={o.key}
          onPress={() => onSelect(o.key)}
          accessibilityRole="button"
          accessibilityState={{ selected: on }}
          className={`mr-2 flex-row items-center rounded-full px-4 py-2 active:opacity-80 ${
            on ? 'bg-[#5D8736]' : 'bg-white dark:bg-slate-800'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              on ? 'text-white' : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {o.label}
          </Text>
          <Text
            className={`ml-1.5 text-xs font-bold ${
              on ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {o.count}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const Thumb = ({ item }: { item: WatchListItem }) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!item.image_url && !failed;

  return (
    <View className="h-16 w-16 overflow-hidden rounded-2xl bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
      {showImage ? (
        <Image
          source={{ uri: item.image_url! }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Icon name={typeIcon(item.type)} color={THEME} size={26} />
        </View>
      )}
    </View>
  );
};

const WatchCard = ({
  item,
  index,
  onPress,
}: {
  item: WatchListItem;
  index: number;
  onPress: () => void;
}) => {
  const tone = STATUS[item.status] ?? FALLBACK;
  const added = formatEventDate(item.created_at);
  const sightings = item.sightings_count ?? 0;

  return (
    <Enter index={index} skip={index > 6}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.identifier}`}
        className="mb-3 rounded-3xl bg-white active:opacity-80 dark:bg-slate-800"
        style={{
          shadowColor: THEME,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <View className="flex-row overflow-hidden rounded-3xl">
          {/* status color bar */}
          <View className={`w-1.5 ${tone.bar}`} />

          <View className="flex-1 p-4">
            <View className="flex-row items-center">
              <Thumb item={item} />

              <View className="ml-3 flex-1">
                <View className="flex-row items-start justify-between">
                  <Text
                    numberOfLines={1}
                    className="mr-2 flex-1 text-lg font-bold tracking-wide text-gray-900 dark:text-white"
                  >
                    {item.identifier}
                  </Text>
                  <View className={`rounded-full px-2.5 py-1 ${tone.pill}`}>
                    <Text className={`text-[11px] font-bold ${tone.text}`}>
                      {cap(item.status)}
                    </Text>
                  </View>
                </View>

                <View className="mt-1 flex-row items-center">
                  <Icon name={typeIcon(item.type)} tone="muted" size={13} />
                  <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {cap(item.type)}
                  </Text>
                </View>

                {item.details ? (
                  <Text
                    numberOfLines={2}
                    className="mt-1 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {item.details}
                  </Text>
                ) : null}
              </View>
            </View>

            {item.reason ? (
              <View className="mt-3 flex-row items-start rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                <View className="mt-0.5">
                  <Icon name="alert-triangle" color="#F59E0B" size={14} />
                </View>
                <Text
                  numberOfLines={2}
                  className="ml-2 flex-1 text-sm text-amber-900 dark:text-amber-200"
                >
                  {item.reason}
                </Text>
              </View>
            ) : null}

            <View className="mt-3 flex-row items-center justify-between">
              <View
                className={`flex-row items-center rounded-full px-3 py-1.5 ${
                  sightings > 0
                    ? 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25'
                    : 'bg-gray-100 dark:bg-slate-700'
                }`}
              >
                <Icon
                  name="eye"
                  tone={sightings > 0 ? 'lime' : 'muted'}
                  size={13}
                />
                <Text
                  className={`ml-1.5 text-xs font-semibold ${
                    sightings > 0
                      ? 'text-[#5D8736] dark:text-lime-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {sightings === 0
                    ? 'No sightings'
                    : `${sightings} ${
                        sightings === 1 ? 'sighting' : 'sightings'
                      }`}
                </Text>
              </View>

              <View className="flex-row items-center">
                {added ? (
                  <Text className="mr-1 text-xs text-gray-500 dark:text-gray-400">
                    Added {added}
                  </Text>
                ) : null}
                <Icon name="chevron-right" tone="muted" size={16} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Enter>
  );
};

const WatchList = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  // Shown as a bottom tab for residents (no back button needed) and as a
  // stack screen for tanods ('watchlists')
  const isStackScreen = route.name === 'watchlists';

  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState<SortKey>('new');
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['watch-lists'],
    queryFn: ({ pageParam }) =>
      getWatchLists({ base_url, token, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    enabled: !!token,
  });

  const items = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data]);
  const total = data?.pages[0]?.meta.total ?? 0;

  const activeCount = items.filter(i => i.status === 'active').length;
  const sightingsTotal = items.reduce(
    (n, i) => n + (i.sightings_count ?? 0),
    0,
  );

  const statusOptions = useMemo(
    () => buildOptions(items, i => i.status, cap),
    [items],
  );
  const typeOptions = useMemo(
    () => buildOptions(items, i => i.type, plural),
    [items],
  );

  // if a selected filter vanished after a refresh, fall back to All
  const activeStatus = statusOptions.some(o => o.key === status)
    ? status
    : 'all';
  const activeType = typeOptions.some(o => o.key === type) ? type : 'all';

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = items.filter(i => {
      if (activeStatus !== 'all' && i.status !== activeStatus) return false;
      if (activeType !== 'all' && i.type !== activeType) return false;
      if (!q) return true;
      return [i.identifier, i.details, i.reason, i.type]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));
    });

    return [...filtered].sort(
      sort === 'seen'
        ? (a, b) => (b.sightings_count ?? 0) - (a.sightings_count ?? 0)
        : (a, b) =>
            (new Date(b.created_at).getTime() || 0) -
            (new Date(a.created_at).getTime() || 0),
    );
  }, [items, activeStatus, activeType, sort, search]);

  const filtering =
    search.trim().length > 0 || activeStatus !== 'all' || activeType !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setType('all');
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="mt-16 items-center justify-center">
          <ActivityIndicator size="large" color={THEME} />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="mt-4 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
          <Icon name="alert-triangle" color="#F59E0B" size={32} />
          <Text className="mt-2 text-center text-base text-gray-700 dark:text-gray-200">
            Couldn't load the watch list. Check your connection and try again.
          </Text>
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
        </View>
      );
    }

    return (
      <View className="mt-4 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
          <Icon name="inbox" size={30} />
        </View>
        <Text className="mt-4 text-base font-semibold text-gray-800 dark:text-white">
          {filtering ? 'No matches' : 'The watch list is empty'}
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          {filtering
            ? 'Try a different search or filter.'
            : 'Pull down to refresh.'}
        </Text>
        {filtering ? (
          <Pressable
            onPress={clearFilters}
            className="mt-4 rounded-lg bg-[#5D8736] px-5 py-2.5 active:opacity-80"
          >
            <Text className="font-bold text-white">Clear filters</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const listHeader = (
    <View>
      {/* summary */}
      <Enter index={0}>
        <LinearGradient
          colors={['#A9C46C', '#5D8736']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, padding: 16, marginBottom: 14 }}
        >
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
              <Icon name="eye" color="#FFFFFF" size={28} strokeWidth={2.2} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-white">Keep watch</Text>
              <Text className="mt-0.5 text-sm text-white/85">
                People and vehicles the barangay is looking out for.
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row" style={{ gap: 10 }}>
            <HeroStat icon="users" label="Entries" value={String(total)} />
            <HeroStat
              icon="alert-triangle"
              label="Active"
              value={String(activeCount)}
            />
            <HeroStat
              icon="eye"
              label="Sightings"
              value={String(sightingsTotal)}
            />
          </View>
        </LinearGradient>
      </Enter>

      {items.length > 0 ? (
        <Enter index={1}>
          {/* search */}
          <View className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search plate, details or reason"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              className="flex-1 py-3 text-sm text-gray-900 dark:text-white"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Text className="text-sm font-semibold text-lime-700 dark:text-lime-400">
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* filters */}
          {statusOptions.length > 2 ? (
            <FilterRow
              options={statusOptions}
              selected={activeStatus}
              onSelect={setStatus}
            />
          ) : null}
          {typeOptions.length > 2 ? (
            <FilterRow
              options={typeOptions}
              selected={activeType}
              onSelect={setType}
            />
          ) : null}

          {/* count + sort */}
          <View className="mb-2 mt-1 flex-row items-center justify-between">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {visible.length} {visible.length === 1 ? 'entry' : 'entries'}
            </Text>
            <View className="flex-row rounded-full bg-gray-200 p-0.5 dark:bg-slate-800">
              {SORTS.map(s => {
                const on = sort === s.key;
                return (
                  <Pressable
                    key={s.key}
                    onPress={() => setSort(s.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    className={`rounded-full px-3 py-1.5 ${
                      on ? 'bg-white dark:bg-slate-600' : ''
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        on
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Enter>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* top bar */}
      <Enter from="top" className="flex-row items-center px-4 py-3">
        {isStackScreen ? (
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-800"
          >
            <Icon name="chevron-left" tone="neutral" size={22} />
          </Pressable>
        ) : null}
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Watch list
        </Text>
      </Enter>

      <FlatList
        data={visible}
        keyExtractor={i => String(i.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 110, // clears the floating tab bar
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={THEME}
            colors={[THEME]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color={THEME} />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
        renderItem={({ item, index }) => (
          <WatchCard
            item={item}
            index={index + 2}
            onPress={() =>
              navigation.navigate('watch_list_details', { id: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
};

export default WatchList;

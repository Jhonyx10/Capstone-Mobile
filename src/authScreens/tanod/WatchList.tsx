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
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppStore from '../../../store/useAppStore';
import { getWatchLists } from '../../../util/getWatchLists';
import { formatEventDate } from '../../../util/operationHelper';
import Icon from '../../components/Icon';
import Enter from '../../components/Enter';
import type { WatchListItem } from '../../types/WatchListType';
import type { RootStackParamList } from '../../Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// App theme color
const THEME = '#5D8736';

const STATUS_PILL: Record<string, { box: string; text: string }> = {
  active: {
    box: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
  },
  resolved: {
    box: 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25',
    text: 'text-[#5D8736] dark:text-lime-400',
  },
};
const PILL_FALLBACK = {
  box: 'bg-gray-100 dark:bg-slate-700',
  text: 'text-gray-600 dark:text-gray-300',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const StatusBadge = ({ status }: { status: string }) => {
  const tone = STATUS_PILL[status] ?? PILL_FALLBACK;
  return (
    <View className={`rounded-full px-2.5 py-1 ${tone.box}`}>
      <Text className={`text-[11px] font-bold ${tone.text}`}>
        {cap(status)}
      </Text>
    </View>
  );
};

const Thumb = ({ item }: { item: WatchListItem }) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!item.image_url && !failed;

  return (
    <View className="h-20 w-20 overflow-hidden rounded-2xl bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
      {showImage ? (
        <Image
          source={{ uri: item.image_url! }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Icon
            name={item.type === 'person' ? 'user' : 'shield'}
            color={THEME}
            size={28}
          />
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
  const added = formatEventDate(item.created_at);
  const sightings = item.sightings_count ?? 0;

  return (
    <Enter index={index} skip={index > 8}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.identifier}`}
        className="mb-3 flex-row rounded-3xl bg-white p-4 active:opacity-80 dark:bg-slate-800"
        style={{
          shadowColor: THEME,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <Thumb item={item} />

        <View className="ml-4 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-2 flex-1">
              <Text
                numberOfLines={1}
                className="text-lg font-bold tracking-wide text-gray-900 dark:text-white"
              >
                {item.identifier}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {cap(item.type)}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          {item.details ? (
            <Text
              numberOfLines={2}
              className="mt-1.5 text-sm text-gray-700 dark:text-gray-200"
            >
              {item.details}
            </Text>
          ) : null}

          {item.reason ? (
            <View className="mt-1.5 flex-row items-start">
              <View className="mt-0.5">
                <Icon name="alert-triangle" color="#F59E0B" size={14} />
              </View>
              <Text
                numberOfLines={2}
                className="ml-2 flex-1 text-sm text-gray-600 dark:text-gray-300"
              >
                {item.reason}
              </Text>
            </View>
          ) : null}

          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
            <View className="flex-row items-center">
              <Icon name="clock" tone="muted" size={14} />
              <Text className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {sightings === 0
                  ? 'No sightings yet'
                  : `${sightings} ${
                      sightings === 1 ? 'sighting' : 'sightings'
                    }`}
              </Text>
            </View>
            {added ? (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Added {added}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Enter>
  );
};

const WatchList = () => {
  const navigation = useNavigation<Nav>();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);
  const [status, setStatus] = useState<string>('all');
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

  const statuses = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => set.add(i.status));
    return ['all', ...Array.from(set)];
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i => {
      if (status !== 'all' && i.status !== status) return false;
      if (!q) return true;
      return [i.identifier, i.details, i.reason]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));
    });
  }, [items, status, search]);

  const Header = (
    <View className="border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <Enter from="top" className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-[#5D8736]/10 active:opacity-80 dark:bg-[#5D8736]/25"
        >
          <Icon name="chevron-left" color={THEME} size={22} />
        </Pressable>
        <View>
          <Text className="text-xl font-bold text-gray-800 dark:text-white">
            Watch list
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {total} {total === 1 ? 'entry' : 'entries'} in total
          </Text>
        </View>
      </Enter>

      {items.length > 0 && (
        <Enter index={1}>
          <View className="px-4 pb-3">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search plate, details or reason"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-900 dark:bg-slate-800 dark:text-white"
            />
          </View>

          {statuses.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 12,
              }}
            >
              {statuses.map(s => {
                const on = status === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    className={`mr-2 rounded-lg px-4 py-2 ${
                      on ? 'bg-[#5D8736]' : 'bg-gray-100 dark:bg-slate-800'
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        on ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {s === 'all' ? 'All' : cap(s)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Enter>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
        edges={['top']}
      >
        {Header}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
        edges={['top']}
      >
        {Header}
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="alert-triangle" color="#F59E0B" size={36} />
          <Text className="mt-3 text-center text-base text-gray-700 dark:text-gray-200">
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
      </SafeAreaView>
    );
  }

  const filtering = search.trim().length > 0 || status !== 'all';

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {Header}

      <FlatList
        data={visible}
        keyExtractor={i => String(i.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
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
        ListEmptyComponent={
          <Enter index={2} className="flex-1 items-center justify-center px-8">
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
            {filtering && (
              <Pressable
                onPress={() => {
                  setSearch('');
                  setStatus('all');
                }}
                className="mt-4 rounded-lg bg-[#5D8736] px-5 py-2.5 active:opacity-80"
              >
                <Text className="font-bold text-white">Clear filters</Text>
              </Pressable>
            )}
          </Enter>
        }
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

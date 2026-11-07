import { useMemo, useState, ReactElement } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import useNews from '../../hooks/useNews';
import { NewsItem } from '../../../util/newsApi';
import { timeAgo, isNew } from '../../../util/useHelper';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';

const THEME = '#5D8736';
const DEFAULT_CATEGORY = 'Incident';
const LONG_TEXT = 140; // longer summaries collapse to 3 lines with "Read more"

// Each category gets a stable color. Classes are written out in full so
// NativeWind can find them.
const PALETTE = [
  {
    chip: 'bg-lime-100 dark:bg-lime-900/40',
    text: 'text-lime-700 dark:text-lime-400',
    icon: '#65A30D',
  },
  {
    chip: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-700 dark:text-sky-400',
    icon: '#0284C7',
  },
  {
    chip: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
    icon: '#D97706',
  },
  {
    chip: 'bg-rose-100 dark:bg-rose-900/40',
    text: 'text-rose-700 dark:text-rose-400',
    icon: '#E11D48',
  },
  {
    chip: 'bg-violet-100 dark:bg-violet-900/40',
    text: 'text-violet-700 dark:text-violet-400',
    icon: '#7C3AED',
  },
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const lookFor = (category: string) => PALETTE[hash(category) % PALETTE.length];

const iconFor = (category: string): IconName => {
  if (/peace|order|police|crime|theft|robbery/i.test(category)) return 'shield';
  if (/fire|accident|disaster|emergency|flood/i.test(category)) {
    return 'alert-triangle';
  }
  return 'activity';
};

const NewsCard = ({ item, index }: { item: NewsItem; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const category = item.category ?? DEFAULT_CATEGORY;
  const look = lookFor(category);
  const summary = item.summary || 'No further details.';
  const long = summary.length > LONG_TEXT;
  const fresh = isNew(item.published_at);

  return (
    <Enter index={index} skip={index > 5}>
      <Pressable
        onPress={() => setExpanded(v => !v)}
        disabled={!long}
        accessibilityRole={long ? 'button' : undefined}
        accessibilityLabel={
          long ? `${category} news, tap to expand` : undefined
        }
        className="mb-3 flex-row rounded-2xl border border-gray-100 bg-white p-4 active:opacity-90 dark:border-slate-700 dark:bg-slate-800"
      >
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${look.chip}`}
        >
          <Icon name={iconFor(category)} color={look.icon} size={18} />
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <View className="mr-2 flex-1 flex-row items-center">
              <Text
                numberOfLines={1}
                className={`text-xs font-bold uppercase tracking-wide ${look.text}`}
              >
                {category}
              </Text>
              {fresh ? (
                <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5 dark:bg-red-900/30">
                  <Text className="text-[10px] font-bold text-red-700 dark:text-red-400">
                    New
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="text-xs text-[#5B5B5B] dark:text-gray-400">
              {timeAgo(item.published_at)}
            </Text>
          </View>

          <Text
            numberOfLines={expanded ? undefined : 3}
            className="mt-1.5 text-[15px] leading-5 text-[#333] dark:text-gray-100"
          >
            {summary}
          </Text>

          {long ? (
            <Text className="mt-1.5 text-xs font-semibold text-lime-700 dark:text-lime-400">
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Enter>
  );
};

interface FilterOption {
  key: string;
  label: string;
  count: number;
}

const FilterChips = ({
  options,
  selected,
  onSelect,
}: {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    // bleed to the screen edges so chips scroll under the padding
    style={{ marginHorizontal: -16, marginBottom: 12 }}
    contentContainerStyle={{ paddingHorizontal: 16 }}
  >
    {options.map(o => {
      const active = o.key === selected;
      return (
        <Pressable
          key={o.key}
          onPress={() => onSelect(o.key)}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          className={`mr-2 flex-row items-center rounded-full px-4 py-2 active:opacity-80 ${
            active ? 'bg-[#5D8736]' : 'bg-white dark:bg-slate-800'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              active ? 'text-white' : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {o.label}
          </Text>
          <Text
            className={`ml-1.5 text-xs font-bold ${
              active ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {o.count}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const NewsFeed = ({
  topInset = 0,
  header,
}: {
  topInset?: number;
  header?: ReactElement;
}) => {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNews();
  const [filter, setFilter] = useState('all');

  const items = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data]);

  const options = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();
    items.forEach(i => {
      const c = i.category ?? DEFAULT_CATEGORY;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    return [
      { key: 'all', label: 'All', count: items.length },
      ...Array.from(counts, ([key, count]) => ({ key, label: key, count })),
    ];
  }, [items]);

  // if the selected category vanished after a refresh, fall back to All
  const activeFilter = options.some(o => o.key === filter) ? filter : 'all';

  const visible =
    activeFilter === 'all'
      ? items
      : items.filter(i => (i.category ?? DEFAULT_CATEGORY) === activeFilter);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="mt-10 items-center justify-center">
          <ActivityIndicator color={THEME} />
        </View>
      );
    }

    if (isError) {
      const err: any = error;
      const detail = err?.response
        ? `HTTP ${err.response.status}: ${
            err.response.data?.message ?? 'no message'
          }`
        : `${err?.code ?? ''} ${err?.message ?? 'Unknown error'}`;

      return (
        <View className="mt-6 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
          <Icon name="alert-triangle" color="#F59E0B" size={30} />
          <Text className="mt-2 text-center text-base text-[#5B5B5B] dark:text-gray-300">
            Can't load the news.
          </Text>
          {__DEV__ && (
            <Text className="mt-1 text-center text-xs text-rose-500">
              {detail}
            </Text>
          )}
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

    // there is news, but none in the selected category
    if (items.length > 0) {
      return (
        <View className="mt-6 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
          <Text className="text-base font-semibold text-gray-800 dark:text-white">
            Nothing in {activeFilter} yet
          </Text>
          <Pressable
            onPress={() => setFilter('all')}
            className="mt-3 active:opacity-80"
          >
            <Text className="font-semibold text-lime-700 dark:text-lime-400">
              Show all news
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="mt-6 items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
        <Icon name="activity" tone="muted" size={28} />
        <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
          No news yet
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          New reports from your barangay will show up here.
        </Text>
      </View>
    );
  };

  const listHeader = (
    <View>
      {header}

      <View className="mb-3 mt-1 flex-row items-end justify-between">
        <Text className="text-lg font-bold text-[#2b2b2b] dark:text-white">
          Latest news
        </Text>
        {items.length > 0 ? (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {visible.length} {visible.length === 1 ? 'report' : 'reports'}
          </Text>
        ) : null}
      </View>

      {items.length > 0 ? (
        <FilterChips
          options={options}
          selected={activeFilter}
          onSelect={setFilter}
        />
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={visible}
      keyExtractor={item => String(item.id)}
      renderItem={({ item, index }) => <NewsCard item={item} index={index} />}
      ListHeaderComponent={listHeader}
      contentContainerStyle={{
        paddingTop: topInset,
        paddingHorizontal: 16,
        paddingBottom: 110, // clears the floating tab bar
      }}
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={() => refetch()}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={THEME} style={{ marginVertical: 16 }} />
        ) : null
      }
    />
  );
};

export default NewsFeed;

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useEffect, ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import useAppStore from '../../../store/useAppStore';
import { fetchNews, NewsItem } from '../../../util/newsApi';

// Hermes can lack Intl.RelativeTimeFormat, so this is done by hand
const timeAgo = (iso: string) => {
  const mins = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (mins < 1) return 'Ngayon lang';
  if (mins < 60) return `${mins} min ang nakalipas`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} oras ang nakalipas`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} araw ang nakalipas`;
  return new Date(iso).toLocaleDateString();
};

const NewsCard = ({ item }: { item: NewsItem }) => (
  <View className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800">
    <View className="mb-2 flex-row items-center justify-between">
      <View className="rounded-full bg-lime-100 px-3 py-1 dark:bg-lime-900/40">
        <Text className="text-xs font-semibold text-lime-700 dark:text-lime-400">
          {item.category ?? 'Incident'}
        </Text>
      </View>
      <Text className="text-xs text-[#5B5B5B] dark:text-gray-400">
        {timeAgo(item.published_at)}
      </Text>
    </View>
    <Text className="text-base text-[#333] dark:text-gray-100">
      {item.summary || 'No further details.'}
    </Text>
  </View>
);

const NewsFeed = ({
  topInset = 0,
  header,
}: {
  topInset?: number;
  header?: ReactElement;
}) => {
  const base_url = useAppStore(state => state.base_url);
  const token = useAppStore(state => state.token);

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
  } = useInfiniteQuery({
    queryKey: ['news'],
    queryFn: ({ pageParam }) => fetchNews({ base_url, token, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
    retry: 1, // default is 3, which keeps the spinner up for a long time
  });

  const items = data?.pages.flatMap(p => p.data) ?? [];

  useEffect(() => {
    if (!__DEV__) return;
    console.log('[NEWS] mounted, state:', {
      base_url,
      hasToken: !!token,
      isLoading,
      isError,
      items: items.length,
    });
  }, [base_url, token, isLoading, isError, items.length]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="mt-16 items-center justify-center">
          <ActivityIndicator color="#5D8736" />
        </View>
      );
    }

    if (isError) {
      const err: any = error;
      const detail = err?.response
        ? `HTTP ${err.response.status}: ${
            err.response.data?.message ?? 'walang message'
          }`
        : `${err?.code ?? ''} ${err?.message ?? 'Unknown error'}`;

      return (
        <View className="mt-16 items-center justify-center px-8">
          <Text className="mb-2 text-center text-[#5B5B5B] dark:text-gray-300">
            Can't load news
          </Text>
          {__DEV__ && (
            <Text className="mb-3 text-center text-xs text-rose-500">
              {detail}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-lg border border-lime-700 px-5 py-2"
          >
            <Text className="font-semibold text-lime-700 dark:text-lime-500">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Text className="mt-16 text-center text-[#5B5B5B] dark:text-gray-300">
        Wala pang balita sa ngayon.
      </Text>
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <NewsCard item={item} />}
      ListHeaderComponent={header}
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
          <ActivityIndicator color="#5D8736" style={{ marginVertical: 16 }} />
        ) : null
      }
    />
  );
};

export default NewsFeed;

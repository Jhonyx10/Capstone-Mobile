import { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppStore from '../../../store/useAppStore';
import { getOperations } from '../../../util/getOperations';
import {
  formatEventDate,
  countdownLabel,
  STATUS_STYLES,
} from '../../../util/operationHelper';
import StatusPill from '../../components/StatusPill';
import Icon from '../../components/Icon';
import Enter from '../../components/Enter';
import type { Operation, OperationStatus } from '../../types/OperationType';
import type { RootStackParamList } from '../../Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | OperationStatus;

const ACCENT: Record<OperationStatus, string> = {
  upcoming: 'bg-blue-500',
  active: 'bg-lime-500',
  completed: 'bg-gray-400',
  suspended: 'bg-amber-500',
};

const MetaRow = ({
  icon,
  text,
}: {
  icon: 'calendar' | 'map-pin' | 'layers';
  text: string;
}) => (
  <View className="mt-1.5 flex-row items-center">
    <Icon name={icon} tone="muted" size={14} />
    <Text className="ml-2 text-sm text-gray-600 dark:text-gray-300">
      {text}
    </Text>
  </View>
);

const OperationCard = ({
  item,
  index,
  onPress,
}: {
  item: Operation;
  index: number;
  onPress: () => void;
}) => {
  const date = formatEventDate(item.event_date);
  const countdown =
    item.status === 'upcoming' ? countdownLabel(item.event_date) : null;
  const areas = item.areas_count ?? 0;

  return (
    // rows that mount later while scrolling skip the entrance
    <Enter index={index} skip={index > 8}>
      <Pressable
        onPress={onPress}
        className="mb-3 flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
      >
        <View className={`w-1.5 ${ACCENT[item.status] ?? 'bg-gray-400'}`} />
        <View className="flex-1 p-4">
          <View className="flex-row items-start justify-between">
            <Text className="mr-3 flex-1 text-lg font-bold text-gray-900 dark:text-white">
              {item.name}
            </Text>
            <StatusPill status={item.status} />
          </View>

          <View className="mt-1 flex-row items-center">
            <Icon name="calendar" tone="muted" size={14} />
            <Text className="ml-2 text-sm text-gray-600 dark:text-gray-300">
              {date ?? 'Date not set'}
            </Text>
            {countdown ? (
              <View className="ml-2 rounded-full bg-lime-100 px-2 py-0.5 dark:bg-lime-900/40">
                <Text className="text-[11px] font-semibold text-lime-700 dark:text-lime-400">
                  {countdown}
                </Text>
              </View>
            ) : null}
          </View>

          <MetaRow
            icon="map-pin"
            text={item.zone?.zone_name ?? 'No zone assigned'}
          />

          <View className="mt-1.5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="layers" tone="muted" size={14} />
              <Text className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                {areas} {areas === 1 ? 'area' : 'areas'}
              </Text>
            </View>
            <Icon name="chevron-right" tone="muted" size={20} />
          </View>
        </View>
      </Pressable>
    </Enter>
  );
};

const OperationScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);
  const [filter, setFilter] = useState<Filter>('all');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['operations'],
    queryFn: () => getOperations({ base_url, token }),
    enabled: !!token,
  });

  const operations = data?.data ?? [];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: operations.length };
    operations.forEach(o => {
      c[o.status] = (c[o.status] ?? 0) + 1;
    });
    return c;
  }, [operations]);

  const visible = useMemo(
    () =>
      filter === 'all'
        ? operations
        : operations.filter(o => o.status === filter),
    [operations, filter],
  );

  const chips = (
    ['all', 'upcoming', 'active', 'completed', 'suspended'] as Filter[]
  ).filter(f => f === 'all' || (counts[f] ?? 0) > 0);

  const Header = (
    <Enter from="top" index={0}>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-800"
        >
          <Icon name="chevron-left" tone="neutral" size={22} />
        </Pressable>
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Operations
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {operations.length}{' '}
            {operations.length === 1 ? 'operation' : 'operations'}
          </Text>
        </View>
      </View>
    </Enter>
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        style={{ paddingTop: insets.top }}
      >
        {Header}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        style={{ paddingTop: insets.top }}
      >
        {Header}
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="alert-triangle" color="#F59E0B" size={36} />
          <Text className="mt-3 text-center text-base text-gray-700 dark:text-gray-200">
            Couldn't load operations. Check your connection and try again.
          </Text>
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
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      style={{ paddingTop: insets.top }}
    >
      {Header}

      {operations.length > 0 && (
        <Enter index={1}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          >
            {chips.map(f => {
              const on = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  className={`mr-2 rounded-full px-4 py-2 ${
                    on
                      ? 'bg-[#5D8736]'
                      : 'border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      on ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : STATUS_STYLES[f].label}{' '}
                    {counts[f] ?? 0}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Enter>
      )}

      <FlatList
        data={visible}
        keyExtractor={o => String(o.id)}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 4,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <Enter index={2} className="flex-1 items-center justify-center px-8">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
              <Icon name="inbox" size={30} />
            </View>
            <Text className="mt-4 text-base font-semibold text-gray-800 dark:text-white">
              {filter === 'all'
                ? 'No operations yet'
                : `No ${STATUS_STYLES[filter].label.toLowerCase()} operations`}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              Pull down to refresh.
            </Text>
          </Enter>
        }
        renderItem={({ item, index }) => (
          <OperationCard
            item={item}
            index={index + 2}
            onPress={() =>
              navigation.navigate('operation_details', { id: item.id })
            }
          />
        )}
      />
    </View>
  );
};

export default OperationScreen;

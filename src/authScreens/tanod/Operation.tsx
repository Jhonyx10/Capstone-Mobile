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
import { SafeAreaView } from 'react-native-safe-area-context';
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

// App theme color
const THEME = '#5D8736';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Date tile colors per status: theme green for live/upcoming work,
// neutral for finished, amber for suspended.
const TILE: Record<OperationStatus, { box: string; text: string }> = {
  upcoming: {
    box: 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25',
    text: 'text-[#5D8736] dark:text-lime-400',
  },
  active: {
    box: 'bg-[#5D8736]',
    text: 'text-white',
  },
  completed: {
    box: 'bg-gray-100 dark:bg-slate-700',
    text: 'text-gray-500 dark:text-gray-300',
  },
  suspended: {
    box: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
};

const getDateParts = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return { month: MONTHS[d.getMonth()], day: d.getDate() };
};

const DateTile = ({ item }: { item: Operation }) => {
  const parts = getDateParts(item.event_date);
  const tone = TILE[item.status] ?? TILE.completed;

  return (
    <View
      className={`h-16 w-16 items-center justify-center rounded-2xl ${tone.box}`}
    >
      {parts ? (
        <>
          <Text className={`text-xs font-semibold ${tone.text}`}>
            {parts.month}
          </Text>
          <Text className={`text-2xl font-bold leading-7 ${tone.text}`}>
            {parts.day}
          </Text>
        </>
      ) : (
        <Icon name="calendar" tone="muted" size={22} />
      )}
    </View>
  );
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
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}`}
        className="mb-3 flex-row rounded-3xl bg-white p-4 active:opacity-80 dark:bg-slate-800"
        style={{
          shadowColor: THEME,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <DateTile item={item} />

        <View className="ml-4 flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              numberOfLines={2}
              className="mr-2 flex-1 text-base font-bold text-gray-900 dark:text-white"
            >
              {item.name}
            </Text>
            <StatusPill status={item.status} />
          </View>

          <MetaRow icon="calendar" text={date ?? 'Date not set'} />
          <MetaRow
            icon="map-pin"
            text={item.zone?.zone_name ?? 'No zone assigned'}
          />

          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
            <View className="flex-row items-center">
              <Icon name="layers" tone="muted" size={14} />
              <Text className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {areas} {areas === 1 ? 'area' : 'areas'}
              </Text>
            </View>

            <View className="flex-row items-center">
              {countdown ? (
                <Text className="mr-1 text-xs font-semibold text-[#5D8736] dark:text-lime-400">
                  {countdown}
                </Text>
              ) : null}
              <Icon name="chevron-right" tone="muted" size={18} />
            </View>
          </View>
        </View>
      </Pressable>
    </Enter>
  );
};

const OperationScreen = () => {
  const navigation = useNavigation<Nav>();
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

  // Top bar follows the ReportScreen header: white bar, bottom border,
  // title + count on the left. The filters sit inside the same bar.
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
            Operations
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {operations.length}{' '}
            {operations.length === 1 ? 'operation' : 'operations'} in total
          </Text>
        </View>
      </Enter>

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
                    {f === 'all' ? 'All' : STATUS_STYLES[f].label}{' '}
                    {counts[f] ?? 0}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
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
            Couldn't load operations. Check your connection and try again.
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

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {Header}

      <FlatList
        data={visible}
        keyExtractor={o => String(o.id)}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={THEME}
            colors={[THEME]}
          />
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
    </SafeAreaView>
  );
};

export default OperationScreen;

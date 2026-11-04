import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import useAppStore from '../../../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../../../util/getReport';
import { Report } from '../../types/ReportType';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import Enter from '../Enter';

type ReportDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'report'
>;

const GREEN = '#5D8736';

// only the first rows play the entrance; rows that mount while scrolling don't
const ANIMATED_ROWS = 10;

const formatDate = (d?: string | null) => {
  if (!d) return null;
  const date = new Date(`${d.slice(0, 10)}T00:00:00`);
  return isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

const formatTime = (t?: string | null) => {
  if (!t) return null;
  const date = new Date(`1970-01-01T${t}`);
  return isNaN(date.getTime())
    ? null
    : date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
};

const ReportCard = () => {
  const { base_url, token } = useAppStore();
  const setReport = useAppStore(state => state.setReport);
  const navigation = useNavigation<ReportDetailsNavigationProp>();

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: () => getReports({ base_url, token }),
  });

  useEffect(() => {
    if (data) {
      setReport(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={GREEN} />
        <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Fetching reports...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <Enter className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl">⚠️</Text>
        <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
          Couldn't load reports
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          Check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          activeOpacity={0.8}
          className="mt-4 rounded-lg bg-lime-600 px-5 py-2.5"
        >
          <Text className="text-sm font-bold text-white">Try again</Text>
        </TouchableOpacity>
      </Enter>
    );
  }

  const renderReport = ({ item, index }: { item: Report; index: number }) => {
    const date = formatDate(item?.date);
    const time = formatTime(item?.time);
    const zone = item?.location?.zone?.zone_name || 'Unknown zone';
    const place = item?.location?.location_name;

    return (
      <Enter index={index} skip={index >= ANIMATED_ROWS}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('report_details', { id: item.id })}
          className="mb-3 overflow-hidden rounded-xl border-l-4 border-lime-600 bg-white p-4 dark:bg-slate-800"
          style={{ elevation: 2 }}
        >
          {/* Category + date */}
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-lime-100 px-2.5 py-1 dark:bg-lime-900/40">
              <Text className="text-[11px] font-bold text-lime-700 dark:text-lime-400">
                {item?.incident_type?.category?.category_name ||
                  'Unknown category'}
              </Text>
            </View>
            <Text className="text-[11px] text-gray-500 dark:text-gray-400">
              {[date, time].filter(Boolean).join(' · ') || 'No date'}
            </Text>
          </View>

          {/* Incident name */}
          <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
            {item?.incident_type?.incident_name || 'Unknown incident'}
          </Text>

          {/* Location */}
          <Text className="mt-1 text-[13px] text-gray-600 dark:text-gray-300">
            📍 {zone}
            {place ? `, ${place}` : ''}
          </Text>

          <Text className="mt-3 text-right text-xs font-semibold text-lime-600">
            View details ›
          </Text>
        </TouchableOpacity>
      </Enter>
    );
  };

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={item => item.id.toString()}
      renderItem={renderReport}
      // bottom padding keeps the last card clear of the floating tab bar
      contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[GREEN]}
          tintColor={GREEN}
        />
      }
      ListEmptyComponent={
        <Enter className="items-center px-6 pt-20">
          <Text className="text-4xl">📝</Text>
          <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
            No reports yet
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            Tap "+ File Report" to add the first one.
          </Text>
        </Enter>
      }
    />
  );
};

export default ReportCard;

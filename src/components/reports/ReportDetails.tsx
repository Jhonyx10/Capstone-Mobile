import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import useAppStore from '../../../store/useAppStore';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation';
import { Report } from '../../types/ReportType';
import { getReportDetails } from '../../../util/getReportDetails';
import ReportViolators from './ReportViolatorsDetails';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';

type ReportDetailsRouteProp = RouteProp<RootStackParamList, 'report_details'>;

const GREEN = '#5D8736';

const formatDate = (d?: string | null) => {
  if (!d) return null;
  const date = new Date(`${d.slice(0, 10)}T00:00:00`);
  return isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-US', {
        month: 'long',
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

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) => (
  <View className="mt-3 flex-row items-start">
    <View className="mr-3 w-6 items-center pt-0.5">
      <Icon name={icon} tone="lime" size={18} />
    </View>
    <View className="flex-1">
      <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </Text>
      <Text className="text-[15px] text-gray-800 dark:text-white">{value}</Text>
    </View>
  </View>
);

const ReportDetails = () => {
  const { base_url, token, reports } = useAppStore();
  const route = useRoute<ReportDetailsRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const { data, isLoading, isError, isRefetching, refetch } =
    useQuery<Report | null>({
      queryKey: ['report_details', id],
      queryFn: () => getReportDetails({ base_url, token, report_id: id }),
      // show the list's copy right away while the full report loads
      placeholderData: () => reports.find(report => report.id === id),
    });

  const details = data;

  const date = formatDate(details?.date);
  const time = formatTime(details?.time);
  const zone = details?.location?.zone?.zone_name;
  const place = details?.location?.location_name;
  const location = [zone, place].filter(Boolean).join(', ');
  // the API turns the stored path into a full URL
  const landmark = (details?.location as any)?.landmark as string | undefined;
  // the API includes the reporting user
  const filedBy = (details as any)?.user?.name as string | undefined;

  const renderBody = () => {
    if (isLoading) {
      return (
        <View className="items-center pt-24">
          <ActivityIndicator size="large" color={GREEN} />
          <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Loading report...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <Enter className="items-center rounded-xl bg-white p-8 dark:bg-slate-800">
          <Text className="text-base font-semibold text-gray-800 dark:text-white">
            Couldn't load this report
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

    if (!details) {
      return (
        <Enter className="items-center rounded-xl bg-white p-8 dark:bg-slate-800">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
            <Icon name="search" tone="lime" size={28} />
          </View>
          <Text className="mt-3 text-base font-semibold text-gray-800 dark:text-white">
            Report not found
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            It may have been removed. Go back and pull down to refresh.
          </Text>
        </Enter>
      );
    }

    return (
      <>
        {/* Summary */}
        <Enter
          index={0}
          className="mb-3 rounded-xl border-l-4 border-lime-600 bg-white p-4 dark:bg-slate-800"
        >
          <View className="self-start rounded-full bg-lime-100 px-2.5 py-1 dark:bg-lime-900/40">
            <Text className="text-[11px] font-bold text-lime-700 dark:text-lime-400">
              {details.incident_type?.category?.category_name ||
                'Unknown category'}
            </Text>
          </View>
          <Text className="mt-2 text-xl font-bold text-gray-800 dark:text-white">
            {details.incident_type?.incident_name || 'Unknown incident'}
          </Text>

          <InfoRow icon="calendar" label="Date" value={date ?? 'No date'} />
          <InfoRow icon="clock" label="Time" value={time ?? 'No time'} />
          <InfoRow
            icon="map-pin"
            label="Location"
            value={location || 'Unknown location'}
          />
          <InfoRow icon="user" label="Filed by" value={filedBy ?? 'Unknown'} />

          {landmark ? (
            <Image
              source={{ uri: landmark }}
              className="mt-3 h-40 w-full rounded-xl bg-gray-200"
              resizeMode="cover"
            />
          ) : null}
        </Enter>

        {/* Description */}
        <Enter
          index={1}
          className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <Text className="mb-1 text-[15px] font-bold text-gray-800 dark:text-white">
            Description
          </Text>
          <Text className="text-[15px] leading-6 text-gray-700 dark:text-gray-300">
            {details.report_description || 'No description provided.'}
          </Text>
        </Enter>

        {/* Violators */}
        <Enter
          index={2}
          className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <ReportViolators id={id} />
        </Enter>

        {/* Evidence */}
        <Enter index={3} className="rounded-xl bg-white p-4 dark:bg-slate-800">
          <Text className="mb-3 text-[15px] font-bold text-gray-800 dark:text-white">
            Evidence
          </Text>
          {details.evidences && details.evidences.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {details.evidences.map(evidence => (
                <View key={evidence.id} className="w-24">
                  <Image
                    source={{ uri: evidence.file_url }}
                    className="h-24 w-24 rounded-xl bg-gray-200"
                  />
                  {evidence.remarks ? (
                    <Text className="mt-1 text-center text-[11px] text-gray-600 dark:text-gray-300">
                      {evidence.remarks}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              No evidence photos.
            </Text>
          )}
        </Enter>
      </>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <Enter
        from="top"
        className="flex-row items-center border-b border-gray-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700"
        >
          <Icon name="chevron-left" tone="neutral" size={20} />
        </TouchableOpacity>
        <Text className="ml-3 text-xl font-bold text-gray-800 dark:text-white">
          Report details
        </Text>
      </Enter>

      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      >
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
};
export default ReportDetails;

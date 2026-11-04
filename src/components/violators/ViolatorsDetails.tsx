import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { violatorsDetails } from '../../../util/getViolatorsDetails';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation';
import useAppStore from '../../../store/useAppStore';
import { Report } from '../../types/ReportType';
import Icon from '../Icon';
import Enter from '../Enter';

type ViolatorsDetailsRouteProp = RouteProp<
  RootStackParamList,
  'violators_details'
>;

const GREEN = '#5D8736';

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

const Header = ({ onBack }: { onBack: () => void }) => (
  <Enter
    from="top"
    className="flex-row items-center border-b border-gray-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900"
  >
    <TouchableOpacity
      onPress={onBack}
      activeOpacity={0.7}
      className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700"
    >
      <Icon name="chevron-left" tone="neutral" size={20} />
    </TouchableOpacity>
    <Text className="ml-3 text-xl font-bold text-gray-800 dark:text-white">
      Violator profile
    </Text>
  </Enter>
);

const ViolatorsDetails = () => {
  const { base_url, token } = useAppStore();
  const route = useRoute<ViolatorsDetailsRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['violators_details', id],
    queryFn: () => violatorsDetails({ base_url, token, violators_id: id }),
  });

  const shell = (children: React.ReactNode) => (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      <Header onBack={() => navigation.goBack()} />
      {children}
    </SafeAreaView>
  );

  if (isLoading) {
    return shell(
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={GREEN} />
        <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Loading profile...
        </Text>
      </View>,
    );
  }

  if (isError || !data) {
    return shell(
      <Enter className="flex-1 items-center justify-center px-6">
        <Text className="text-base font-semibold text-gray-800 dark:text-white">
          Couldn't load this profile
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
      </Enter>,
    );
  }

  const fullName =
    [data.last_name, data.first_name].filter(Boolean).join(', ') ||
    'Unnamed violator';
  const reports: Report[] = data.reports ?? [];

  return shell(
    <ScrollView
      contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <Enter
        index={0}
        className="mb-4 items-center rounded-xl border-t-4 border-lime-600 bg-white p-5 dark:bg-slate-800"
      >
        {data.photo ? (
          <Image
            source={{ uri: data.photo }}
            className="h-28 w-28 rounded-full bg-gray-200"
          />
        ) : (
          <View className="h-28 w-28 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
            <Text className="text-3xl font-bold text-lime-700 dark:text-lime-400">
              {(data.first_name?.[0] ?? '?').toUpperCase()}
              {(data.last_name?.[0] ?? '').toUpperCase()}
            </Text>
          </View>
        )}

        <Text className="mt-3 text-center text-xl font-bold text-gray-800 dark:text-white">
          {fullName}
        </Text>

        <View className="mt-2 flex-row flex-wrap justify-center gap-2">
          <View className="rounded-full bg-lime-100 px-3 py-1 dark:bg-lime-900/40">
            <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
              Age {data.age ?? '—'}
            </Text>
          </View>
          <View className="rounded-full bg-lime-100 px-3 py-1 dark:bg-lime-900/40">
            <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
              {data.zone?.zone_name ?? 'No zone'}
            </Text>
          </View>
        </View>

        <View className="mt-4 w-full flex-row items-start border-t border-gray-100 pt-4 dark:border-slate-700">
          <View className="mr-3 pt-0.5">
            <Icon name="map-pin" tone="lime" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Address
            </Text>
            <Text className="text-[15px] text-gray-800 dark:text-white">
              {data.address || 'No address on file'}
            </Text>
          </View>
        </View>
      </Enter>

      {/* Records */}
      <Enter
        index={1}
        className="mb-2 flex-row items-center justify-between px-1"
      >
        <Text className="text-[15px] font-bold text-gray-800 dark:text-white">
          Violation records
        </Text>
        <View className="rounded-full bg-lime-100 px-2.5 py-0.5 dark:bg-lime-900/40">
          <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
            {reports.length}
          </Text>
        </View>
      </Enter>

      {reports.length > 0 ? (
        reports.map((report: Report, i: number) => {
          const date = formatDate(report.date);
          const time = formatTime(report.time);

          return (
            <Enter
              key={report.id}
              index={i + 2}
              className="mb-3 rounded-xl border-l-4 border-lime-600 bg-white p-4 dark:bg-slate-800"
              style={{ elevation: 2 }}
            >
              <Text className="text-base font-bold text-gray-800 dark:text-white">
                Report #{report.id}
              </Text>
              <Text
                className="mt-1 text-sm text-gray-600 dark:text-gray-300"
                numberOfLines={3}
              >
                {report.report_description || 'No description provided.'}
              </Text>

              <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1">
                <View className="flex-row items-center">
                  <Icon name="calendar" tone="muted" size={14} />
                  <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {date ?? 'No date'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Icon name="clock" tone="muted" size={14} />
                  <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {time ?? 'No time'}
                  </Text>
                </View>
              </View>
            </Enter>
          );
        })
      ) : (
        <Enter
          index={2}
          className="items-center rounded-xl bg-white p-8 dark:bg-slate-800"
        >
          <Image
            source={require('../../assets/img/Barangay.png')}
            className="h-16 w-16"
            resizeMode="contain"
          />
          <Text className="mt-3 text-base font-semibold text-gray-800 dark:text-white">
            No records found
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            This person has no violation reports yet.
          </Text>
        </Enter>
      )}
    </ScrollView>,
  );
};

export default ViolatorsDetails;

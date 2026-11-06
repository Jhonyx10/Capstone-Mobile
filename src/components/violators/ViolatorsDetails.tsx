import { useState } from 'react';
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

const getDateParts = (d?: string | null) => {
  if (!d) return null;
  const date = new Date(`${d.slice(0, 10)}T00:00:00`);
  if (isNaN(date.getTime())) return null;
  return {
    month: MONTHS[date.getMonth()],
    day: date.getDate(),
    year: date.getFullYear(),
  };
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
    className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
  >
    <TouchableOpacity
      onPress={onBack}
      activeOpacity={0.7}
      accessibilityLabel="Go back"
      className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-[#5D8736]/10 dark:bg-[#5D8736]/25"
    >
      <Icon name="chevron-left" color={GREEN} size={22} />
    </TouchableOpacity>
    <Text className="text-xl font-bold text-gray-800 dark:text-white">
      Violator profile
    </Text>
  </Enter>
);

// Rounded square, not a circle. Falls back to initials if there is no photo
// or it fails to load.
const Photo = ({
  uri,
  initials,
}: {
  uri?: string | null;
  initials: string;
}) => {
  const [failed, setFailed] = useState(false);
  const show = !!uri && !failed;

  return (
    <View className="h-36 w-28 overflow-hidden rounded-2xl bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
      {show ? (
        <Image
          source={{ uri: uri! }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-3xl font-bold text-[#5D8736] dark:text-lime-400">
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const Chip = ({ text }: { text: string }) => (
  <View className="mb-1.5 mr-2 rounded-lg bg-[#5D8736]/10 px-3 py-1 dark:bg-[#5D8736]/25">
    <Text className="text-xs font-bold text-[#5D8736] dark:text-lime-400">
      {text}
    </Text>
  </View>
);

const RecordCard = ({ report, index }: { report: Report; index: number }) => {
  const parts = getDateParts(report.date);
  const time = formatTime(report.time);

  return (
    <Enter
      index={index}
      className="mb-3 flex-row rounded-3xl bg-white p-4 dark:bg-slate-800"
      style={{
        shadowColor: GREEN,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
        {parts ? (
          <>
            <Text className="text-xs font-semibold text-[#5D8736] dark:text-lime-400">
              {parts.month}
            </Text>
            <Text className="text-2xl font-bold leading-7 text-[#5D8736] dark:text-lime-400">
              {parts.day}
            </Text>
          </>
        ) : (
          <Icon name="calendar" tone="muted" size={22} />
        )}
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-gray-900 dark:text-white">
          Report #{report.id}
        </Text>
        <Text
          className="mt-1 text-sm text-gray-600 dark:text-gray-300"
          numberOfLines={3}
        >
          {report.report_description || 'No description provided.'}
        </Text>

        <View className="mt-3 flex-row flex-wrap items-center border-t border-gray-100 pt-3 dark:border-slate-700">
          <View className="mr-4 flex-row items-center">
            <Icon name="calendar" tone="muted" size={14} />
            <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
              {parts ? `${parts.month} ${parts.day}, ${parts.year}` : 'No date'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="clock" tone="muted" size={14} />
            <Text className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
              {time ?? 'No time'}
            </Text>
          </View>
        </View>
      </View>
    </Enter>
  );
};

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
          Loading profile
        </Text>
      </View>,
    );
  }

  if (isError || !data) {
    return shell(
      <Enter className="flex-1 items-center justify-center px-6">
        <Icon name="alert-triangle" color="#F59E0B" size={36} />
        <Text className="mt-3 text-base font-semibold text-gray-800 dark:text-white">
          Couldn't load this profile
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          Check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          activeOpacity={0.8}
          className="mt-4 rounded-lg bg-[#5D8736] px-5 py-2.5"
        >
          <Text className="text-sm font-bold text-white">Try again</Text>
        </TouchableOpacity>
      </Enter>,
    );
  }

  const fullName =
    [data.last_name, data.first_name].filter(Boolean).join(', ') ||
    'Unnamed violator';
  const initials = `${(data.first_name?.[0] ?? '?').toUpperCase()}${(
    data.last_name?.[0] ?? ''
  ).toUpperCase()}`;
  const reports: Report[] = data.reports ?? [];

  return shell(
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile: photo on the left, details beside it */}
      <Enter
        index={0}
        className="mb-5 rounded-3xl bg-white p-4 dark:bg-slate-800"
        style={{
          shadowColor: GREEN,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <View className="flex-row">
          <Photo uri={data.photo} initials={initials} />

          <View className="ml-4 flex-1 justify-between">
            <View>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {fullName}
              </Text>
              <View className="mt-2 flex-row flex-wrap">
                <Chip text={`Age ${data.age ?? '—'}`} />
                <Chip text={data.zone?.zone_name ?? 'No zone'} />
              </View>
            </View>

            <View className="flex-row items-end">
              <Text className="text-3xl font-bold text-[#5D8736] dark:text-lime-400">
                {reports.length}
              </Text>
              <Text className="mb-1 ml-1.5 text-sm text-gray-500 dark:text-gray-400">
                {reports.length === 1
                  ? 'violation record'
                  : 'violation records'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row items-start border-t border-gray-100 pt-4 dark:border-slate-700">
          <View className="mr-3 pt-0.5">
            <Icon name="map-pin" color={GREEN} size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
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
        className="mb-3 flex-row items-center justify-between px-1"
      >
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Violation records
        </Text>
        <View className="rounded-lg bg-[#5D8736] px-2.5 py-0.5">
          <Text className="text-xs font-bold text-white">{reports.length}</Text>
        </View>
      </Enter>

      {reports.length > 0 ? (
        reports.map((report: Report, i: number) => (
          <RecordCard key={report.id} report={report} index={i + 2} />
        ))
      ) : (
        <Enter
          index={2}
          className="items-center rounded-3xl bg-white p-8 dark:bg-slate-800"
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

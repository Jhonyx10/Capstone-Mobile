import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { violatorsDetails } from '../../../util/getViolatorsDetails';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import useAppStore from '../../../store/useAppStore';
import { Report } from '../../types/ReportType';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';

type ViolatorsDetailsRouteProp = RouteProp<
  RootStackParamList,
  'violators_details'
>;

const GREEN = '#5D8736';
const COLLAPSED_COUNT = 5; // records shown before "Show more"

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

const fullDate = (d?: string | null) => {
  const p = getDateParts(d);
  return p ? `${p.month} ${p.day}, ${p.year}` : '—';
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

// YYYY-MM-DD plus HH:MM:SS sorts correctly as plain text
const stamp = (r: Report) =>
  `${String(r.date ?? '').slice(0, 10)}${String(r.time ?? '')}`;

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel="Go back"
    className="h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-800"
  >
    <Icon name="chevron-left" tone="neutral" size={22} />
  </Pressable>
);

const HeroChip = ({ icon, text }: { icon: IconName; text: string }) => (
  <View
    className="flex-row items-center rounded-full bg-white/20 px-3 py-1.5"
    style={{ maxWidth: '100%' }}
  >
    <Icon name={icon} size={14} color="#FFFFFF" />
    <Text
      className="ml-1.5 text-xs font-semibold text-white"
      style={{ flexShrink: 1 }}
    >
      {text}
    </Text>
  </View>
);

const StatTile = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
      <Icon name={icon} color={GREEN} size={15} />
    </View>
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.8}
      className="mt-2 text-base font-bold text-gray-900 dark:text-white"
    >
      {value}
    </Text>
    <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
  </View>
);

const RecordCard = ({
  report,
  index,
  onPress,
}: {
  report: Report;
  index: number;
  onPress: () => void;
}) => {
  const parts = getDateParts(report.date);
  const time = formatTime(report.time);

  return (
    <Enter index={index} skip={index > 8}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open report ${report.id}`}
        className="mb-3 flex-row rounded-3xl bg-white p-4 active:opacity-80 dark:bg-slate-800"
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
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Report #{report.id}
            </Text>
            <Icon name="chevron-right" tone="muted" size={18} />
          </View>
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
                {parts
                  ? `${parts.month} ${parts.day}, ${parts.year}`
                  : 'No date'}
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
      </Pressable>
    </Enter>
  );
};

const ViolatorsDetails = () => {
  const { base_url, token } = useAppStore();
  const route = useRoute<ViolatorsDetailsRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { id } = route.params;
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['violators_details', id],
    queryFn: () => violatorsDetails({ base_url, token, violators_id: id }),
  });

  // newest first
  const reports: Report[] = useMemo(
    () =>
      [...(data?.reports ?? [])].sort((a, b) =>
        stamp(b).localeCompare(stamp(a)),
      ),
    [data?.reports],
  );

  const shell = (children: React.ReactNode) => (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Top bar */}
      <Enter from="top" className="flex-row items-center px-4 py-3">
        <BackButton onPress={() => navigation.goBack()} />
        <Text className="ml-3 text-base font-semibold text-gray-600 dark:text-gray-300">
          Violator profile
        </Text>
      </Enter>
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
        <Pressable
          onPress={() => refetch()}
          className="mt-4 flex-row items-center rounded-lg bg-[#5D8736] px-5 py-3 active:opacity-80"
        >
          <Icon name="refresh-cw" size={16} strokeWidth={2.4} color="#FFFFFF" />
          <Text className="ml-2 font-bold text-white">Try again</Text>
        </Pressable>
      </Enter>,
    );
  }

  const fullName =
    [data.last_name, data.first_name].filter(Boolean).join(', ') ||
    'Unnamed violator';
  const initials = `${(data.first_name?.[0] ?? '?').toUpperCase()}${(
    data.last_name?.[0] ?? ''
  ).toUpperCase()}`;
  const showPhoto = !!data.photo && !photoFailed;

  const latest = reports[0];
  const earliest = reports[reports.length - 1];
  const visibleReports = showAll ? reports : reports.slice(0, COLLAPSED_COUNT);
  const hiddenCount = reports.length - visibleReports.length;

  return shell(
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 40,
        }}
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
        {/* Hero */}
        <Enter index={0}>
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <View className="flex-row">
              <Pressable
                onPress={() => setPhotoOpen(true)}
                disabled={!showPhoto}
                accessibilityLabel="View photo"
                className="h-32 w-24 overflow-hidden rounded-2xl bg-white/25"
              >
                {showPhoto ? (
                  <Image
                    source={{ uri: data.photo! }}
                    onError={() => setPhotoFailed(true)}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-3xl font-bold text-white">
                      {initials}
                    </Text>
                  </View>
                )}
              </Pressable>

              <View className="ml-4 flex-1 justify-center">
                <Text className="text-2xl font-bold text-white">
                  {fullName}
                </Text>
                <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
                  <HeroChip icon="user" text={`Age ${data.age ?? '—'}`} />
                  <HeroChip
                    icon="map-pin"
                    text={data.zone?.zone_name ?? 'No zone'}
                  />
                </View>
              </View>
            </View>

            <View className="mt-4 flex-row items-start rounded-2xl bg-white/20 p-3">
              <Icon name="map-pin" color="#FFFFFF" size={16} />
              <View className="ml-2 flex-1">
                <Text className="text-xs text-white/75">Address</Text>
                <Text className="text-sm font-semibold text-white">
                  {data.address || 'No address on file'}
                </Text>
              </View>
            </View>

            {showPhoto ? (
              <Text className="mt-3 text-xs text-white/70">
                Tap the photo to enlarge it
              </Text>
            ) : null}
          </LinearGradient>
        </Enter>

        {/* Stats */}
        <Enter index={1} className="mt-4">
          <View className="flex-row" style={{ gap: 10 }}>
            <StatTile
              icon="activity"
              label="Records"
              value={String(reports.length)}
            />
            <StatTile
              icon="clock"
              label="Last violation"
              value={fullDate(latest?.date)}
            />
            <StatTile
              icon="calendar"
              label="First recorded"
              value={fullDate(earliest?.date)}
            />
          </View>
        </Enter>

        {/* Records */}
        <Enter
          index={2}
          className="mb-3 mt-6 flex-row items-end justify-between px-1"
        >
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Violation records
          </Text>
          {reports.length > 0 ? (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Tap a record to open the report
            </Text>
          ) : null}
        </Enter>

        {reports.length > 0 ? (
          <>
            {visibleReports.map((report, i) => (
              <RecordCard
                key={report.id}
                report={report}
                index={i + 3}
                onPress={() =>
                  navigation.navigate('report_details', { id: report.id })
                }
              />
            ))}

            {reports.length > COLLAPSED_COUNT ? (
              <Pressable
                onPress={() => setShowAll(v => !v)}
                accessibilityRole="button"
                className="items-center rounded-2xl border border-gray-100 bg-white py-3 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
              >
                <Text className="text-sm font-semibold text-lime-700 dark:text-lime-400">
                  {showAll
                    ? 'Show fewer'
                    : `Show ${hiddenCount} more ${
                        hiddenCount === 1 ? 'record' : 'records'
                      }`}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <Enter
            index={3}
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
      </ScrollView>

      {/* full-screen photo */}
      <Modal
        visible={photoOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPhotoOpen(false)}
      >
        <Pressable
          onPress={() => setPhotoOpen(false)}
          className="flex-1 items-center justify-center bg-black/90 px-4"
        >
          {showPhoto ? (
            <Image
              source={{ uri: data.photo! }}
              resizeMode="contain"
              style={{ width: '100%', height: '80%' }}
            />
          ) : null}
          <Text className="mt-3 text-sm text-white/70">Tap to close</Text>
        </Pressable>
      </Modal>
    </>,
  );
};

export default ViolatorsDetails;

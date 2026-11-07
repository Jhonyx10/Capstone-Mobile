import { useState } from 'react';
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

const toNum = (v: unknown) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatDuration = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(
    Math.floor(sec % 60),
  ).padStart(2, '0')}`;

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
    <Text className="mt-2 text-base font-bold text-gray-900 dark:text-white">
      {value}
    </Text>
    <Text className="text-xs text-gray-500 dark:text-gray-400">{label}</Text>
  </View>
);

const SectionCard = ({
  icon,
  title,
  index,
  right,
  children,
}: {
  icon: IconName;
  title: string;
  index: number;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Enter
    index={index}
    className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
  >
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
          <Icon name={icon} color={GREEN} size={16} />
        </View>
        <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
      </View>
      {right}
    </View>
    {children}
  </Enter>
);

const ReportDetails = () => {
  const { base_url, token, reports } = useAppStore();
  const route = useRoute<ReportDetailsRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;
  const [viewer, setViewer] = useState<string | null>(null);

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
  // only present when the report was linked to a response request
  const responseTime = toNum((details as any)?.response_time); // seconds
  const distanceKm = toNum((details as any)?.distance); // km

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
        <Enter className="items-center rounded-2xl bg-white p-8 dark:bg-slate-800">
          <Icon name="alert-triangle" color="#F59E0B" size={32} />
          <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
            Couldn't load this report
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            Check your connection and try again.
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
        </Enter>
      );
    }

    if (!details) {
      return (
        <Enter className="items-center rounded-2xl bg-white p-8 dark:bg-slate-800">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
            <Icon name="search" color={GREEN} size={28} />
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

    const evidences = details.evidences ?? [];

    return (
      <>
        {/* Hero */}
        <Enter index={0} className="mb-3">
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <View className="self-start rounded-full bg-white/25 px-3 py-1">
              <Text className="text-xs font-bold text-white">
                {details.incident_type?.category?.category_name ||
                  'Unknown category'}
              </Text>
            </View>
            <Text className="mt-2 text-2xl font-bold text-white">
              {details.incident_type?.incident_name || 'Unknown incident'}
            </Text>

            <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
              {date ? <HeroChip icon="calendar" text={date} /> : null}
              {time ? <HeroChip icon="clock" text={time} /> : null}
              {filedBy ? (
                <HeroChip icon="user" text={`Filed by ${filedBy}`} />
              ) : null}
            </View>
          </LinearGradient>
        </Enter>

        {/* Response stats, only for reports linked to a response request */}
        {responseTime != null || distanceKm != null ? (
          <Enter index={1} className="mb-3 flex-row" style={{ gap: 10 }}>
            {responseTime != null ? (
              <StatTile
                icon="clock"
                label="Response time"
                value={formatDuration(responseTime)}
              />
            ) : null}
            {distanceKm != null ? (
              <StatTile
                icon="navigation"
                label="Distance"
                value={`${distanceKm} km`}
              />
            ) : null}
          </Enter>
        ) : null}

        {/* Location */}
        <SectionCard icon="map-pin" title="Location" index={2}>
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {place || 'Unknown location'}
          </Text>
          {zone ? (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {zone}
            </Text>
          ) : null}
          {landmark ? (
            <Pressable
              onPress={() => setViewer(landmark)}
              accessibilityLabel="Enlarge landmark photo"
              className="mt-3 overflow-hidden rounded-xl"
            >
              <Image
                source={{ uri: landmark }}
                className="h-40 w-full bg-gray-200"
                resizeMode="cover"
              />
              <View
                className="rounded-full bg-black/50 px-2.5 py-1"
                style={{ position: 'absolute', bottom: 8, right: 8 }}
              >
                <Text className="text-[11px] font-semibold text-white">
                  Tap to enlarge
                </Text>
              </View>
            </Pressable>
          ) : null}
        </SectionCard>

        {/* Description */}
        <SectionCard icon="activity" title="Description" index={3}>
          <Text className="text-[15px] leading-6 text-gray-700 dark:text-gray-300">
            {details.report_description || 'No description provided.'}
          </Text>
        </SectionCard>

        {/* Violators (ReportViolators draws its own heading) */}
        <Enter
          index={4}
          className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <ReportViolators id={id} />
        </Enter>

        {/* Evidence */}
        <SectionCard
          icon="camera"
          title="Evidence"
          index={5}
          right={
            evidences.length > 0 ? (
              <View className="rounded-full bg-[#5D8736]/10 px-2.5 py-1 dark:bg-[#5D8736]/25">
                <Text className="text-xs font-bold text-[#5D8736] dark:text-lime-400">
                  {evidences.length}
                </Text>
              </View>
            ) : undefined
          }
        >
          {evidences.length > 0 ? (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {evidences.map(evidence => (
                <Pressable
                  key={evidence.id}
                  onPress={() => {
                    if (evidence.file_url) setViewer(evidence.file_url);
                  }}
                  accessibilityLabel="Enlarge evidence photo"
                  className="w-24 active:opacity-80"
                >
                  <Image
                    source={{ uri: evidence.file_url }}
                    className="h-24 w-24 rounded-xl bg-gray-200"
                  />
                  {evidence.remarks ? (
                    <Text
                      numberOfLines={2}
                      className="mt-1 text-center text-[11px] text-gray-600 dark:text-gray-300"
                    >
                      {evidence.remarks}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              No evidence photos.
            </Text>
          )}
        </SectionCard>
      </>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Top bar */}
      <Enter from="top" className="flex-row items-center px-4 py-3">
        <BackButton onPress={() => navigation.goBack()} />
        <Text className="ml-3 flex-1 text-base font-semibold text-gray-600 dark:text-gray-300">
          Report details
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500">#{id}</Text>
      </Enter>

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
        {renderBody()}
      </ScrollView>

      {/* full-screen photo */}
      <Modal
        visible={!!viewer}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewer(null)}
      >
        <Pressable
          onPress={() => setViewer(null)}
          className="flex-1 items-center justify-center bg-black/90 px-4"
        >
          {viewer ? (
            <Image
              source={{ uri: viewer }}
              resizeMode="contain"
              style={{ width: '100%', height: '80%' }}
            />
          ) : null}
          <Text className="mt-3 text-sm text-white/70">Tap to close</Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ReportDetails;

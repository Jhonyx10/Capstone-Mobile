import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReportCard from '../../components/reports/ReportCard';
import Enter from '../../components/Enter';
import Icon, { IconName } from '../../components/Icon';
import useAppStore from '../../../store/useAppStore';
import { RootStackParamList } from '../../Navigation';

type ReportFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'report'
>;

const DAY = 24 * 60 * 60 * 1000;

const HeroStat = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: number;
}) => (
  <View className="flex-1 rounded-2xl bg-white/20 px-3 py-2.5">
    <View className="flex-row items-center">
      <Icon name={icon} color="#FFFFFF" size={13} />
      <Text className="ml-1.5 text-xs text-white/80">{label}</Text>
    </View>
    <Text className="mt-0.5 text-xl font-bold text-white">{value}</Text>
  </View>
);

const ReportScreen = () => {
  const navigation = useNavigation<ReportFormNavigationProp>();
  const reports = useAppStore(state => state.reports);

  // counted from the report dates already in the store
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const weekStart = startOfToday - 6 * DAY;

    let today = 0;
    let week = 0;
    reports.forEach(r => {
      const t = new Date(
        `${String(r.date ?? '').slice(0, 10)}T00:00:00`,
      ).getTime();
      if (isNaN(t)) return;
      if (t >= startOfToday) today += 1;
      if (t >= weekStart) week += 1;
    });
    return { today, week };
  }, [reports]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <Enter from="top" className="px-4 pb-2 pt-3">
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Reports
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Incidents filed by the tanods
        </Text>
      </Enter>

      {/* Stats */}
      <Enter index={1} className="px-4 pb-3">
        <LinearGradient
          colors={['#A9C46C', '#5D8736']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, padding: 12 }}
        >
          <View className="flex-row" style={{ gap: 10 }}>
            <HeroStat icon="activity" label="Total" value={reports.length} />
            <HeroStat icon="clock" label="Today" value={stats.today} />
            <HeroStat icon="calendar" label="This week" value={stats.week} />
          </View>
        </LinearGradient>
      </Enter>

      {/* List (each row animates itself, see ReportCard.tsx) */}
      <View className="flex-1">
        <ReportCard />
      </View>

      {/* Floating action */}
      <Pressable
        onPress={() => navigation.navigate('report_form')}
        accessibilityRole="button"
        accessibilityLabel="File a report"
        className="flex-row items-center rounded-full bg-[#5D8736] px-5 py-3.5 active:opacity-80"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 84, // above the floating tab bar
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Icon name="alert-circle" size={18} strokeWidth={2.4} color="#FFFFFF" />
        <Text className="ml-2 text-sm font-bold text-white">File report</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default ReportScreen;

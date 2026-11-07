import { useMemo } from 'react';
import { View, Text, Image, Pressable, Linking, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import NewsFeed from '../../components/news/NewsFeed';
import Icon, { IconName } from '../../components/Icon';
import Enter from '../../components/Enter';
import useAppStore from '../../../store/useAppStore';
import useNews from '../../hooks/useNews';
import { getHotlines } from '../../../util/getHotline';
import {
  greeting,
  todayLabel,
  timeAgo,
  isToday,
} from '../../../util/useHelper';

// tab names aren't in RootStackParamList, so keep the navigator loosely typed
type Nav = { navigate: (screen: string) => void };

interface HotlineItem {
  id: number;
  department_name: string;
  hotline_number: string;
}

const iconFor = (name: string): IconName =>
  /police|pnp/i.test(name) ? 'shield' : 'alert-triangle';

const callNumber = async (number: string) => {
  try {
    await Linking.openURL(`tel:${number.replace(/\s+/g, '')}`);
  } catch {
    Alert.alert("Can't place the call", `Please dial ${number} manually.`);
  }
};

const HeroStat = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-2xl bg-white/20 px-3 py-2.5">
    <View className="flex-row items-center">
      <Icon name={icon} color="#FFFFFF" size={13} />
      <Text className="ml-1.5 text-xs text-white/80">{label}</Text>
    </View>
    <Text className="mt-0.5 text-base font-bold text-white">{value}</Text>
  </View>
);

const BarangayCard = () => {
  const user = useAppStore(s => s.user);
  const { data } = useNews();

  const items = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data]);
  const firstName = user?.name?.trim().split(' ')[0] || 'Resident';
  const today = items.filter(i => isToday(i.published_at)).length;
  const newest = items.reduce<string | null>(
    (max, i) =>
      !max || new Date(i.published_at) > new Date(max) ? i.published_at : max,
    null,
  );

  return (
    <Enter index={0}>
      <LinearGradient
        colors={['#A9C46C', '#5D8736']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 20, padding: 16, marginBottom: 16 }}
      >
        <View className="flex-row items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white">
            <Image
              source={require('../../assets/img/Barangay.png')}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-white/80">
              {todayLabel()}
            </Text>
            <Text numberOfLines={1} className="text-2xl font-bold text-white">
              {greeting()}, {firstName}
            </Text>
            <Text className="text-sm text-white/85">
              Stay informed about your barangay.
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row" style={{ gap: 10 }}>
          <HeroStat
            icon="clock"
            label="Latest update"
            value={newest ? timeAgo(newest) : '—'}
          />
          <HeroStat
            icon="activity"
            label="Reports today"
            value={String(today)}
          />
        </View>
      </LinearGradient>
    </Enter>
  );
};

const ACTIONS: {
  label: string;
  icon: IconName;
  screen: string;
  danger?: boolean;
}[] = [
  {
    label: 'Get help',
    icon: 'alert-triangle',
    screen: 'request',
    danger: true,
  },
  { label: 'Hotlines', icon: 'shield', screen: 'hotline' },
  { label: 'Watch list', icon: 'eye', screen: 'watchlist' },
];

const QuickActions = () => {
  const navigation = useNavigation<Nav>();

  return (
    <Enter index={1} className="mb-4">
      <View className="flex-row" style={{ gap: 10 }}>
        {ACTIONS.map(a => (
          <Pressable
            key={a.label}
            onPress={() => navigation.navigate(a.screen)}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            className="flex-1 items-center rounded-2xl border border-gray-100 bg-white px-2 py-3.5 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
          >
            <View
              className={`h-11 w-11 items-center justify-center rounded-full ${
                a.danger
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-lime-100 dark:bg-lime-900/40'
              }`}
            >
              {a.danger ? (
                <Icon
                  name={a.icon}
                  color="#EF4444"
                  size={22}
                  strokeWidth={2.3}
                />
              ) : (
                <Icon name={a.icon} tone="lime" size={22} />
              )}
            </View>
            <Text className="mt-2 text-xs font-semibold text-gray-800 dark:text-gray-100">
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Enter>
  );
};

const QuickCall = () => {
  const navigation = useNavigation<Nav>();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);

  // same key as the Hotlines screen, so it's fetched once and shared
  const { data: hotlines = [] } = useQuery<HotlineItem[]>({
    queryKey: ['hotlines'],
    queryFn: () => getHotlines({ base_url, token }),
    enabled: !!token,
    retry: 1,
  });

  if (hotlines.length === 0) return null;

  return (
    <Enter index={2} className="mb-4">
      <View className="mb-2 flex-row items-end justify-between">
        <Text className="text-lg font-bold text-[#2b2b2b] dark:text-white">
          Quick call
        </Text>
        <Pressable onPress={() => navigation.navigate('hotline')} hitSlop={8}>
          <Text className="text-sm font-semibold text-lime-700 dark:text-lime-400">
            See all
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        {hotlines.slice(0, 2).map(h => (
          <Pressable
            key={h.id}
            onPress={() => callNumber(h.hotline_number)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${h.department_name}`}
            className="flex-row items-center rounded-2xl border border-gray-100 bg-white p-3 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
              <Icon name={iconFor(h.department_name)} tone="lime" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                numberOfLines={1}
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                {h.department_name}
              </Text>
              <Text className="text-xs tracking-wide text-gray-500 dark:text-gray-400">
                {h.hotline_number}
              </Text>
            </View>
            <View className="rounded-full bg-[#5D8736] px-3.5 py-1.5">
              <Text className="text-xs font-bold text-white">Call</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Enter>
  );
};

const HomeHeader = () => (
  <View>
    <BarangayCard />
    <QuickActions />
    <QuickCall />
  </View>
);

const Home = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#f4f4f4] dark:bg-slate-900">
      <NewsFeed topInset={insets.top + 8} header={<HomeHeader />} />
    </View>
  );
};

export default Home;

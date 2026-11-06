import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useColorScheme } from 'nativewind';
import useAppStore from '../../../store/useAppStore';
import LogoutBtn from '../../components/LogoutBtn';
import Icon, { IconName } from '../../components/Icon';
import Enter from '../../components/Enter';

const GREEN = '#5D8736';

const TOGGLE_ANIMATION = { duration: 250, easing: Easing.out(Easing.cubic) };


// The login response includes the user's current group assignment, with the
// group inside it. Laravel sends relation names in snake_case, so it arrives
// as `current_assignment`.
type GroupInfo = { id: number; name: string; capacity?: number | null };

type UserWithGroup = {
  current_assignment?: { group?: GroupInfo | null } | null;
  currentAssignment?: { group?: GroupInfo | null } | null;
  group?: GroupInfo | GroupInfo[] | null;
};

const getGroup = (user: unknown): GroupInfo | null => {
  const u = user as UserWithGroup | null;

  const assigned = (u?.current_assignment ?? u?.currentAssignment)?.group;
  if (assigned) return assigned;

  // fallback for a plain `group` relation
  const raw = u?.group;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
};

// Switch whose thumb slides and track color fades. The animation runs on the
// UI thread, so it stays smooth even while the whole app re-renders in the
// new theme.
const AnimatedToggle = ({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) => {
  const progress = useSharedValue(value ? 1 : 0);

  // keep in sync if the theme changes from somewhere else
  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, TOGGLE_ANIMATION);
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#CBD5E1', GREEN],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 22 }],
  }));

  const handlePress = () => {
    // start sliding first, then switch the theme a moment later so the
    // re-render doesn't interrupt the start of the animation
    progress.value = withTiming(value ? 0 : 1, TOGGLE_ANIMATION);
    setTimeout(onToggle, 120);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View
        style={[
          { width: 52, height: 30, borderRadius: 15, justifyContent: 'center' },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: 24,
              height: 24,
              borderRadius: 12,
              marginLeft: 3,
              backgroundColor: '#FFFFFF',
              elevation: 2,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const Section = ({
  title,
  children,
  tight,
}: {
  title: string;
  children: React.ReactNode;
  tight?: boolean; // smaller gap below, for blocks that continue in the next card
}) => (
  <View className={tight ? 'mb-2' : 'mb-4'}>
    <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {title}
    </Text>
    <View className="rounded-xl bg-white p-4 dark:bg-slate-800">
      {children}
    </View>
  </View>
);

const InfoRow = ({
  label,
  value,
  last,
}: {
  label: string;
  value?: string | null;
  last?: boolean;
}) => (
  <View
    className={`flex-row items-center justify-between py-2.5 ${
      last ? '' : 'border-b border-gray-100 dark:border-slate-700'
    }`}
  >
    <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    <Text className="ml-4 flex-1 text-right text-sm font-medium text-gray-800 dark:text-white">
      {value || '—'}
    </Text>
  </View>
);

const NavRow = ({
  icon,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center px-4 py-3 ${
      last ? '' : 'border-b border-gray-100 dark:border-slate-700'
    }`}
  >
    <View className="h-10 w-10 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
      <Icon name={icon} tone="lime" size={20} />
    </View>
    <View className="ml-3 flex-1">
      <Text className="text-[15px] font-semibold text-gray-800 dark:text-white">
        {title}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </Text>
    </View>
    <Icon name="chevron-right" tone="muted" size={20} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const { user } = useAppStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = colorScheme === 'dark';
console.log('USER', JSON.stringify(user));
  // TODO: add the navigation / logic for these when the screens exist
  const handleUpdateAccount = () => {};
  const goToOperations = () => navigation.navigate('operations');
  const goToWatchlist = () => navigation.navigate('watchlists');
  const goToPerformanceReview = () => {};

  const initials = (user?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  const group = getGroup(user);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Enter index={0}>
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
              <Text className="text-xl font-bold text-lime-700">
                {initials}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text
                className="text-lg font-semibold text-white"
                numberOfLines={1}
              >
                {user?.name ?? 'Unknown user'}
              </Text>
              {user?.email ? (
                <Text className="text-xs text-white/90" numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
              <View className="mt-1.5 flex-row items-center self-start rounded-full bg-white/25 px-2.5 py-1">
                <Icon name="users" size={12} color="#FFFFFF" />
                <Text
                  className="ml-1.5 text-xs font-semibold text-white"
                  numberOfLines={1}
                >
                  {group?.name ?? 'No group assigned'}
                </Text>
              </View>
            </View>
            {role ? (
              <View className="ml-2 rounded-full bg-white/25 px-3 py-1">
                <Text className="text-xs font-bold text-white">{role}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </Enter>

        {/* Account details */}
        <Enter index={1}>
          <Section title="Account">
            <InfoRow label="Name" value={user?.name} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Group" value={group?.name ?? 'No group assigned'} />
            <InfoRow label="Role" value={role} last />

            <TouchableOpacity
              onPress={handleUpdateAccount}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Update account"
              className="mt-4 flex-row items-center justify-center rounded-xl bg-[#5D8736] py-3"
            >
              <Icon
                name="refresh-cw"
                size={16}
                strokeWidth={2.4}
                color="#FFFFFF"
              />
              <Text className="ml-2 text-[15px] font-semibold text-white">
                Update
              </Text>
            </TouchableOpacity>
          </Section>
        </Enter>

        {/* Settings */}
        <Enter index={2}>
          <Section title="Settings" tight>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center pr-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
                  <Icon name={isDark ? 'moon' : 'sun'} tone="lime" size={20} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-semibold text-gray-800 dark:text-white">
                    Dark mode
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Currently using {isDark ? 'dark' : 'light'} mode
                  </Text>
                </View>
              </View>
              <AnimatedToggle
                value={isDark}
                onToggle={() => toggleColorScheme()}
              />
            </View>
          </Section>
        </Enter>

        {/* Navigation shortcuts */}
        <Enter
          index={3}
          className="mb-4 overflow-hidden rounded-xl bg-white dark:bg-slate-800"
        >
          <NavRow
            icon="activity"
            title="Operations"
            subtitle="Manage your daily operations"
            onPress={goToOperations}
          />
          <NavRow
            icon="eye"
            title="Watchlist"
            subtitle="People and places you're keeping an eye on"
            onPress={goToWatchlist}
          />
          <NavRow
            icon="trending-up"
            title="Performance review"
            subtitle="See how you're doing"
            onPress={goToPerformanceReview}
            last
          />
        </Enter>

        {/* Log out */}
        <Enter index={4}>
          <LogoutBtn />
        </Enter>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

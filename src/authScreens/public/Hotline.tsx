import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import useAppStore from '../../../store/useAppStore';
import { getHotlines } from '../../../util/getHotline';
import Icon, { IconName } from '../../components/Icon';
import Enter from '../../components/Enter';
import type { RootStackParamList } from '../../Navigation';

const THEME = '#5D8736';

interface HotlineItem {
  id: number;
  department_name: string;
  hotline_number: string;
}

// police gets a shield, everything else the alert icon
const iconFor = (name: string): IconName =>
  /police|pnp/i.test(name) ? 'shield' : 'alert-triangle';

const callNumber = async (number: string) => {
  try {
    await Linking.openURL(`tel:${number.replace(/\s+/g, '')}`);
  } catch {
    Alert.alert("Can't place the call", `Please dial ${number} manually.`);
  }
};

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel="Go back"
    className="h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-800"
  >
    <Icon name="chevron-left" tone="neutral" size={22} />
  </Pressable>
);

const HotlineCard = ({ item, index }: { item: HotlineItem; index: number }) => (
  <Enter index={index + 2} skip={index > 6}>
    <Pressable
      onPress={() => callNumber(item.hotline_number)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${item.department_name}`}
      className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
        <Icon name={iconFor(item.department_name)} tone="lime" size={22} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-base font-semibold text-gray-900 dark:text-white"
        >
          {item.department_name}
        </Text>
        <Text className="mt-0.5 text-sm tracking-wide text-gray-500 dark:text-gray-400">
          {item.hotline_number}
        </Text>
      </View>

      <View className="ml-3 rounded-full bg-[#5D8736] px-4 py-2">
        <Text className="text-sm font-bold text-white">Call</Text>
      </View>
    </Pressable>
  </Enter>
);

const Hotline = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);

  const {
    data: hotlines = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery<HotlineItem[]>({
    queryKey: ['hotlines'],
    queryFn: () => getHotlines({ base_url, token }),
    enabled: !!token,
    retry: 1,
  });

  const goBack = () => navigation.goBack();

  return (
    <View
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* top bar, always visible so you can go back while loading */}
      <Enter from="top" index={0} className="mb-3 flex-row items-center px-4">
        <BackButton onPress={goBack} />
        <Text className="ml-3 text-base font-semibold text-gray-600 dark:text-gray-300">
          Hotlines
        </Text>
      </Enter>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: insets.bottom + 32,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              colors={[THEME]}
              tintColor={THEME}
            />
          }
        >
          {/* header card */}
          <Enter index={1}>
            <LinearGradient
              colors={['#A9C46C', '#5D8736']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 20, padding: 16, marginBottom: 16 }}
            >
              <View className="flex-row items-center">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
                  <Icon
                    name="alert-triangle"
                    color="#FFFFFF"
                    size={28}
                    strokeWidth={2.2}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-bold text-white">
                    Emergency hotlines
                  </Text>
                  <Text className="mt-0.5 text-sm text-white/85">
                    Tap a department to call it right away.
                  </Text>
                </View>
              </View>

              {hotlines.length > 0 ? (
                <View className="mt-3 self-start rounded-full bg-white/25 px-3 py-1">
                  <Text className="text-xs font-bold text-white">
                    {hotlines.length}{' '}
                    {hotlines.length === 1 ? 'department' : 'departments'}
                  </Text>
                </View>
              ) : null}
            </LinearGradient>
          </Enter>

          {isError && hotlines.length === 0 ? (
            <Enter index={2}>
              <View className="items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
                <Icon name="alert-triangle" color="#F59E0B" size={30} />
                <Text className="mt-2 text-center text-base text-gray-700 dark:text-gray-200">
                  Couldn't load the hotlines.
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
            </Enter>
          ) : hotlines.length === 0 ? (
            <Enter index={2}>
              <View className="items-center rounded-2xl bg-white p-6 dark:bg-slate-800">
                <Icon name="alert-triangle" tone="muted" size={28} />
                <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
                  No hotlines yet
                </Text>
                <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  Emergency numbers will show up here once they're added.
                </Text>
              </View>
            </Enter>
          ) : (
            hotlines.map((item, i) => (
              <HotlineCard key={item.id} item={item} index={i} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Hotline;

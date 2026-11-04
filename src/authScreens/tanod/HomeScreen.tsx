import { View, Text, Image, ScrollView, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BarChartComponent from '../../components/BarChartComponent';
import Enter from '../../components/Enter';
import useAppStore from '../../../store/useAppStore';
import useHomeAnalytics from '../../hooks/useHomeAnalytics';

// API values can arrive as numbers, strings or null
const num = (v: unknown) => Number(v ?? 0) || 0;

const delta = (v: unknown) =>
  v === null || v === undefined || v === ''
    ? '—'
    : `${num(v) >= 0 ? '▲' : '▼'} ${Math.abs(num(v)).toFixed(1)}%`;

const StatCard = ({
  title,
  value,
  sub,
  index,
}: {
  title: string;
  value: string;
  sub: string;
  index: number;
}) => (
  <Enter
    index={index}
    className="flex-1 rounded-xl border-l-4 border-lime-600 bg-white p-3 dark:bg-slate-800"
  >
    <Text className="text-[11px] text-gray-500 dark:text-gray-400">
      {title}
    </Text>
    <Text className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
      {value}
    </Text>
    <Text className="mt-0.5 text-[11px] text-lime-600">{sub}</Text>
  </Enter>
);

const HomeScreen = () => {
  const user = useAppStore(state => state.user);
  const {
    months,
    responseTime,
    requests,
    residents,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useHomeAnalytics();

  const current = num(months?.current_total);
  const previous = num(months?.previous_total);
  const increase = current - previous;

  const show = (v: string) => (isLoading ? '…' : v);

  return (
    <View className="flex-1 relative dark:bg-slate-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <Image
          source={require('../../assets/img/BarangayTanod.png')}
          className="absolute top-0 w-full h-1/2"
          resizeMode="cover"
        />
        <View className="mx-6 mt-20 pb-28">
          <Enter index={0}>
            <LinearGradient
              colors={['#A9C46C', '#5D8736']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
              }}
            >
              <View className="flex flex-row items-center justify-between ">
                <View className="items-center flex flex-row gap-3">
                  {/* Barangay logo */}
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
                    <Image
                      source={require('../../assets/img/Barangay.png')}
                      className="h-12 w-12"
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-medium leading-tight">
                      {user?.name ?? 'Tanod'}
                    </Text>
                    <Text className="text-white text-xs leading-none">
                      Barangay Patrol
                    </Text>
                  </View>
                </View>
                <View className="bg-white p-2 rounded-3xl">
                  <LottieView
                    style={{ width: 30, height: 30 }}
                    source={require('../../assets/animation/BellAnimation.json')}
                    autoPlay={true}
                    loop={false}
                  />
                </View>
              </View>
              <View className="h-2 w-full rounded-xl items-center bg-white mt-4" />
              <View className="mx-4 mt-2">
                <Text className="text-white">
                  All Incident Reports This month
                </Text>
                <View className="flex flex-row justify-between items-center">
                  <View className="flex flex-row items-center ">
                    <LottieView
                      style={{ width: 50, height: 50 }}
                      source={require('../../assets/animation/Warning.json')}
                      autoPlay={true}
                      loop={false}
                    />
                    <Text className="text-5xl text-white font-semibold">
                      {show(String(current))}
                    </Text>
                  </View>

                  <View className="flex flex-row">
                    <Text className=" ml-2 p-1 bg-lime-400 rounded-lg">
                      {increase >= 0 ? `+${increase}` : `${increase}`}
                    </Text>
                    <View className="ml-1.5">
                      <Text className="text-xs text-white">
                        {increase >= 0 ? 'ang na dagdagan' : 'ang nabawasan'}
                      </Text>
                      <Text className="text-xs text-white">
                        kumpara sa nakaraang buwan
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-white mt-2">
                  {show(String(previous))} na report noong nakaraang buwan
                </Text>
              </View>
            </LinearGradient>
          </Enter>

          {isError && (
            <Text className="mt-3 text-center text-xs text-red-500">
              Could not load some analytics. Pull down to retry.
            </Text>
          )}

          {/* Quick stats: the three cards come in one after another */}
          <View className="mt-4 flex-row gap-2">
            <StatCard
              index={1}
              title="Avg response (mins)"
              value={show(num(responseTime?.current_response).toFixed(1))}
              sub={delta(responseTime?.percent_change)}
            />
            <StatCard
              index={2}
              title="Requests"
              value={show(String(num(requests?.current_month_total)))}
              sub={delta(requests?.monthly_request)}
            />
            <StatCard
              index={3}
              title="New residents"
              value={show(String(num(residents?.current_month_registered)))}
              sub={delta(residents?.monthly_registered)}
            />
          </View>

          <Enter index={4}>
            <BarChartComponent
              title="Reports: last month vs this month"
              labels={['Last month', 'This month']}
              data={[previous, current]}
            />
          </Enter>
        </View>
      </ScrollView>
    </View>
  );
};
export default HomeScreen;

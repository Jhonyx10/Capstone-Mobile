import { View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NewsFeed from '../../components/news/NewsFeed';
import useAppStore from '../../../store/useAppStore';

const BarangayCard = () => {
  const { user } = useAppStore();

  return (
    <View className="mb-4 flex-row items-center rounded-xl bg-white p-4 dark:bg-slate-800">
      <Image
        source={require('../../assets/img/Barangay.png')}
        style={{ width: 64, height: 64 }}
        resizeMode="contain"
      />
      <View className="ml-4 flex-1">
        <Text className="text-xs font-semibold uppercase text-lime-700 dark:text-lime-400">
          Welcome
        </Text>
        <Text className="text-lg font-bold text-[#2b2b2b] dark:text-white">
          {user?.name ?? 'Resident'}
        </Text>
        <Text className="text-sm text-[#5B5B5B] dark:text-gray-300">
          Here is the latest news in your barangay.
        </Text>
      </View>
    </View>
  );
};

const Home = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#f4f4f4] dark:bg-slate-900">
      <NewsFeed topInset={insets.top + 8} header={<BarangayCard />} />
    </View>
  );
};

export default Home;

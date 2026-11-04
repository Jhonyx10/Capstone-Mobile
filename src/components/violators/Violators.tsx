import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getViolators } from '../../../util/getViolators';
import { useQuery } from '@tanstack/react-query';
import useAppStore from '../../../store/useAppStore';
import { Violator } from '../../types/ViolatorType';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import { useEffect } from 'react';
import Icon from '../Icon';
import Enter from '../Enter';

type ViolatorsDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'violator'
>;

const GREEN = '#5D8736';

// only the first rows play the entrance; rows that mount while scrolling don't
const ANIMATED_ROWS = 10;

const Violators = () => {
  const { base_url, token } = useAppStore();
  const setViolators = useAppStore(state => state.setViolators);
  const navigation = useNavigation<ViolatorsDetailsNavigationProp>();

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['violators'],
    queryFn: () => getViolators({ token, base_url }),
  });

  useEffect(() => {
    if (data) {
      setViolators(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={GREEN} />
        <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Loading violators...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <Enter className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl">⚠️</Text>
        <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
          Couldn't load violators
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
      </Enter>
    );
  }

  const renderItem = ({ item, index }: { item: Violator; index: number }) => {
    const fullName =
      [item.last_name, item.first_name].filter(Boolean).join(', ') ||
      'Unnamed violator';
    const place = [item?.zone?.zone_name, item.address]
      .filter(Boolean)
      .join(', ');

    return (
      <Enter index={index} skip={index >= ANIMATED_ROWS}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('violators_details', { id: item.id })
          }
          className="mb-3 flex-row items-center rounded-xl border-l-4 border-lime-600 bg-white p-3 dark:bg-slate-800"
          style={{ elevation: 2 }}
        >
          {item.photo ? (
            <Image
              source={{ uri: item.photo }}
              className="h-16 w-16 rounded-xl bg-gray-200"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-xl bg-lime-100 dark:bg-lime-900/40">
              <Text className="text-base font-bold text-lime-700 dark:text-lime-400">
                {(item.first_name?.[0] ?? '?').toUpperCase()}
                {(item.last_name?.[0] ?? '').toUpperCase()}
              </Text>
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text
              className="text-base font-bold text-gray-800 dark:text-white"
              numberOfLines={1}
            >
              {fullName}
            </Text>
            <Text className="mt-0.5 text-[13px] text-gray-600 dark:text-gray-300">
              Age {item.age ?? '—'}
            </Text>
            <Text
              className="text-[13px] text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              📍 {place || 'No address'}
            </Text>
          </View>

          <Icon name="chevron-right" tone="muted" size={20} />
        </TouchableOpacity>
      </Enter>
    );
  };

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      // bottom padding keeps the last card clear of the floating tab bar
      contentContainerStyle={{
        paddingTop: 4,
        paddingBottom: 100,
        flexGrow: 1,
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
      ListEmptyComponent={
        <Enter className="flex-1 items-center justify-center px-8 pb-24">
          <Image
            source={require('../../assets/img/Barangay.png')}
            className="h-24 w-24"
            resizeMode="contain"
          />
          <Text className="mt-4 text-lg font-bold text-gray-800 dark:text-white">
            No violators on record yet
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            When you add a violator, they'll show up here.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('violator_form')}
            activeOpacity={0.8}
            className="mt-5 rounded-lg bg-lime-600 px-5 py-2.5"
          >
            <Text className="text-sm font-bold text-white">+ Add violator</Text>
          </TouchableOpacity>
        </Enter>
      }
    />
  );
};

export default Violators;

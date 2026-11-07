import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getViolators } from '../../../util/getViolators';
import useAppStore from '../../../store/useAppStore';
import { Violator } from '../../types/ViolatorType';
import { RootStackParamList } from '../../Navigation';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';

type ViolatorsDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'violator'
>;

const GREEN = '#5D8736';
const NO_ZONE = 'No zone';

// only the first rows play the entrance; rows that mount while scrolling don't
const ANIMATED_ROWS = 10;

const zoneOf = (v: Violator) => v.zone?.zone_name || NO_ZONE;

const initialsOf = (v: Violator) =>
  `${(v.first_name?.[0] ?? '?').toUpperCase()}${(
    v.last_name?.[0] ?? ''
  ).toUpperCase()}`;

interface Option {
  key: string;
  label: string;
  count: number;
}

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
    <Text numberOfLines={1} className="mt-0.5 text-lg font-bold text-white">
      {value}
    </Text>
  </View>
);

const Pill = ({ text }: { text: string }) => (
  <View className="mb-1 mr-1.5 rounded-full bg-[#5D8736]/10 px-2.5 py-1 dark:bg-[#5D8736]/25">
    <Text className="text-xs font-bold text-[#5D8736] dark:text-lime-400">
      {text}
    </Text>
  </View>
);

// Photo, or initials if there is no photo or it fails to load
const Avatar = ({ item }: { item: Violator }) => {
  const [failed, setFailed] = useState(false);
  const show = !!item.photo && !failed;

  return (
    <View className="h-16 w-16 overflow-hidden rounded-2xl bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
      {show ? (
        <Image
          source={{ uri: item.photo! }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-bold text-[#5D8736] dark:text-lime-400">
            {initialsOf(item)}
          </Text>
        </View>
      )}
    </View>
  );
};

const ViolatorCard = ({
  item,
  index,
  onPress,
}: {
  item: Violator;
  index: number;
  onPress: () => void;
}) => {
  const fullName =
    [item.last_name, item.first_name].filter(Boolean).join(', ') ||
    'Unnamed violator';
  const zone = item.zone?.zone_name;

  return (
    <Enter index={index} skip={index >= ANIMATED_ROWS}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${fullName}`}
        className="mb-3 flex-row items-center rounded-3xl bg-white p-4 active:opacity-80 dark:bg-slate-800"
        style={{
          shadowColor: GREEN,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <Avatar item={item} />

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-gray-900 dark:text-white"
          >
            {fullName}
          </Text>

          <View className="mt-1.5 flex-row flex-wrap items-center">
            <Pill text={`Age ${item.age ?? '—'}`} />
            {zone ? <Pill text={zone} /> : null}
          </View>

          <View className="flex-row items-center">
            <Icon name="map-pin" tone="muted" size={13} />
            <Text
              numberOfLines={1}
              className="ml-1.5 flex-1 text-xs text-gray-500 dark:text-gray-400"
            >
              {item.address || 'No address'}
            </Text>
          </View>
        </View>

        <Icon name="chevron-right" tone="muted" size={20} />
      </Pressable>
    </Enter>
  );
};

const FilterRow = ({
  options,
  selected,
  onSelect,
}: {
  options: Option[];
  selected: string;
  onSelect: (key: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    // bleed to the screen edges so chips scroll under the padding
    style={{ marginHorizontal: -16, marginBottom: 8 }}
    contentContainerStyle={{ paddingHorizontal: 16 }}
  >
    {options.map(o => {
      const on = o.key === selected;
      return (
        <Pressable
          key={o.key}
          onPress={() => onSelect(o.key)}
          accessibilityRole="button"
          accessibilityState={{ selected: on }}
          className={`mr-2 flex-row items-center rounded-full px-4 py-2 active:opacity-80 ${
            on ? 'bg-[#5D8736]' : 'bg-white dark:bg-slate-800'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              on ? 'text-white' : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {o.label}
          </Text>
          <Text
            className={`ml-1.5 text-xs font-bold ${
              on ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {o.count}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const Violators = () => {
  const { base_url, token } = useAppStore();
  const setViolators = useAppStore(state => state.setViolators);
  const navigation = useNavigation<ViolatorsDetailsNavigationProp>();
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('all');

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['violators'],
    queryFn: () => getViolators({ token, base_url }),
  });

  useEffect(() => {
    if (data) {
      setViolators(data);
    }
  }, [data]);

  const items: Violator[] = useMemo(() => data ?? [], [data]);

  const options = useMemo<Option[]>(() => {
    const counts = new Map<string, number>();
    items.forEach(v => counts.set(zoneOf(v), (counts.get(zoneOf(v)) ?? 0) + 1));
    return [
      { key: 'all', label: 'All', count: items.length },
      ...Array.from(counts, ([key, count]) => ({ key, label: key, count })),
    ];
  }, [items]);

  // if the selected zone vanished after a refresh, fall back to All
  const activeZone = options.some(o => o.key === zone) ? zone : 'all';

  const stats = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach(v => {
      const z = v.zone?.zone_name;
      if (z) counts.set(z, (counts.get(z) ?? 0) + 1);
    });
    let top = '—';
    let max = 0;
    counts.forEach((n, z) => {
      if (n > max) {
        max = n;
        top = z;
      }
    });
    return { zones: counts.size, top };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(v => {
      if (activeZone !== 'all' && zoneOf(v) !== activeZone) return false;
      if (!q) return true;
      return [v.first_name, v.last_name, v.address, v.zone?.zone_name]
        .filter(Boolean)
        .some(s => String(s).toLowerCase().includes(q));
    });
  }, [items, activeZone, search]);

  const filtering = search.trim().length > 0 || activeZone !== 'all';

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
        <Icon name="alert-triangle" color="#F59E0B" size={36} />
        <Text className="mt-3 text-base font-semibold text-gray-800 dark:text-white">
          Couldn't load violators
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
      </Enter>
    );
  }

  const listHeader = (
    <View>
      {/* summary */}
      <Enter index={0}>
        <LinearGradient
          colors={['#A9C46C', '#5D8736']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, padding: 16, marginBottom: 14 }}
        >
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
              <Icon name="users" color="#FFFFFF" size={28} strokeWidth={2.2} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-white">
                Violator records
              </Text>
              <Text className="mt-0.5 text-sm text-white/85">
                Search a name or open a profile to see their history.
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row" style={{ gap: 10 }}>
            <HeroStat
              icon="users"
              label="On record"
              value={String(items.length)}
            />
            <HeroStat
              icon="map-pin"
              label="Zones"
              value={String(stats.zones)}
            />
            <HeroStat icon="activity" label="Most in" value={stats.top} />
          </View>
        </LinearGradient>
      </Enter>

      {items.length > 0 ? (
        <Enter index={1}>
          {/* search */}
          <View className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, address or zone"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              className="flex-1 py-3 text-sm text-gray-900 dark:text-white"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Text className="text-sm font-semibold text-lime-700 dark:text-lime-400">
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* zone filter */}
          {options.length > 2 ? (
            <FilterRow
              options={options}
              selected={activeZone}
              onSelect={setZone}
            />
          ) : null}

          <Text className="mb-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {visible.length} {visible.length === 1 ? 'person' : 'people'}
          </Text>
        </Enter>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={visible}
      keyExtractor={item => item.id.toString()}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item, index }) => (
        <ViolatorCard
          item={item}
          index={index + 2}
          onPress={() =>
            navigation.navigate('violators_details', { id: item.id })
          }
        />
      )}
      ListHeaderComponent={listHeader}
      // bottom padding keeps the last card clear of the floating tab bar
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 110,
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
        items.length === 0 ? (
          <Enter
            index={2}
            className="items-center rounded-3xl bg-white p-8 dark:bg-slate-800"
          >
            <Image
              source={require('../../assets/img/Barangay.png')}
              className="h-20 w-20"
              resizeMode="contain"
            />
            <Text className="mt-4 text-lg font-bold text-gray-800 dark:text-white">
              No violators on record yet
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              When you add a violator, they'll show up here.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('violator_form')}
              className="mt-5 rounded-lg bg-[#5D8736] px-5 py-3 active:opacity-80"
            >
              <Text className="text-sm font-bold text-white">
                Add the first violator
              </Text>
            </Pressable>
          </Enter>
        ) : (
          <View className="items-center rounded-3xl bg-white p-8 dark:bg-slate-800">
            <Icon name="search" tone="muted" size={28} />
            <Text className="mt-3 text-base font-semibold text-gray-800 dark:text-white">
              {filtering ? 'No matches' : 'Nothing to show'}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              Try a different name or zone.
            </Text>
            <Pressable
              onPress={() => {
                setSearch('');
                setZone('all');
              }}
              className="mt-4 rounded-lg bg-[#5D8736] px-5 py-2.5 active:opacity-80"
            >
              <Text className="font-bold text-white">Clear filters</Text>
            </Pressable>
          </View>
        )
      }
    />
  );
};

export default Violators;

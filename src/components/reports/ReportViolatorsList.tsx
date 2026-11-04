import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import useAppStore from '../../../store/useAppStore';
import useInvolveViolator from '../../../store/useInvolveViolatorState';
import { Violator } from '../../types/ViolatorType';
import Enter from '../Enter';

// only the first rows play the entrance; rows that mount while scrolling don't
const ANIMATED_ROWS = 10;

const ReportViolatorsList = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  const { violators } = useAppStore();
  const involveViolator = useInvolveViolator(state => state.involveViolator);
  const setInvolveViolator = useInvolveViolator(
    state => state.setInvolveViolator,
  );

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return violators;
    return violators.filter(v =>
      `${v.first_name ?? ''} ${v.last_name ?? ''}`.toLowerCase().includes(q),
    );
  }, [violators, query]);

  const handleAddViolator = (violator: Violator) => {
    setInvolveViolator(violator);
  };

  const renderItem = ({
    item: violator,
    index,
  }: {
    item: Violator;
    index: number;
  }) => {
    const isSelected = involveViolator.some(v => v.id === violator.id);

    return (
      <Enter index={index} skip={index >= ANIMATED_ROWS}>
        <TouchableOpacity
          onPress={() => handleAddViolator(violator)}
          disabled={isSelected} // already added
          activeOpacity={0.8}
          className={`mb-2 flex-row items-center rounded-xl border p-3 ${
            isSelected
              ? 'border-lime-600 bg-lime-50 dark:bg-lime-900/20'
              : 'border-transparent bg-white dark:bg-slate-800'
          }`}
        >
          {violator.photo ? (
            <Image
              source={{ uri: violator.photo }}
              className="h-14 w-14 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
              <Text className="text-sm font-bold text-lime-700 dark:text-lime-400">
                {(violator.first_name?.[0] ?? '?').toUpperCase()}
                {(violator.last_name?.[0] ?? '').toUpperCase()}
              </Text>
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-semibold text-gray-800 dark:text-white">
              {violator.first_name} {violator.last_name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Age {violator.age ?? '—'}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {violator?.zone?.zone_name ?? 'No zone'}
              {violator.address ? `, ${violator.address}` : ''}
            </Text>
          </View>

          {isSelected ? (
            <View className="rounded-full bg-lime-600 px-2.5 py-1">
              <Text className="text-[11px] font-bold text-white">Added ✓</Text>
            </View>
          ) : (
            <View className="rounded-full border border-lime-600 px-2.5 py-1">
              <Text className="text-[11px] font-bold text-lime-700 dark:text-lime-400">
                + Add
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Enter>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <Enter
        from="top"
        className="border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-800 dark:text-white">
              Select violators
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Tap a violator to add them to the report
            </Text>
          </View>
          <View className="rounded-full bg-lime-100 px-3 py-1 dark:bg-lime-900/40">
            <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
              {involveViolator.length} added
            </Text>
          </View>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name..."
          placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
          className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </Enter>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Enter className="items-center px-6 pt-16">
            <Text className="text-4xl">🔍</Text>
            <Text className="mt-2 text-base font-semibold text-gray-800 dark:text-white">
              {violators.length === 0 ? 'No violators yet' : 'No matches'}
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
              {violators.length === 0
                ? 'Violators you add in the Violators tab will show up here.'
                : 'Try a different name.'}
            </Text>
          </Enter>
        }
      />

      {/* Done */}
      <Enter
        index={1}
        className="border-t border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          className="h-12 items-center justify-center rounded-xl bg-lime-600"
        >
          <Text className="text-base font-bold text-white">Done</Text>
        </TouchableOpacity>
      </Enter>
    </SafeAreaView>
  );
};

export default ReportViolatorsList;

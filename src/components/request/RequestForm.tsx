import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import useAppStore from '../../../store/useAppStore';
import useCategories from '../../hooks/useCategory';
import useDuplicateRequest from '../../hooks/useDuplicateRequest';
import { sendRequest } from '../../../util/postRequest';
import { RequestResponse } from '../../types/RequestResponseType';
import { RootStackParamList } from '../../Navigation';
import Icon from '../Icon';
import DuplicateRequestModal from './DuplicateRequestModal';

type ResponseTrackerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'response_tracker'
>;

interface coordinateProps {
  userCoords: [number, number] | null;
}

const RequestForm = ({ userCoords }: coordinateProps) => {
  const navigation = useNavigation<ResponseTrackerScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, base_url, token } = useAppStore();
  const setStatus = useAppStore(state => state.setStatus);
  const { data: categories = [], isLoading } = useCategories();
  const [categoryId, setCategoryId] = useState('');

  // duplicate-request geofence check
  const { findDuplicate } = useDuplicateRequest();
  const [checking, setChecking] = useState(false);
  const [duplicate, setDuplicate] = useState<any | null>(null);

  // Icon / spinner colors take hex, not className
  const muted = isDark ? '#94A3B8' : '#64748B'; // slate-400 / slate-500
  const accent = isDark ? '#A3E635' : '#4D7C0F'; // lime-400 / lime-700

  const requestMutation = useMutation({
    mutationFn: (payload: RequestResponse) =>
      sendRequest({ base_url, token, formData: payload }),
    onSuccess: () => {
      setCategoryId('');
      queryClient.invalidateQueries({ queryKey: ['request'] });
      setStatus(true);
      if (user?.id) {
        navigation.navigate('response_tracker', { requestId: user.id });
      }
    },
    onError: () => {
      Alert.alert("Couldn't send request", 'Please try again later.');
    },
  });

  const canSubmit = !!user?.id && !!userCoords && !!categoryId;
  const sending = requestMutation.isPending || checking;
  const selectedName = categories.find(
    (c: any) => c.id.toString() === categoryId,
  )?.category_name;

  const handleSubmit = async () => {
    if (!canSubmit || sending || !user?.id || !userCoords) return;

    setChecking(true);
    try {
      // blocks only if a request of the SAME category is within 50 m
      const existing = await findDuplicate(userCoords, categoryId);
      if (existing) {
        setDuplicate(existing);
        return;
      }
    } finally {
      setChecking(false);
    }

    requestMutation.mutate({
      user_id: user.id,
      category_id: categoryId,
      latitude: userCoords[1],
      longitude: userCoords[0],
    });
  };

  const hint = !userCoords
    ? 'Waiting for your location...'
    : !categoryId
    ? 'Select an emergency type first.'
    : 'Your exact location will be sent to the tanods.';

  return (
    <View>
      {/* Stat row, same layout as Response time / Remaining */}
      <View className="flex-row items-end justify-between">
        <View>
          <View className="flex-row items-center gap-1.5">
            <Icon name="map-pin" size={14} color={muted} />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Location
            </Text>
          </View>
          <Text className="text-4xl font-bold text-slate-900 dark:text-white">
            {userCoords ? 'Ready' : '--'}
          </Text>
        </View>

        <View className="items-end" style={{ maxWidth: '55%' }}>
          <View className="flex-row items-center gap-1.5">
            <Icon name="alert-triangle" size={14} color={accent} />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Type
            </Text>
          </View>
          <Text
            className="text-3xl font-bold text-lime-700 dark:text-lime-400"
            numberOfLines={1}
          >
            {selectedName ?? '--'}
          </Text>
        </View>
      </View>

      {/* Category chips */}
      <View className="mt-4">
        {isLoading ? (
          <ActivityIndicator color={accent} style={{ marginVertical: 8 }} />
        ) : categories.length === 0 ? (
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            No categories available.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((c: any) => {
              const selected = categoryId === c.id.toString();
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoryId(c.id.toString())}
                  activeOpacity={0.85}
                  className={`mr-2 rounded-full px-4 py-2 ${
                    selected ? 'bg-lime-400' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? 'text-slate-900'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {c.category_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Emergency button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!canSubmit || sending}
        activeOpacity={0.85}
        className={`mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
          canSubmit ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        {sending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Icon
              name="alert-triangle"
              size={22}
              strokeWidth={2.4}
              color={canSubmit ? '#FFFFFF' : muted}
            />
            <Text
              className={`text-lg font-bold ${
                canSubmit ? 'text-white' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Emergency Request
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View className="mt-3 flex-row items-center justify-center gap-1">
        <Icon name="target" size={12} color={muted} />
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </Text>
      </View>

      <DuplicateRequestModal
        visible={!!duplicate}
        onClose={() => setDuplicate(null)}
      />
    </View>
  );
};

export default RequestForm;

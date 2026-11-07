import useAppStore from '../../../store/useAppStore';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraPermission } from 'react-native-vision-camera';
import { useColorScheme } from 'nativewind';
import useZones from '../../hooks/useZone';
import { useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import usePhotoStore from '../../../store/usePhotoStore';
import useNewLocationStore from '../../../store/useNewLocationStore';
import { Zone } from '../../types/ZoneType';
import { postLocation } from '../../../util/postLocation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateLocation } from '../../types/LocationType';
import Icon from '../Icon';
import Enter from '../Enter';
import { SelectField } from '../Pickers';

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'location_form'
>;

const LocationForm = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { base_url, token, currentLocation } = useAppStore();
  const { data } = useZones();
  const { setLandmark } = usePhotoStore();
  const landmark = usePhotoStore(state => state.landmark);
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'location_form'>>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const queryClient = useQueryClient();

  // true when opened from the report form: select the new location on save
  const selectAfterCreate = route.params?.selectAfterCreate ?? false;
  const setNewLocation = useNewLocationStore(s => s.setNewLocation);

  const [formData, setFormData] = useState({
    zone_id: '',
    location_name: '',
    latitude: '',
    longitude: '',
    landmark: landmark,
  });

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    navigation.navigate('camera', { status: 'landmark' });
  };

  const locationMutation = useMutation({
    mutationFn: postLocation,
    onSuccess: (res: any, variables) => {
      if (selectAfterCreate) {
        // adjust these keys if your API wraps the created record differently
        const body = res?.data ?? res;
        const created = body?.data ?? body?.location ?? body;
        if (created?.id != null) {
          setNewLocation({
            id: String(created.id),
            zoneId: String(created.zone_id ?? variables.formData.zone_id),
          });
        }
      }

      setFormData({
        zone_id: '',
        location_name: '',
        latitude: '',
        longitude: '',
        landmark: '',
      });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert(
        'Could not save location',
        error?.message ?? 'Something went wrong. Please try again.',
      );
    },
  });

  const handleSubmit = () => {
    if (!formData.zone_id || !formData.location_name.trim()) {
      Alert.alert('Incomplete form', 'Please choose a zone and enter a name.');
      return;
    }

    const payload: CreateLocation = {
      zone_id: Number(formData.zone_id),
      location_name: formData.location_name,
      latitude: currentLocation?.latitude.toString() ?? '',
      longitude: currentLocation?.longitude.toString() ?? '',
      landmark: landmark ?? undefined,
    };
    locationMutation.mutate({ base_url, token, formData: payload });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <Enter
        from="top"
        className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-gray-800 dark:text-white">
            Add location
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Save a place so it can be used in reports
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700"
        >
          <Icon name="x" tone="neutral" size={18} />
        </TouchableOpacity>
      </Enter>

      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Landmark photo */}
        <Enter
          index={0}
          className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <Text className="mb-3 text-[15px] font-bold text-gray-800 dark:text-white">
            Landmark photo
          </Text>

          {landmark ? (
            <View>
              <Image
                source={{ uri: 'file://' + landmark }}
                className="h-44 w-full rounded-xl bg-gray-200"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setLandmark(null)}
                activeOpacity={0.8}
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-red-500"
              >
                <Icon name="x" color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="h-44 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600">
              <Icon name="camera" tone="muted" size={32} />
              <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No photo selected
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleOpenCamera}
            activeOpacity={0.8}
            className="mt-3 flex-row items-center justify-center rounded-lg border border-lime-600 py-2.5"
          >
            <Icon name="camera" tone="lime" size={18} />
            <Text className="ml-2 font-semibold text-lime-700 dark:text-lime-400">
              {landmark ? 'Retake photo' : 'Capture landmark'}
            </Text>
          </TouchableOpacity>
        </Enter>

        {/* Coordinates */}
        <Enter
          index={1}
          className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <View className="mb-3 flex-row items-center">
            <Icon name="map-pin" tone="lime" size={18} />
            <Text className="ml-2 text-[15px] font-bold text-gray-800 dark:text-white">
              Your current position
            </Text>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-slate-700">
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                Latitude
              </Text>
              <Text className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white">
                {currentLocation?.latitude ?? '—'}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-gray-50 p-3 dark:bg-slate-700">
              <Text className="text-[11px] text-gray-500 dark:text-gray-400">
                Longitude
              </Text>
              <Text className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white">
                {currentLocation?.longitude ?? '—'}
              </Text>
            </View>
          </View>
        </Enter>

        {/* Details */}
        <Enter
          index={2}
          className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <Text className="mb-3 text-[15px] font-bold text-gray-800 dark:text-white">
            Details
          </Text>

          <SelectField
            label="Zone"
            value={formData.zone_id}
            onChange={value => handleChange('zone_id', value)}
            placeholder="Choose zone"
            items={
              data?.map((zone: Zone) => ({
                label: zone.zone_name,
                value: zone.id.toString(),
              })) ?? []
            }
          />

          <Text className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Location name
          </Text>
          <TextInput
            placeholder="e.g. Basketball court"
            placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
            value={formData.location_name}
            onChangeText={text => handleChange('location_name', text)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </Enter>

        {/* Submit */}
        <Enter index={3}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={locationMutation.isPending}
            activeOpacity={0.8}
            className={`h-12 items-center justify-center rounded-xl bg-lime-600 ${
              locationMutation.isPending ? 'opacity-70' : ''
            }`}
          >
            {locationMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Save location
              </Text>
            )}
          </TouchableOpacity>
        </Enter>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocationForm;

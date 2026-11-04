import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { useCameraPermission } from 'react-native-vision-camera';
import useAppStore from '../../../store/useAppStore';
import useZones from '../../hooks/useZone';
import { Zone } from '../../types/ZoneType';
import { useMutation } from '@tanstack/react-query';
import { postViolator } from '../../../util/postViolatorProfile';
import { CreateViolator } from '../../types/ViolatorType';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import usePhotoStore from '../../../store/usePhotoStore';
import { useQueryClient } from '@tanstack/react-query';
import Icon from '../Icon';
import Enter from '../Enter';
import { SelectField } from '../Pickers';

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'violator'
>;

const INPUT =
  'rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white';

const Field = ({
  label,
  className = 'mb-3',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <View className={className}>
    <Text className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
      {label}
    </Text>
    {children}
  </View>
);

const CreateViolatorProfile = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const placeholderColor = isDark ? '#94A3B8' : '#9CA3AF';

  const { token, base_url } = useAppStore();
  const { setPhoto } = usePhotoStore();
  const photo = usePhotoStore(state => state.photo);
  const { data } = useZones();
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const queryClient = useQueryClient();

  const [violator, setViolator] = useState({
    last_name: '',
    first_name: '',
    age: '',
    zone_id: '',
    address: '',
    photo: photo,
  });

  const violatorProfileMutation = useMutation({
    mutationFn: postViolator,
    onSuccess: () => {
      Alert.alert('Violator added', 'The violator profile was created.');
      setViolator({
        last_name: '',
        first_name: '',
        age: '',
        zone_id: '',
        address: '',
        photo: '',
      });
      setPhoto(null);
      queryClient.invalidateQueries({ queryKey: ['violators'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert(
        'Could not save',
        error?.message ?? 'Something went wrong. Please try again.',
      );
    },
  });

  const handleSubmit = () => {
    if (
      !violator.last_name.trim() ||
      !violator.first_name.trim() ||
      !violator.age.trim() ||
      !violator.zone_id
    ) {
      Alert.alert(
        'Incomplete form',
        'Please enter the first name, last name, age and zone.',
      );
      return;
    }

    const payload: CreateViolator = {
      last_name: violator.last_name,
      first_name: violator.first_name,
      age: Number(violator.age),
      zone_id: Number(violator.zone_id),
      address: violator.address,
      photo: photo ?? undefined,
    };

    violatorProfileMutation.mutate({ base_url, token, violator: payload });
  };

  const handleChange = (field: keyof typeof violator, value: any) => {
    setViolator(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    navigation.navigate('camera', { status: 'violator' });
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
            Add violator
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Create a new violator profile
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
        {/* Photo */}
        <Enter
          index={0}
          className="mb-3 items-center rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <View>
            {photo ? (
              <>
                <Image
                  source={{ uri: 'file://' + photo }}
                  className="h-32 w-32 rounded-full bg-gray-200"
                />
                <TouchableOpacity
                  onPress={() => setPhoto(null)}
                  activeOpacity={0.8}
                  className="absolute -right-1 -top-1 h-8 w-8 items-center justify-center rounded-full bg-red-500"
                >
                  <Icon name="x" color="#FFFFFF" size={16} />
                </TouchableOpacity>
              </>
            ) : (
              <View className="h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600">
                <Icon name="camera" tone="muted" size={32} />
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  No photo
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleOpenCamera}
            activeOpacity={0.8}
            className="mt-4 flex-row items-center justify-center rounded-lg border border-lime-600 px-5 py-2.5"
          >
            <Icon name="camera" tone="lime" size={18} />
            <Text className="ml-2 font-semibold text-lime-700 dark:text-lime-400">
              {photo ? 'Retake photo' : 'Take photo'}
            </Text>
          </TouchableOpacity>
        </Enter>

        {/* Details */}
        <Enter
          index={1}
          className="mb-3 rounded-xl bg-white p-4 dark:bg-slate-800"
        >
          <Text className="mb-3 text-[15px] font-bold text-gray-800 dark:text-white">
            Personal details
          </Text>

          <View className="flex-row gap-2">
            <Field label="Last name" className="mb-3 flex-1">
              <TextInput
                placeholder="Last name"
                placeholderTextColor={placeholderColor}
                value={violator.last_name}
                onChangeText={text => handleChange('last_name', text)}
                className={INPUT}
              />
            </Field>
            <Field label="First name" className="mb-3 flex-1">
              <TextInput
                placeholder="First name"
                placeholderTextColor={placeholderColor}
                value={violator.first_name}
                onChangeText={text => handleChange('first_name', text)}
                className={INPUT}
              />
            </Field>
          </View>

          <View className="flex-row gap-2">
            <Field label="Age" className="mb-3 w-24">
              <TextInput
                placeholder="Age"
                placeholderTextColor={placeholderColor}
                value={violator.age}
                keyboardType="numeric"
                onChangeText={text => handleChange('age', text)}
                className={INPUT}
              />
            </Field>
            <View className="flex-1">
              <SelectField
                label="Zone"
                value={violator.zone_id}
                onChange={value => handleChange('zone_id', value)}
                placeholder="Select zone"
                items={
                  data?.map((zone: Zone) => ({
                    label: zone.zone_name,
                    value: zone.id.toString(),
                  })) ?? []
                }
              />
            </View>
          </View>

          <Field label="Address" className="mb-0">
            <TextInput
              placeholder="Street, purok or landmark"
              placeholderTextColor={placeholderColor}
              value={violator.address}
              onChangeText={text => handleChange('address', text)}
              className={INPUT}
            />
          </Field>
        </Enter>

        {/* Submit */}
        <Enter index={2}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={violatorProfileMutation.isPending}
            activeOpacity={0.8}
            className={`h-12 items-center justify-center rounded-xl bg-lime-600 ${
              violatorProfileMutation.isPending ? 'opacity-70' : ''
            }`}
          >
            {violatorProfileMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Save violator
              </Text>
            )}
          </TouchableOpacity>
        </Enter>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateViolatorProfile;

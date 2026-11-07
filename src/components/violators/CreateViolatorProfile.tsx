import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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

const GREEN = '#5D8736';

const INPUT =
  'rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white';

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
  const insets = useSafeAreaInsets();

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

  // the four details a profile can't be saved without
  const required = [
    { label: 'First name', done: Boolean(violator.first_name.trim()) },
    { label: 'Last name', done: Boolean(violator.last_name.trim()) },
    { label: 'Age', done: Boolean(violator.age.trim()) },
    { label: 'Zone', done: Boolean(violator.zone_id) },
  ];
  const doneCount = required.filter(r => r.done).length;
  const complete = doneCount === required.length;

  const handleSubmit = () => {
    if (!complete) {
      const missing = required.filter(r => !r.done).map(r => r.label);
      Alert.alert('Incomplete form', `Please fill in: ${missing.join(', ')}.`);
      return;
    }

    const payload: CreateViolator = {
      last_name: violator.last_name.trim(),
      first_name: violator.first_name.trim(),
      age: Number(violator.age),
      zone_id: Number(violator.zone_id),
      address: violator.address.trim(),
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

  const saving = violatorProfileMutation.isPending;

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <Enter
        from="top"
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-gray-800 dark:text-white">
            Add violator
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Create a new violator profile
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close"
          className="h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-800"
        >
          <Icon name="x" tone="neutral" size={18} />
        </Pressable>
      </Enter>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo */}
        <Enter index={0} className="mb-3">
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <View className="flex-row items-center">
              <Pressable
                onPress={handleOpenCamera}
                accessibilityLabel={photo ? 'Retake photo' : 'Take photo'}
                className="h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white/25 active:opacity-80"
              >
                {photo ? (
                  <Image
                    source={{ uri: 'file://' + photo }}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Icon name="camera" color="#FFFFFF" size={30} />
                )}
              </Pressable>

              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-white">
                  {photo ? 'Photo added' : 'Add a photo'}
                </Text>
                <Text className="text-sm text-white/85">
                  A clear, front-facing photo makes the profile easier to
                  recognize.
                </Text>

                <View className="mt-3 flex-row" style={{ gap: 8 }}>
                  <Pressable
                    onPress={handleOpenCamera}
                    className="flex-row items-center rounded-full bg-white px-4 py-2 active:opacity-80"
                  >
                    <Icon name="camera" color={GREEN} size={14} />
                    <Text className="ml-1.5 text-xs font-bold text-[#5D8736]">
                      {photo ? 'Retake' : 'Take photo'}
                    </Text>
                  </Pressable>
                  {photo ? (
                    <Pressable
                      onPress={() => setPhoto(null)}
                      className="rounded-full bg-white/25 px-4 py-2 active:opacity-80"
                    >
                      <Text className="text-xs font-bold text-white">
                        Remove
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          </LinearGradient>
        </Enter>

        {/* Details */}
        <Enter
          index={1}
          className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  complete
                    ? 'bg-[#5D8736]'
                    : 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25'
                }`}
              >
                <Icon
                  name="user"
                  color={complete ? '#FFFFFF' : GREEN}
                  size={16}
                />
              </View>
              <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
                Personal details
              </Text>
            </View>
            <View className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-700">
              <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {doneCount}/{required.length} required
              </Text>
            </View>
          </View>

          <View className="flex-row" style={{ gap: 8 }}>
            <Field label="Last name" className="mb-3 flex-1">
              <TextInput
                placeholder="Last name"
                placeholderTextColor={placeholderColor}
                value={violator.last_name}
                onChangeText={text => handleChange('last_name', text)}
                autoCapitalize="words"
                className={INPUT}
              />
            </Field>
            <Field label="First name" className="mb-3 flex-1">
              <TextInput
                placeholder="First name"
                placeholderTextColor={placeholderColor}
                value={violator.first_name}
                onChangeText={text => handleChange('first_name', text)}
                autoCapitalize="words"
                className={INPUT}
              />
            </Field>
          </View>

          <View className="flex-row" style={{ gap: 8 }}>
            <Field label="Age" className="mb-3 w-24">
              <TextInput
                placeholder="Age"
                placeholderTextColor={placeholderColor}
                value={violator.age}
                keyboardType="number-pad"
                maxLength={3}
                // digits only
                onChangeText={text =>
                  handleChange('age', text.replace(/\D/g, ''))
                }
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

          <Field label="Address (optional)" className="mb-0">
            <TextInput
              placeholder="Street, purok or landmark"
              placeholderTextColor={placeholderColor}
              value={violator.address}
              onChangeText={text => handleChange('address', text)}
              className={INPUT}
            />
          </Field>
        </Enter>
      </ScrollView>

      {/* Save bar */}
      <View
        className="border-t border-gray-200 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-900"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save violator"
          className={`h-12 items-center justify-center rounded-2xl active:opacity-80 ${
            complete ? 'bg-[#5D8736]' : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              className={`text-base font-bold ${
                complete ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Save violator
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CreateViolatorProfile;

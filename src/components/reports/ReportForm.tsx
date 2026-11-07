import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useColorScheme } from 'nativewind';
import useCategories from '../../hooks/useCategory';
import useIncidentType from '../../hooks/useIncidentType';
import useZones from '../../hooks/useZone';
import useLocations from '../../hooks/useLocations';
import { Category } from '../../types/CategoryType';
import { Zone } from '../../types/ZoneType';
import { Location } from '../../types/LocationType';
import { IncidentType } from '../../types/IncidentType';
import useAppStore from '../../../store/useAppStore';
import { useCameraPermission } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import usePhotoStore from '../../../store/usePhotoStore';
import useResponseStore from '../../../store/useResponseStore';
import { useMutation } from '@tanstack/react-query';
import { fileReport } from '../../../util/postFileReport';
import { useQueryClient } from '@tanstack/react-query';
import { Evidence } from '../../types/Evidence';
import { FileReport } from '../../types/FileReport';
import { Violator } from '../../types/ViolatorType';
import useInvolveViolator from '../../../store/useInvolveViolatorState';
import Icon, { IconName } from '../Icon';
import Enter from '../Enter';
import { SelectField, DatePickerSheet, TimePickerSheet } from '../Pickers';

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'report_form'
>;

const GREEN = '#5D8736';

/* ---------- small UI pieces ---------- */

// `index` sets the order the cards come in
const Card = ({
  icon,
  title,
  tag,
  done,
  action,
  index = 0,
  children,
}: {
  icon: IconName;
  title: string;
  tag?: 'Required' | 'Optional';
  /** fills the icon badge once the section is complete */
  done?: boolean;
  action?: React.ReactNode;
  index?: number;
  children: React.ReactNode;
}) => (
  <Enter
    index={index}
    className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
  >
    <View className="mb-3 flex-row items-center justify-between">
      <View className="mr-2 flex-1 flex-row items-center">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            done ? 'bg-[#5D8736]' : 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25'
          }`}
        >
          <Icon name={icon} color={done ? '#FFFFFF' : GREEN} size={16} />
        </View>
        <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
        {tag ? (
          <View className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 dark:bg-slate-700">
            <Text className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
              {tag}
            </Text>
          </View>
        ) : null}
      </View>
      {action}
    </View>
    {children}
  </Enter>
);

const PickButton = ({
  icon,
  label,
  placeholder,
  value,
  onPress,
  quickOptions,
}: {
  icon: IconName;
  label: string;
  placeholder: string;
  /** text to show once something is picked ('' = nothing picked yet) */
  value: string;
  onPress: () => void;
  /** optional one-tap shortcuts shown under the button */
  quickOptions?: { label: string; onPress: () => void }[];
}) => {
  const filled = Boolean(value);

  return (
    <View>
      <Pressable
        onPress={onPress}
        className={`flex-row items-center rounded-xl border p-3 active:opacity-80 ${
          filled
            ? 'border-lime-600 bg-lime-50 dark:bg-lime-900/20'
            : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-900'
        }`}
      >
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${
            filled ? 'bg-lime-600' : 'bg-lime-100 dark:bg-lime-900/40'
          }`}
        >
          <Icon
            name={icon}
            tone="lime"
            color={filled ? '#FFFFFF' : undefined}
            size={20}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[11px] text-gray-500 dark:text-gray-400">
            {label}
          </Text>
          <Text
            numberOfLines={1}
            className={`text-base font-semibold ${
              filled
                ? 'text-gray-800 dark:text-white'
                : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            {value || placeholder}
          </Text>
        </View>
        <Icon name="chevron-right" tone="muted" size={18} />
      </Pressable>

      {quickOptions && quickOptions.length > 0 && (
        <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
          {quickOptions.map(option => (
            <Pressable
              key={option.label}
              onPress={option.onPress}
              className="rounded-full border border-lime-600 px-3 py-1 active:opacity-70"
            >
              <Text className="text-xs font-semibold text-lime-700 dark:text-lime-400">
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const pad = (n: number) => String(n).padStart(2, '0');
// local date (toISOString() would shift the day for users ahead of UTC)
const toLocalDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "2026-11-04" -> "Nov 4, 2026" (what the user sees; the form still stores YYYY-MM-DD)
const formatDisplayDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

const formatDuration = (sec?: number | null) => {
  if (sec == null || !Number.isFinite(sec)) return '--';
  return `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}`;
};

/* ---------- screen ---------- */

const ReportForm = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const { user, token, base_url } = useAppStore();
  const {
    distance,
    responseTime,
    requestId,
    setDistance,
    setResponseTime,
    setRequestId,
    resetNavigation,
  } = useResponseStore();
  const { involveViolator, clearInvolveViolator } = useInvolveViolator();
  const { data: categories } = useCategories();
  const { data: incidentTypes } = useIncidentType();
  const { data: zones } = useZones();
  const { data: locations } = useLocations();
  const { hasPermission, requestPermission } = useCameraPermission();
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { evidence, clearEvidence } = usePhotoStore();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('');
  const [zone, setZone] = useState('');

  const [formData, setFormData] = useState<{
    incident_type_id: string;
    date: string;
    time: string;
    location_id: string;
    report_description: string;
    user_id: number | undefined;
    evidence: Evidence[];
    violators: Violator[];
    request_id: number | null;
    distance: number | null;
    response_time: number | null;
  }>({
    incident_type_id: '',
    date: '',
    time: '',
    location_id: '',
    report_description: '',
    user_id: user?.id,
    evidence: [],
    violators: [],
    request_id: requestId,
    distance: distance,
    response_time: responseTime,
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      evidence: evidence,
      violators: involveViolator,
    }));
  }, [evidence, involveViolator]);

  const CreateReport = useMutation({
    mutationFn: fileReport,
    onSuccess: () => {
      Alert.alert('Report submitted', 'Your incident report was filed.');
      setFormData({
        incident_type_id: '',
        date: '',
        time: '',
        location_id: '',
        report_description: '',
        user_id: user?.id,
        evidence: [],
        violators: [],
        request_id: null,
        distance: null,
        response_time: null,
      });
      clearEvidence();
      clearInvolveViolator();
      setDistance(0);
      setResponseTime(0);
      setRequestId(null);
      resetNavigation();
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['incident_locations'] });
      queryClient.invalidateQueries({ queryKey: ['request'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert(
        'Could not submit',
        error?.message ?? 'Something went wrong. Please try again.',
      );
    },
  });

  // the four details a report can't be filed without
  const required = [
    { label: 'Type', done: Boolean(formData.incident_type_id) },
    { label: 'Location', done: Boolean(formData.location_id) },
    { label: 'Date', done: Boolean(formData.date) },
    { label: 'Time', done: Boolean(formData.time) },
  ];
  const doneCount = required.filter(r => r.done).length;
  const complete = doneCount === required.length;

  const handleSubmit = () => {
    if (!complete) {
      const missing = required.filter(r => !r.done).map(r => r.label);
      Alert.alert('Incomplete form', `Please fill in: ${missing.join(', ')}.`);
      return;
    }

    const payload: FileReport = {
      incident_type_id: formData.incident_type_id,
      date: formData.date,
      time: formData.time,
      location_id: formData.location_id,
      report_description: formData.report_description,
      user_id: formData.user_id,
      evidence: evidence,
      violators: involveViolator,
      request_id: requestId,
      distance: distance,
      response_time: responseTime,
    };
    CreateReport.mutate({ base_url, token, formData: payload });
  };

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  // shortcuts used by the quick options
  const setDateTo = (d: Date) =>
    setFormData(prev => ({ ...prev, date: toLocalDate(d) }));
  const setTimeTo = (d: Date) =>
    setFormData(prev => ({
      ...prev,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

  const handleConfirmDate = (selectedDate: Date) => {
    setDateTo(selectedDate);
    hideDatePicker();
  };

  const handleConfirmTime = (selectedTime: Date) => {
    setTimeTo(selectedTime);
    hideTimePicker();
  };

  const filterIncident = incidentTypes?.filter(
    (incident: IncidentType) => incident?.category_id?.toString() === category,
  );

  const filterLocations = locations?.filter(
    (location: Location) => location?.zone_id?.toString() === zone,
  );

  const handleOpenCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    navigation.navigate('camera', { status: 'evidence' });
  };

  const placeholderColor = isDark ? '#94A3B8' : '#9CA3AF';
  const descriptionLength = formData.report_description.trim().length;

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
            File a report
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Fill out the form to report an incident
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
        {/* Progress */}
        <Enter index={0} className="mb-3">
          <LinearGradient
            colors={['#A9C46C', '#5D8736']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-white">
                  {complete ? 'Ready to submit' : 'Report an incident'}
                </Text>
                <Text className="text-sm text-white/85">
                  {complete
                    ? 'All required details are filled in.'
                    : 'Fill in the required details below.'}
                </Text>
              </View>
              <Text className="text-3xl font-bold text-white">
                {doneCount}/{required.length}
              </Text>
            </View>

            <View className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${(doneCount / required.length) * 100}%` }}
              />
            </View>

            <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
              {required.map(r => (
                <View
                  key={r.label}
                  className={`flex-row items-center rounded-full px-3 py-1 ${
                    r.done ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  <View
                    className={`mr-1.5 h-2 w-2 rounded-full ${
                      r.done ? 'bg-[#5D8736]' : 'bg-white/60'
                    }`}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      r.done ? 'text-[#5D8736]' : 'text-white'
                    }`}
                  >
                    {r.label}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Enter>

        {/* Linked response request */}
        {requestId !== null && requestId !== undefined && (
          <Enter
            index={1}
            className="mb-3 flex-row items-center rounded-2xl border border-lime-600 bg-lime-50 p-3 dark:bg-lime-900/20"
          >
            <View className="mr-3">
              <Icon name="alert-circle" tone="lime" size={22} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-lime-800 dark:text-lime-300">
                Linked to a response request
              </Text>
              <Text className="text-xs text-lime-700 dark:text-lime-400">
                Distance: {distance != null ? `${distance} km` : '--'} ·
                Response time: {formatDuration(responseTime)}
              </Text>
            </View>
          </Enter>
        )}

        {/* Incident */}
        <Card
          icon="alert-triangle"
          title="Incident"
          tag="Required"
          done={Boolean(formData.incident_type_id)}
          index={1}
        >
          <SelectField
            label="Category"
            value={category}
            onChange={value => {
              setCategory(value);
              // the type list depends on the category
              setFormData(prev => ({ ...prev, incident_type_id: '' }));
            }}
            placeholder="Select incident category"
            items={
              categories?.map((cat: Category) => ({
                label: cat.category_name,
                value: cat.id.toString(),
              })) ?? []
            }
          />
          <SelectField
            label="Type"
            value={formData.incident_type_id}
            onChange={value =>
              setFormData(prev => ({ ...prev, incident_type_id: value }))
            }
            placeholder={
              category ? 'Select incident type' : 'Choose a category first'
            }
            items={
              filterIncident?.map((incident: IncidentType) => ({
                label: incident.incident_name,
                value: incident.id.toString(),
              })) ?? []
            }
            enabled={Boolean(category)}
          />
        </Card>

        {/* Location */}
        <Card
          icon="map-pin"
          title="Location"
          tag="Required"
          done={Boolean(formData.location_id)}
          index={2}
          action={
            <Pressable
              onPress={() => navigation.navigate('location_form')}
              hitSlop={8}
              className="active:opacity-70"
            >
              <Text className="text-xs font-bold text-lime-600">
                + Add location
              </Text>
            </Pressable>
          }
        >
          <SelectField
            label="Zone"
            value={zone}
            onChange={value => {
              setZone(value);
              // the location list depends on the zone
              setFormData(prev => ({ ...prev, location_id: '' }));
            }}
            placeholder="Select zone"
            items={
              zones?.map((z: Zone) => ({
                label: z.zone_name,
                value: z.id.toString(),
              })) ?? []
            }
          />
          <SelectField
            label="Location"
            value={formData.location_id}
            onChange={value =>
              setFormData(prev => ({ ...prev, location_id: value }))
            }
            placeholder={zone ? 'Select location' : 'Choose a zone first'}
            items={
              filterLocations?.map((location: Location) => ({
                label: location.location_name,
                value: location.id.toString(),
              })) ?? []
            }
            enabled={Boolean(zone)}
          />
        </Card>

        {/* When */}
        <Card
          icon="clock"
          title="When did it happen?"
          tag="Required"
          done={Boolean(formData.date && formData.time)}
          index={3}
        >
          <View style={{ gap: 12 }}>
            <PickButton
              icon="calendar"
              label="Date"
              placeholder="Select date"
              value={formData.date ? formatDisplayDate(formData.date) : ''}
              onPress={showDatePicker}
              quickOptions={[
                { label: 'Today', onPress: () => setDateTo(new Date()) },
                {
                  label: 'Yesterday',
                  onPress: () =>
                    setDateTo(new Date(Date.now() - 24 * 60 * 60 * 1000)),
                },
              ]}
            />
            <PickButton
              icon="clock"
              label="Time"
              placeholder="Select time"
              value={formData.time}
              onPress={showTimePicker}
              quickOptions={[
                { label: 'Now', onPress: () => setTimeTo(new Date()) },
              ]}
            />
          </View>
          <DatePickerSheet
            visible={isDatePickerVisible}
            value={formData.date}
            onConfirm={handleConfirmDate}
            onClose={hideDatePicker}
          />
          <TimePickerSheet
            visible={isTimePickerVisible}
            value={formData.time}
            onConfirm={handleConfirmTime}
            onClose={hideTimePicker}
          />
        </Card>

        {/* Violators */}
        <Card
          icon="users"
          title="Involved violators"
          tag="Optional"
          done={involveViolator.length > 0}
          index={4}
          action={
            involveViolator.length > 0 ? (
              <Pressable
                onPress={() => clearInvolveViolator()}
                hitSlop={8}
                className="active:opacity-70"
              >
                <Text className="text-xs font-semibold text-red-500">
                  Clear
                </Text>
              </Pressable>
            ) : undefined
          }
        >
          {involveViolator.length > 0 ? (
            <View className="mb-3" style={{ gap: 8 }}>
              {involveViolator.map((v, i) => (
                <View
                  key={v.id ?? i}
                  className="flex-row items-center rounded-xl bg-gray-50 p-2.5 dark:bg-slate-700"
                >
                  {v.photo ? (
                    <Image
                      source={{ uri: v.photo }}
                      className="h-11 w-11 rounded-full bg-gray-200"
                    />
                  ) : (
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/40">
                      <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
                        {(v.first_name?.[0] ?? '?').toUpperCase()}
                        {(v.last_name?.[0] ?? '').toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                      {v.first_name} {v.last_name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      Age {v.age ?? '—'} · {v?.zone?.zone_name ?? 'No zone'}
                      {v.address ? `, ${v.address}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              No involved violators yet.
            </Text>
          )}
          <Pressable
            onPress={() => navigation.navigate('violators_list')}
            className="items-center rounded-xl border border-lime-600 py-2.5 active:opacity-80"
          >
            <Text className="font-semibold text-lime-700 dark:text-lime-400">
              + Add violators
            </Text>
          </Pressable>
        </Card>

        {/* Description */}
        <Card
          icon="activity"
          title="Description"
          tag="Optional"
          done={descriptionLength > 0}
          index={5}
        >
          <TextInput
            placeholder="What happened, who was involved, and what was done?"
            placeholderTextColor={placeholderColor}
            value={formData.report_description}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, report_description: text }))
            }
            multiline
            textAlignVertical="top"
            className="min-h-[110px] rounded-xl border border-gray-300 bg-white p-3 text-[15px] text-gray-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <Text className="mt-1.5 text-right text-xs text-gray-400 dark:text-gray-500">
            {descriptionLength} characters
          </Text>
        </Card>

        {/* Evidence */}
        <Card
          icon="camera"
          title="Evidence photos"
          tag="Optional"
          done={evidence.length > 0}
          index={6}
          action={
            evidence.length > 0 ? (
              <Pressable
                onPress={() => clearEvidence()}
                hitSlop={8}
                className="active:opacity-70"
              >
                <Text className="text-xs font-semibold text-red-500">
                  Clear all
                </Text>
              </Pressable>
            ) : undefined
          }
        >
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            <Pressable
              onPress={handleOpenCamera}
              accessibilityLabel="Add a photo"
              className="h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-lime-600 active:opacity-80"
            >
              <Icon name="camera" color={GREEN} size={22} />
              <Text className="mt-1 text-xs font-semibold text-lime-700 dark:text-lime-400">
                Add photo
              </Text>
            </Pressable>

            {evidence.map((img, i) => (
              <Image
                key={i}
                source={{ uri: 'file://' + img.incident_evidence }}
                className="h-24 w-24 rounded-xl bg-gray-200"
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Submit bar */}
      <View
        className="border-t border-gray-200 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-900"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={CreateReport.isPending}
          accessibilityRole="button"
          accessibilityLabel="Submit report"
          className={`h-12 items-center justify-center rounded-2xl active:opacity-80 ${
            complete ? 'bg-[#5D8736]' : 'bg-gray-300 dark:bg-slate-600'
          }`}
        >
          {CreateReport.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              className={`text-base font-bold ${
                complete ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Submit report
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ReportForm;

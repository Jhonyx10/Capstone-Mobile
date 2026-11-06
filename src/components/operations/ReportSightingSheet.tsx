import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Alert,
  StyleSheet,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppStore from '../../../store/useAppStore';
import {
  postSightingReport,
  SightingPayload,
} from '../../../util/postSightingReport';
import Icon from '../Icon';

const THEME = '#5D8736';

type LocStatus = 'loading' | 'ready' | 'error';

// Resolves with [lng, lat] from the first GPS fix, or rejects after a timeout
const getCurrentCoords = async (
  timeoutMs = 12000,
): Promise<[number, number]> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('permission');
    }
  }

  return new Promise((resolve, reject) => {
    let done = false;
    let listener:
      | ((l: { coords?: { latitude: number; longitude: number } }) => void)
      | null = null;

    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (listener) Mapbox.locationManager.removeListener(listener);
      fn();
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error('timeout'))),
      timeoutMs,
    );

    listener = location => {
      const c = location?.coords;
      if (c) finish(() => resolve([c.longitude, c.latitude]));
    };
    Mapbox.locationManager.addListener(listener);
  });
};

// Laravel validation errors arrive as { message, errors: { field: [msg] } }
const errorMessage = (err: any): string => {
  const errors = err?.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors)[0] as string[] | undefined;
    if (first?.[0]) return first[0];
  }
  return (
    err?.response?.data?.message ??
    "Couldn't send the report. Please try again."
  );
};

interface Props {
  visible: boolean;
  onClose: () => void;
  subjectId: number;
  subjectLabel: string;
}

const Label = ({ children }: { children: string }) => (
  <Text className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
    {children}
  </Text>
);

const ReportSightingSheet = ({
  visible,
  onClose,
  subjectId,
  subjectLabel,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? '#94A3B8' : '#9CA3AF';
  const queryClient = useQueryClient();
  const token = useAppStore(s => s.token);
  const base_url = useAppStore(s => s.base_url);

  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [locStatus, setLocStatus] = useState<LocStatus>('loading');
  const [locError, setLocError] = useState<string | null>(null);
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const runId = useRef(0); // ignores stale location results after close/refresh

  const mutation = useMutation({
    mutationFn: (payload: SightingPayload) =>
      postSightingReport({ base_url, token, payload }),
    onSuccess: () => {
      // refreshes the details screen (sightings list + map)
      queryClient.invalidateQueries({ queryKey: ['watch-list'] });
      onClose();
      Alert.alert(
        'Sighting reported',
        'Thank you. It now shows in the history.',
      );
    },
    onError: err => setFormError(errorMessage(err)),
  });

  const locate = async () => {
    const id = ++runId.current;
    setLocStatus('loading');
    setLocError(null);
    try {
      const c = await getCurrentCoords();
      if (id !== runId.current) return;
      setCoords(c);
      setLocStatus('ready');
    } catch (e: any) {
      if (id !== runId.current) return;
      setLocStatus('error');
      setLocError(
        e?.message === 'permission'
          ? 'Location permission is turned off for this app.'
          : 'Make sure GPS is on, then try again.',
      );
    }
  };

  // fresh form + fresh GPS fix every time the sheet opens
  useEffect(() => {
    if (visible) {
      setPlace('');
      setNote('');
      setFormError(null);
      setCoords(null);
      mutation.reset();
      locate();
    } else {
      runId.current += 1;
    }
  }, [visible]);

  const submit = () => {
    if (!coords || mutation.isPending) return;
    setFormError(null);

    mutation.mutate({
      subject_id: subjectId,
      latitude: coords[1],
      longitude: coords[0],
      location:
        place.trim() || `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
  };
  
  const sending = mutation.isPending;
  const canSubmit = locStatus === 'ready' && !!coords && !sending;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* tap outside to close */}
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.4)' },
          ]}
          onPress={onClose}
          accessibilityLabel="Close"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            className="rounded-t-3xl bg-white px-5 pt-5 dark:bg-slate-800"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {/* header */}
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Report a sighting
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  {subjectLabel}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Cancel
                </Text>
              </Pressable>
            </View>

            {/* location */}
            <Label>Location</Label>
            <View className="flex-row items-center rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#5D8736]/10 dark:bg-[#5D8736]/25">
                <Icon name="map-pin" color={THEME} size={18} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {locStatus === 'loading'
                    ? 'Getting your location...'
                    : locStatus === 'ready'
                    ? 'Your current location'
                    : "Couldn't get your location"}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {locStatus === 'ready' && coords
                    ? `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`
                    : locStatus === 'error'
                    ? locError
                    : 'This can take a few seconds.'}
                </Text>
              </View>
              {locStatus === 'loading' ? (
                <ActivityIndicator color={THEME} />
              ) : (
                <Pressable
                  onPress={locate}
                  hitSlop={8}
                  accessibilityLabel="Refresh location"
                  className="h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-80 dark:bg-slate-700"
                >
                  <Icon name="refresh-cw" tone="neutral" size={16} />
                </Pressable>
              )}
            </View>

            {/* place */}
            <Label>Place or landmark (optional)</Label>
            <TextInput
              value={place}
              onChangeText={setPlace}
              placeholder="e.g. Near the basketball court"
              placeholderTextColor={placeholderColor}
              maxLength={150}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-base text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />

            {/* note */}
            <Label>Note (optional)</Label>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What did you see? What were they doing or wearing?"
              placeholderTextColor={placeholderColor}
              multiline
              maxLength={500}
              textAlignVertical="top"
              style={{ minHeight: 90 }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-base text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />

            {formError ? (
              <Text className="mt-3 text-sm text-red-600 dark:text-red-400">
                {formError}
              </Text>
            ) : null}

            {/* submit */}
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel="Submit sighting"
              className={`mt-5 flex-row items-center justify-center rounded-2xl py-4 active:opacity-80 ${
                canSubmit ? 'bg-[#5D8736]' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Submit sighting
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ReportSightingSheet;

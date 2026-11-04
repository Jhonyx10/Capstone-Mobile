import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Icon from './Icon';

/**
 * Themed pickers that open as a bottom sheet:
 *  - SelectField      (replaces the native dropdown <Picker>)
 *  - DatePickerSheet  (month calendar)
 *  - TimePickerSheet  (hour / minute / AM-PM)
 * Built only with React Native's own Modal, so no extra packages are needed.
 */

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const parseIso = (value: string) => {
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
};
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

/* ---------- bottom sheet ---------- */

const Sheet = ({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* dark backdrop: tap to close */}
        <Pressable
          onPress={onClose}
          className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
        />

        <View
          className="rounded-t-3xl bg-white dark:bg-slate-800"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            maxHeight: '80%',
          }}
        >
          <View className="items-center pt-2">
            <View className="h-1 w-10 rounded-full bg-gray-300 dark:bg-slate-600" />
          </View>
          <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
            <Text className="text-base font-bold text-gray-800 dark:text-white">
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700"
            >
              <Icon name="x" tone="neutral" size={16} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

/* ---------- select (dropdown replacement) ---------- */

export const SelectField = ({
  label,
  value,
  onChange,
  placeholder,
  items,
  enabled = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  items: { label: string; value: string }[];
  enabled?: boolean;
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = items.find(item => item.value === value);
  const showSearch = items.length > 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? items.filter(item => item.label.toLowerCase().includes(q))
      : items;
  }, [items, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View className="mb-3">
      <Text className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
        {label}
      </Text>

      <TouchableOpacity
        disabled={!enabled}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        className={`h-12 flex-row items-center justify-between rounded-lg border px-3 ${
          selected
            ? 'border-lime-600 bg-lime-50 dark:bg-lime-900/20'
            : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-900'
        } ${enabled ? '' : 'opacity-50'}`}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 pr-2 text-[15px] ${
            selected
              ? 'font-semibold text-gray-800 dark:text-white'
              : 'text-gray-400 dark:text-slate-500'
          }`}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name="chevron-down" tone="muted" size={18} />
      </TouchableOpacity>

      <Sheet visible={open} title={label} onClose={close}>
        {showSearch && (
          <View className="px-4 pb-2">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </View>
        )}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
        >
          {filtered.length === 0 ? (
            <Text className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No options available.
            </Text>
          ) : (
            filtered.map(item => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  activeOpacity={0.7}
                  className={`mb-1 flex-row items-center justify-between rounded-xl px-3 py-3.5 ${
                    isSelected ? 'bg-lime-100 dark:bg-lime-900/30' : ''
                  }`}
                >
                  <Text
                    className={`flex-1 pr-2 text-[15px] ${
                      isSelected
                        ? 'font-bold text-lime-800 dark:text-lime-300'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {isSelected && <Icon name="check" tone="lime" size={18} />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </Sheet>
    </View>
  );
};

/* ---------- date picker ---------- */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const DatePickerSheet = ({
  visible,
  value,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  /** YYYY-MM-DD, or '' when nothing is picked */
  value: string;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}) => {
  const [month, setMonth] = useState(() =>
    firstOfMonth(value ? parseIso(value) : new Date()),
  );

  // jump to the picked month (or this month) every time the sheet opens
  useEffect(() => {
    if (visible) setMonth(firstOfMonth(value ? parseIso(value) : new Date()));
  }, [visible]);

  const today = startOfToday();
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) =>
    cells.slice(r * 7, r * 7 + 7),
  );

  const atCurrentMonth = year === today.getFullYear() && m === today.getMonth();

  return (
    <Sheet visible={visible} title="Select date" onClose={onClose}>
      <View className="px-4 pb-2">
        {/* month switcher */}
        <View className="mb-2 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setMonth(new Date(year, m - 1, 1))}
            activeOpacity={0.7}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700"
          >
            <Icon name="chevron-left" tone="neutral" size={18} />
          </TouchableOpacity>
          <Text className="text-[15px] font-bold text-gray-800 dark:text-white">
            {MONTHS[m]} {year}
          </Text>
          <TouchableOpacity
            disabled={atCurrentMonth}
            onPress={() => setMonth(new Date(year, m + 1, 1))}
            activeOpacity={0.7}
            className={`h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 ${
              atCurrentMonth ? 'opacity-30' : ''
            }`}
          >
            <Icon name="chevron-right" tone="neutral" size={18} />
          </TouchableOpacity>
        </View>

        {/* weekday header */}
        <View className="mb-1 flex-row">
          {WEEKDAYS.map((day, i) => (
            <Text
              key={i}
              className="flex-1 text-center text-xs font-semibold text-gray-400 dark:text-slate-500"
            >
              {day}
            </Text>
          ))}
        </View>

        {/* days */}
        {rows.map((row, r) => (
          <View key={r} className="flex-row">
            {row.map((day, c) => {
              if (day === null) return <View key={c} className="flex-1" />;

              const date = new Date(year, m, day);
              const disabled = date > today; // reports can't be in the future
              const selected = iso(date) === value;
              const isToday = iso(date) === iso(today);

              return (
                <TouchableOpacity
                  key={c}
                  disabled={disabled}
                  onPress={() => onConfirm(date)}
                  activeOpacity={0.7}
                  className="flex-1 items-center py-1"
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      selected
                        ? 'bg-lime-600'
                        : isToday
                        ? 'border border-lime-600'
                        : ''
                    }`}
                  >
                    <Text
                      className={`text-[15px] ${
                        selected
                          ? 'font-bold text-white'
                          : disabled
                          ? 'text-gray-300 dark:text-slate-600'
                          : 'text-gray-800 dark:text-white'
                      }`}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </Sheet>
  );
};

/* ---------- time picker ---------- */

const parseTime = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])?/);
  if (!match) {
    const now = new Date();
    return { h24: now.getHours(), minute: now.getMinutes() };
  }
  let h24 = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && h24 < 12) h24 += 12;
  if (ampm === 'AM' && h24 === 12) h24 = 0;
  return { h24, minute };
};

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <View className="w-1/6 p-0.5">
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`items-center rounded-lg py-2.5 ${
        active ? 'bg-lime-600' : 'bg-gray-100 dark:bg-slate-700'
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          active ? 'text-white' : 'text-gray-800 dark:text-gray-100'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);

export const TimePickerSheet = ({
  visible,
  value,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  /** time text like "03:30 PM" or "15:30", or '' when nothing is picked */
  value: string;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}) => {
  const [hour12, setHour12] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);

  // load the current value (or the time right now) every time the sheet opens
  useEffect(() => {
    if (!visible) return;
    const { h24, minute: min } = parseTime(value);
    setHour12(h24 % 12 === 0 ? 12 : h24 % 12);
    setMinute(min);
    setIsPM(h24 >= 12);
  }, [visible]);

  const confirm = () => {
    const date = new Date();
    date.setHours((hour12 % 12) + (isPM ? 12 : 0), minute, 0, 0);
    onConfirm(date);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Sheet visible={visible} title="Select time" onClose={onClose}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* big preview + AM/PM */}
        <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-lime-50 p-4 dark:bg-lime-900/20">
          <Text className="text-4xl font-bold text-lime-700 dark:text-lime-400">
            {pad(hour12)}:{pad(minute)}
          </Text>
          <View className="flex-row overflow-hidden rounded-lg border border-lime-600">
            {['AM', 'PM'].map(label => {
              const active = (label === 'PM') === isPM;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => setIsPM(label === 'PM')}
                  activeOpacity={0.8}
                  className={`px-4 py-2 ${active ? 'bg-lime-600' : ''}`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      active ? 'text-white' : 'text-lime-700 dark:text-lime-400'
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* hour */}
        <Text className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
          Hour
        </Text>
        <View className="mb-3 flex-row flex-wrap">
          {hours.map(h => (
            <Chip
              key={h}
              label={String(h)}
              active={h === hour12}
              onPress={() => setHour12(h)}
            />
          ))}
        </View>

        {/* minute */}
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Minute
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setMinute(prev => (prev + 59) % 60)}
              activeOpacity={0.7}
              className="rounded-full border border-lime-600 px-3 py-0.5"
            >
              <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
                −1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMinute(prev => (prev + 1) % 60)}
              activeOpacity={0.7}
              className="rounded-full border border-lime-600 px-3 py-0.5"
            >
              <Text className="text-xs font-bold text-lime-700 dark:text-lime-400">
                +1
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-4 flex-row flex-wrap">
          {minutes.map(min => (
            <Chip
              key={min}
              label={pad(min)}
              active={min === minute}
              onPress={() => setMinute(min)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={confirm}
          activeOpacity={0.8}
          className="h-12 items-center justify-center rounded-xl bg-lime-600"
        >
          <Text className="text-base font-bold text-white">Set time</Text>
        </TouchableOpacity>
      </ScrollView>
    </Sheet>
  );
};

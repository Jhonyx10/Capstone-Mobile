import { View, Text } from 'react-native';
import { STATUS_STYLES } from '../../util/operationHelper';
import type { OperationStatus } from '../types/OperationType';

// Colors live here so every status always has a visible background and text
// color. They match the date tile on the operation card.
const PILL: Record<OperationStatus, { box: string; text: string }> = {
  upcoming: {
    box: 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25',
    text: 'text-[#5D8736] dark:text-lime-400',
  },
  active: {
    box: 'bg-[#5D8736]',
    text: 'text-white',
  },
  completed: {
    box: 'bg-gray-100 dark:bg-slate-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
  suspended: {
    box: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
};

const StatusPill = ({ status }: { status: OperationStatus }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.upcoming;
  const tone = PILL[status] ?? { box: s.pill, text: s.text };

  return (
    <View className={`rounded-full px-3 py-1 ${tone.box}`}>
      <Text className={`text-xs font-semibold ${tone.text}`}>{s.label}</Text>
    </View>
  );
};

export default StatusPill;

import { View, Text } from 'react-native';
import { STATUS_STYLES } from '../../util/operationHelper';
import type { OperationStatus } from '../types/OperationType';

const StatusPill = ({ status }: { status: OperationStatus }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.upcoming;
  return (
    <View className={`px-3 py-1 rounded-full ${s.pill}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  );
};

export default StatusPill;

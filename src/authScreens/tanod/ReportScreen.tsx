import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import ReportCard from '../../components/reports/ReportCard';
import Enter from '../../components/Enter';
import useAppStore from '../../../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';

const ReportScreen = () => {
  type ReportFormNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'report'
  >;
  const navigation = useNavigation<ReportFormNavigationProp>();
  const reportCount = useAppStore(state => state.reports.length);

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
        <View>
          <Text className="text-xl font-bold text-gray-800 dark:text-white">
            Reports
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {reportCount} {reportCount === 1 ? 'report' : 'reports'} in total
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-lg bg-lime-600 px-4 py-2.5"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('report_form')}
        >
          <Text className="text-sm font-bold text-white">+ File Report</Text>
        </TouchableOpacity>
      </Enter>

      {/* List */}
      {/* List (each row animates itself, see ReportCard.tsx) */}
      <View className="flex-1">
        <ReportCard />
      </View>
    </SafeAreaView>
  );
};

export default ReportScreen;

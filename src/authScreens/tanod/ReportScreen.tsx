<<<<<<< HEAD:src/authScreens/ReportScreen.tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import ReportCard from '../components/reports/ReportCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
=======
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ReportCard from '../../components/reports/ReportCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation"; 
>>>>>>> f1fffad76b1cf7f5dabfae35bb2f9ccc3a55255b:src/authScreens/tanod/ReportScreen.tsx

const ReportScreen = () => {
  type ReportFormNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'report'
  >;
  const navigation = useNavigation<ReportFormNavigationProp>();

  return (
    <SafeAreaView className="flex-1 dark:bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white border-b border-gray-300 p-4 dark:bg-slate-900 dark:border-slate-700">
        <Text className="text-xl font-bold dark:text-white">Violators</Text>

        <TouchableOpacity
          className="px-4 py-2 rounded-lg bg-sky-400"
          onPress={() => navigation.navigate('report_form')}
        >
          <Text className="text-sm font-bold text-white">+ File Report</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View className="flex-1 px-3 pt-2">
        <ReportCard />
      </View>
    </SafeAreaView>
  );
};

export default ReportScreen;

import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import useAppStore from '../../../store/useAppStore';
import Violators from '../../components/violators/Violators';
import Enter from '../../components/Enter';

const ViolatorScreen = () => {
  type ViolatorFormNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'violator'
  >;
  const navigation = useNavigation<ViolatorFormNavigationProp>();
  const violatorCount = useAppStore(state => state.violators.length);

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
            Violators
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {violatorCount} {violatorCount === 1 ? 'person' : 'people'} on
            record
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-lg bg-lime-600 px-4 py-2.5"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('violator_form')}
        >
          <Text className="text-sm font-bold text-white">+ Add Violator</Text>
        </TouchableOpacity>
      </Enter>

      {/* List (each row animates itself, see Violators.tsx) */}
      <View className="flex-1 px-3 pt-2">
        <Violators />
      </View>
    </SafeAreaView>
  );
};
export default ViolatorScreen;

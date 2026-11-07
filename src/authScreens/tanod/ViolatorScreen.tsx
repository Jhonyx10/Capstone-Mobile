import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation';
import Violators from '../../components/violators/Violators';
import Enter from '../../components/Enter';
import Icon from '../../components/Icon';

type ViolatorFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'violator'
>;

const ViolatorScreen = () => {
  const navigation = useNavigation<ViolatorFormNavigationProp>();

  return (
    <SafeAreaView
      className="flex-1 bg-[#f4f4f4] dark:bg-slate-900"
      edges={['top']}
    >
      {/* Header */}
      <Enter from="top" className="px-4 pb-2 pt-3">
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Violators
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          People with violation records on file
        </Text>
      </Enter>

      {/* List (summary, search and rows live in Violators.tsx) */}
      <View className="flex-1">
        <Violators />
      </View>

      {/* Floating action */}
      <Pressable
        onPress={() => navigation.navigate('violator_form')}
        accessibilityRole="button"
        accessibilityLabel="Add a violator"
        className="flex-row items-center rounded-full bg-[#5D8736] px-5 py-3.5 active:opacity-80"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 84, // above the floating tab bar
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Icon name="user" size={18} strokeWidth={2.4} color="#FFFFFF" />
        <Text className="ml-2 text-sm font-bold text-white">Add violator</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default ViolatorScreen;

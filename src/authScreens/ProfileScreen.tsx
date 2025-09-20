import { View, Text, Button } from 'react-native';
import useAppStore from '../../store/useAppStore';
import LogoutBtn from '../components/LogoutBtn';
import { useColorScheme } from 'nativewind';

const ProfileScreen = () => {
  const { user } = useAppStore();
  const { toggleColorScheme } = useColorScheme();
  return (
    <View className="flex-1 items-center justify-center bg-[f2f2f2] dark:bg-slate-900">
      <Text className="text-lg font-bold text-black dark:text-white">
        Profile Page
      </Text>
      <Text className="text-black dark:text-gray-300">{user.name}</Text>
      <Text className="text-black dark:text-gray-300">{user.email}</Text>
      <Text className="text-black dark:text-gray-300">{user.role}</Text>
      <LogoutBtn />

      <View className="mt-4">
        <Button title="Toggle Theme" onPress={toggleColorScheme} />
      </View>
    </View>
  );
};

export default ProfileScreen;

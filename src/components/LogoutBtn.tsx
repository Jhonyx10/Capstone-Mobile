import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Logout } from '../../util/Logout';
import useAppStore from '../../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox from '@rnmapbox/maps';
import echo from '../../echo';
import Icon from './Icon';

type LogoutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'welcome'
>;

const LogoutBtn = () => {
  const navigation = useNavigation<LogoutScreenNavigationProp>();
  const setLogin = useAppStore(state => state.setLogin);
  const setUser = useAppStore(state => state.setUser);
  const setToken = useAppStore(state => state.setToken);
  const base_url = useAppStore(state => state.base_url);
  const token = useAppStore(state => state.token); // ✅ grab token before stopping anything

  const clearSession = async () => {
    // Clear Zustand store
    setLogin(false);
    setUser({} as any);
    setToken('');

    // Clear AsyncStorage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    // Navigate to welcome screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'welcome' as never }],
    });
  };

  const LogoutMutation = useMutation({
    mutationFn: Logout,
    onSuccess: async () => {
      await clearSession();
    },
    onError: async error => {
      console.log('Logout API failed:', error);
      // Still clear session even if backend logout fails
      await clearSession();
    },
  });

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          // stop streaming first
          Mapbox.locationManager.stop();
          echo.disconnect();

          // ✅ call logout with saved token
          LogoutMutation.mutate({ base_url, token });
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={LogoutMutation.isPending}
      activeOpacity={0.8}
      className={`h-12 w-full flex-row items-center justify-center rounded-xl border border-red-500 bg-red-50 dark:bg-red-900/20 ${
        LogoutMutation.isPending ? 'opacity-60' : ''
      }`}
    >
      {LogoutMutation.isPending ? (
        <ActivityIndicator color="#EF4444" />
      ) : (
        <>
          <View className="mr-2">
            <Icon name="log-out" tone="red" size={18} />
          </View>
          <Text className="text-base font-bold text-red-600 dark:text-red-400">
            Log out
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default LogoutBtn;

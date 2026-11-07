import { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox from '@rnmapbox/maps';
import echo from '../../echo';
import Icon from './Icon';

const LogoutBtn = () => {
  const setLogin = useAppStore(state => state.setLogin);
  const setUser = useAppStore(state => state.setUser);
  const setToken = useAppStore(state => state.setToken);
  const base_url = useAppStore(state => state.base_url);
  const token = useAppStore(state => state.token); // grab token before clearing anything

  // Stays true until this button unmounts (when the authenticated screens are
  // removed), so the spinner never flips back to "Log out" mid-transition.
  const [loggingOut, setLoggingOut] = useState(false);

  const clearSession = async () => {
    // Flip login first: the authenticated screens unmount right away,
    // so they never re-render with an empty user/token.
    // The navigator swaps to the welcome screen on its own, no navigation.reset needed.
    setLogin(false);

    await AsyncStorage.multiRemove(['token', 'user']);

    setToken('');
    setUser({} as any);
  };

  const LogoutMutation = useMutation({
    mutationFn: Logout,
    onSuccess: async () => {
      await clearSession();
    },
    onError: async error => {
      console.log('Logout API failed:', error);
      // Still clear the session even if the backend logout fails
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
          setLoggingOut(true);

          // stop streaming first
          Mapbox.locationManager.stop();
          echo.disconnect();

          // call logout with the saved token
          LogoutMutation.mutate({ base_url, token });
        },
      },
    ]);
  };

  const busy = loggingOut || LogoutMutation.isPending;

  return (
    <TouchableOpacity
      onPress={handleLogout}
      disabled={busy}
      activeOpacity={0.8}
      className={`h-12 w-full flex-row items-center justify-center rounded-xl border border-red-500 bg-red-50 dark:bg-red-900/20 ${
        busy ? 'opacity-60' : ''
      }`}
    >
      {busy ? (
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

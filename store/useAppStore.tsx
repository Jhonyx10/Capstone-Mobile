import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../src/types/UserType';
import { Report } from '../src/types/ReportType';
import { Violator } from '../src/types/ViolatorType';

interface AppState {
  login: boolean;
  onboarding: boolean;
  token: string;
  user: User;
  reports: Report[];
  violators: Violator[];
  base_url: string;
  setLogin: (login: boolean) => void;
  setOnboarding: (onboarding: boolean) => void;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  setReport: (reports: Report[]) => void;
  setViolators: (violators: Violator[]) => void;
}

const useAppStore = create<AppState>()(
  persist(
    set => ({
      login: false,
      onboarding: true,
      token: '',
      user: {} as User,
      reports: [],
      violators: [],
      base_url: 'http://192.168.1.36:8000/api/',
      setLogin: login => set({ login }),
      setOnboarding: onboarding => set({ onboarding }),
      setToken: async token => {
        await AsyncStorage.setItem('token', token);
        set({ token });
      },
      setUser: user => set({ user }),
      setReport: reports => set({ reports }),
      setViolators: violators => set({ violators }),
      map_styles: {
        light: 'mapbox://styles/mapbox/streets-v12',
        dark: 'mapbox://styles/joy143/cmeuj7k3i00jl01rk90g792d5',
      },
    }),
    {
      name: 'app-storage', // key for AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        login: state.login,
        onboarding: state.onboarding,
        token: state.token,
        user: state.user,
        reports: state.reports,
        violators: state.violators,
      }), // only persist necessary fields
    },
  ),
);

export default useAppStore;

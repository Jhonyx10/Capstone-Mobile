import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { User } from '../src/types/UserType';
import { Report } from '../src/types/ReportType';
import { Violator } from '../src/types/ViolatorType';

interface AppState {
  login: boolean;
  onboarding: boolean;
  token: string;
  user: User | null;
  reports: Report[];
  violators: Violator[];
  base_url: string;
  mapbox_token: string;
  map_styles: { light: string; dark: string };
  status: boolean;
  currentLocation: { latitude: number; longitude: number } | null;
  setLogin: (login: boolean) => void;
  setOnboarding: (onboarding: boolean) => void;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  setReport: (reports: Report[]) => void;
  setViolators: (violators: Violator[]) => void;
  setStatus: (status: boolean) => void;
  setCurrentLocation: (coords: { latitude: number; longitude: number }) => void;
}

// every request builds URLs as `${base_url}path`, so it must end with "/"
const withTrailingSlash = (url?: string) =>
  url ? (url.endsWith('/') ? url : `${url}/`) : '';

const useAppStore = create<AppState>()(
  persist(
    set => ({
      login: false,
      status: false,
      onboarding: true,
      token: '',
      user: null,
      reports: [],
      violators: [],
      // read from .env at build time (BASE_URL=http://10.76.189.34:8000/api/)
      base_url: withTrailingSlash(Config.BASE_URL),
      // read from .env at build time (MAPBOX_TOKEN=pk.xxxx)
      mapbox_token: Config.MAPBOX_TOKEN ?? '',
      currentLocation: null,
      map_styles: {
        light: 'mapbox://styles/mapbox/streets-v12',
        dark: 'mapbox://styles/joy143/cmeuj7k3i00jl01rk90g792d5',
      },
      setLogin: login => set({ login }),
      setOnboarding: onboarding => set({ onboarding }),
      setToken: async token => {
        await AsyncStorage.setItem('token', token);
        set({ token });
      },
      setStatus: status => set({ status }),
      setUser: user => set({ user }),
      setReport: reports => set({ reports }),
      setViolators: violators => set({ violators }),
      setCurrentLocation: coords => set({ currentLocation: coords }),
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

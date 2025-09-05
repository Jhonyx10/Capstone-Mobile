import { create } from 'zustand';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from '../src/types/UserType';
import { Report } from '../src/types/ReportType';
import { Violator } from '../src/types/ViolatorType';

interface AppState {
  login: boolean;
  token: string;
  user: User | null;
  reports: Report[];
  violators: Violator[];
  base_url: string;
  status: boolean;
  setLogin: (login: boolean) => void;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  setReport: (reports: Report[]) => void;
  setViolators: (Violators: Violator[]) => void;
  setStatus: (status: boolean) => void;
}

const useAppStore = create<AppState>((set) => ({
  login: false,
  status: false,
  token: "",
  user: null,
  reports: [],
  violators: [],
  base_url: 'http://10.223.200.34:8080/api/',
  setLogin: (login) => set({ login }),
  setStatus: (status) => set({ status}),
   setToken: async (token) => {
    await AsyncStorage.setItem("token", token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  setReport: (reports) => set({reports}),
  setViolators: (violators) => set({violators}),
}));

export default useAppStore;

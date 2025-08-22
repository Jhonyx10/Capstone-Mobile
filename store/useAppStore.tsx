import { create } from 'zustand';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from '../src/types/UserType';
import { Report } from '../src/types/ReportType';
import { Violator } from '../src/types/ViolatorType';

interface AppState {
  login: boolean;
  token: string;
  user: User;
  reports: Report[];
  violators: Violator[];
  base_url: string;
  setLogin: (login: boolean) => void;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  setReport: (reports: Report[]) => void;
  setViolators: (Violators: Violator[]) => void;
}

const useAppStore = create<AppState>((set) => ({
  login: false,
  token: "",
  user: {} as User,
  reports: [],
  violators: [],
  base_url: 'http://10.88.49.34:8080/api/',
  setLogin: (login) => set({ login }),
   setToken: async (token) => {
    await AsyncStorage.setItem("token", token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  setReport: (reports) => set({reports}),
  setViolators: (violators) => set({violators}),
}));

export default useAppStore;

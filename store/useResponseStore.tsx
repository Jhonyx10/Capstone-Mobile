import { create } from 'zustand';

interface ResponseState {
  distance: number;
  responseTime: string;
  setDistance: (distance: number) => void;
  setResponseTime: (responseTime: string) => void;
}

const useResponseStore = create<ResponseState>((set) => ({
  distance: 0,
  responseTime: "",
  setDistance: (distance) => set({ distance }),
  setResponseTime: (responseTime) => set({ responseTime }),
}));

export default useResponseStore;

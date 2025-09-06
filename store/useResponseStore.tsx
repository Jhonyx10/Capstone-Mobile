import { create } from 'zustand';

interface ResponseState {
  distance: number;
  responseTime: number;
  setDistance: (distance: number) => void;
  setResponseTime: (responseTime: number) => void;
}

const useResponseStore = create<ResponseState>((set) => ({
  distance: 0,
  responseTime: 0,
  setDistance: (distance) => set({ distance }),
  setResponseTime: (responseTime) => set({ responseTime }),
}));

export default useResponseStore;

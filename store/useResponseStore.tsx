import { create } from 'zustand';
import type { FeatureCollection, LineString } from "geojson";

interface SelectedDestination {
  coords: [number, number];
  request_id: number;
}

interface ResponseState {
  distance: number | null;
  responseTime: number | null;
  requestId: number | null;
  route: FeatureCollection<LineString> | null;
  selectedDestination: SelectedDestination | null;

  // setters
  setDistance: (distance: number) => void;
  setResponseTime: (responseTime: number) => void;
  setRequestId: (requestId: number | null) => void;
  setRoute: (route: FeatureCollection<LineString> | null) => void;
  setSelectedDestination: (destination: SelectedDestination | null) => void;
  resetNavigation: () => void;
}

const useResponseStore = create<ResponseState>((set) => ({
  distance: 0,
  responseTime: 0,
  requestId: null,
  route: null,
  selectedDestination: null,

  // setters
  setDistance: (distance) => set({ distance }),
  setResponseTime: (responseTime) => set({ responseTime }),
  setRequestId: (requestId) => set({ requestId }),
  setRoute: (route) => set({ route }),
  setSelectedDestination: (destination) => set({ selectedDestination: destination }),

  // quick reset (clear route + destination)
  resetNavigation: () => set({ route: null, selectedDestination: null }),
}));

export default useResponseStore;

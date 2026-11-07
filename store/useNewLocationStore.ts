import { create } from 'zustand';

type NewLocation = { id: string; zoneId: string };

interface NewLocationState {
  newLocation: NewLocation | null;
  setNewLocation: (loc: NewLocation) => void;
  clear: () => void;
}

/**
 * LocationForm drops the location it just created here, and ReportForm
 * picks it up, selects it, then clears it.
 */
const useNewLocationStore = create<NewLocationState>(set => ({
  newLocation: null,
  setNewLocation: loc => set({ newLocation: loc }),
  clear: () => set({ newLocation: null }),
}));

export default useNewLocationStore;
import { create } from "zustand";
import { Evidence } from "../src/types/Evidence";

type PhotoState = {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
  evidence: Evidence[];
  addEvidence: (evidence: Evidence) => void;
  clearEvidence: () => void;
  landmark: string | null;
  setLandmark: ( landmark: string | null) => void;
};

const usePhotoStore = create<PhotoState>((set) => ({
  photo: null,
  setPhoto: (photo) => set({ photo }),
  evidence: [],
  addEvidence: (evidence) => set((state) => ({ evidence: [...state.evidence, evidence] })),
  clearEvidence: () => set({ evidence: [] }),
  landmark: null,
  setLandmark: (landmark) => set({landmark}),
}));

export default usePhotoStore;

import { create } from "zustand";
import { Violator } from "../src/types/ViolatorType";

interface InvolveViolatorState {
    involveViolator: Violator[];
    setInvolveViolator: ( involveViolator: Violator) => void;
    clearInvolveViolator: () => void;
}

const useInvolveViolator = create<InvolveViolatorState>((set) => ({
    involveViolator: [],
    setInvolveViolator: ( involveViolator ) => set((state) =>
     ({ involveViolator: [ ...state.involveViolator, involveViolator]})),
     clearInvolveViolator: () => set({ involveViolator: []}),
}))

export default useInvolveViolator
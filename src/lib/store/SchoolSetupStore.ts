/**
 * @file Zustand store kwa "School Setup" wizard - Vite-compatible, types
 * kutoka `SchoolSetupPayload`/`TermPayload` (Zod-inferred).
 */
import { create } from "zustand";
import type { SchoolSetupPayload, TermPayload } from "@/lib/schemas";

export interface SchoolSetupState {
  currentStep: number;
  year: SchoolSetupPayload["year"];
  terms: TermPayload[];
  primaryGrading: string;
}

export interface SchoolSetupStore extends SchoolSetupState {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateYear: (data: Partial<SchoolSetupState["year"]>) => void;
  /** Inazalisha `count` terms mpya, ikiondoa zilizokuwepo. */
  initializeTerms: (count: number) => void;
  setTerms: (terms: TermPayload[]) => void;
  addTerm: () => void;
  removeTerm: (index: number) => void;
  updateTerm: (index: number, data: Partial<TermPayload>) => void;
  setGrading: (code: string) => void;
  resetSetup: () => void;
}

const initialYear = new Date().getFullYear();

const initialState: SchoolSetupState = {
  currentStep: 1,
  year: { value: initialYear, startDate: "", endDate: "" },
  terms: [{ name: "Term 1", startDate: "", endDate: "", order: 1, isCurrent: true }],
  primaryGrading: "",
};

export const useSchoolSetupStore = create<SchoolSetupStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  // Floor guard - bila hii currentStep ingeweza kwenda chini ya 1 na
  // kusababisha `terms[negativeIndex]` (undefined) kwenye step ya term.
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  updateYear: (data) => set((state) => ({ year: { ...state.year, ...data } })),

  initializeTerms: (count) =>
    set(() => {
      const newTerms: TermPayload[] = Array.from({ length: count }, (_, i) => ({
        name: count <= 2 ? (i === 0 ? "First Term" : "Second Term") : `Term ${i + 1}`,
        startDate: "",
        endDate: "",
        order: i + 1,
        isCurrent: i === 0,
      }));
      return { terms: newTerms };
    }),

  setTerms: (terms) =>
    set({ terms: terms.map((term, i) => ({ ...term, order: i + 1 })) }),

  addTerm: () =>
    set((state) => {
      const nextOrder = state.terms.length + 1;
      return {
        terms: [
          ...state.terms,
          { name: `Term ${nextOrder}`, startDate: "", endDate: "", order: nextOrder, isCurrent: false },
        ],
      };
    }),

  removeTerm: (index) =>
    set((state) => {
      const filtered = state.terms.filter((_, i) => i !== index);
      return { terms: filtered.map((term, i) => ({ ...term, order: i + 1 })) };
    }),

  updateTerm: (index, data) =>
    set((state) => {
      let terms = [...state.terms];
      if (data.isCurrent === true) {
        terms = terms.map((t, i) => ({ ...t, isCurrent: i === index }));
      }
      terms[index] = { ...terms[index], ...data };
      return { terms };
    }),

  setGrading: (code) => set({ primaryGrading: code }),

  resetSetup: () => set(initialState),
}));
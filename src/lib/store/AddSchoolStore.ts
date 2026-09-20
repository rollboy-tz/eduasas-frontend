/**
 * @file Zustand store kwa "Add School" wizard - haina dependency yoyote
 * ya Next.js. Field types zinatoka moja kwa moja kwenye Zod schema
 * (`AddSchoolPayload`) ili store, form, na API payload zisiweze kupishana
 * (kama ukibadilisha field kwenye schema, TypeScript itakulazimisha
 * kusasisha store hapa pia - haiwezekani kusahau).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AddSchoolPayload, SchoolType } from "@/lib/schemas";

export interface AddSchoolFormState extends AddSchoolPayload {
  currentStep: number;
}

export interface AddSchoolStore extends AddSchoolFormState {
  setStepData: (data: Partial<AddSchoolFormState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStore: () => void;
}

const initialFormData: AddSchoolFormState = {
  currentStep: 1,
  name: "",
  registrationNumber: "",
  schoolType: "PRIVATE" as SchoolType,
  categoryIds: [],
  region: "",
  district: "",
  email: "",
  phone: "",
};

/**
 * State ya wizard nzima ya "Add School". `persist` (sessionStorage) -
 * maendeleo ya form hayapotei kwa refresh ya bahati mbaya, lakini
 * hayabaki milele kama localStorage ingefanya (hatari kidogo zaidi kwa
 * data ya usajili).
 */
export const useAddSchoolStore = create<AddSchoolStore>()(
  persist(
    (set) => ({
      ...initialFormData,

      setStepData: (data) => set((state) => ({ ...state, ...data })),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      resetStore: () => set(initialFormData),
    }),
    {
      name: "add-school-form",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
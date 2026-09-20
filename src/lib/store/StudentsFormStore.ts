// path: src/components/students/stores/useEnrollStudentStore.ts

import { EnrollStudentFormInput } from "@/types";
import { create } from "zustand";

interface EnrollStudentState {
  // Modal State
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;

  // Form Step State
  activeTab: "profile" | "academic" | "guardian";
  setActiveTab: (tab: "profile" | "academic" | "guardian") => void;

  // Form Data State
  formData: EnrollStudentFormInput;
  setProfileData: (data: Partial<EnrollStudentFormInput["profile"]>) => void;
  setAcademicData: (data: Partial<EnrollStudentFormInput["academic"]>) => void;
  setGuardianData: (data: Partial<EnrollStudentFormInput["guardian"]>) => void;
  resetForm: () => void;
}

const initialFormData: EnrollStudentFormInput = {
  profile: {
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "MALE",
    dateOfBirth: "",
    photoUrl: "",
  },
  academic: {
    admissionNo: "",
    sectionId: "",
    streamId: "",
    entryYear: new Date().getFullYear(),
    premsNumber: "",
    bemisNumber: "",
    indexNo: "",
  },
  guardian: {
    fullName: "",
    phone: "",
    email: "",
    homeAddress: "",
    relationship: "PARENT",
  },
};

export const useEnrollStudentStore = create<EnrollStudentState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),

  activeTab: "profile",
  setActiveTab: (tab) => set({ activeTab: tab }),

  formData: initialFormData,

  setProfileData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        profile: { ...state.formData.profile, ...data },
      },
    })),

  setAcademicData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        academic: { ...state.formData.academic, ...data },
      },
    })),

  setGuardianData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        guardian: { ...state.formData.guardian, ...data },
      },
    })),

  resetForm: () =>
    set({
      formData: initialFormData,
      activeTab: "profile",
    }),
}));
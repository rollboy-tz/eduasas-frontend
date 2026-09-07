export interface AcademicTerm {
  name:      string;
  startDate: string;
  endDate:   string;
  order:     number;
  isCurrent: boolean;
}

export interface AcademicYearData {
  value:     number;
  startDate: string;
  endDate:   string;
}

export interface SchoolSetupState {
  currentStep:      number;
  year:             AcademicYearData;
  terms:            AcademicTerm[];
  primaryGrading?:  string;
}

export interface SchoolSetupActions {
  setStep:  (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Updates za data
  updateYear:      (data: Partial<AcademicYearData>) => void;
  initializeTerms: (count: number) => void; // IMEONGEZWA HAPA
  setTerms:        (terms: AcademicTerm[]) => void;
  addTerm:         () => void;
  removeTerm:      (index: number) => void;
  updateTerm:      (index: number, data: Partial<AcademicTerm>) => void;

  setGrading?:     (code: string) => void;

  // Clean up
  resetSetup: () => void;
}

export type SchoolSetupStore = SchoolSetupState & SchoolSetupActions;
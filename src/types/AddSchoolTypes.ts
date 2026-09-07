
export type SchoolOwnership = "PRIVATE" | "GOVERNMENT";

export interface SchoolFormData {
  name: string;
  registrationNumber: string;
  schoolType: SchoolOwnership;
  categoryIds: string[]; 
  // Tunaruhusu null au string. "?" inamaanisha field inaweza isiwepo kabisa
  region?: string | null;
  district?: string | null;
  email?: string | null; 
  phone?: string | null;
}
export interface AddSchoolStore extends SchoolFormData {
  currentStep: number;
  // Actions
  setStepData: (data: Partial<SchoolFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStore: () => void;
}

export interface RegisteredSchool {
  id: string;
  schoolId: string;
  name: string;
  slug: string;
  schoolType: SchoolOwnership;
  creatorId: string;
  lastUsedAt: string | null;
  region: string | null;
  district: string | null;
  ward: string | null;
  registrationNo: string;
  status: string;
  parentSchool: string | null;
  createdAt: string;
  setupMetadata: any;
  updatedAt: string;
}

export interface SchoolRegistrationResponeData {
  school: RegisteredSchool;
}
// path: src/components/students/types/student.type.ts

import { enrollSchema } from "@/lib/schemas";
import { z } from "zod";

// --- ENUMS & LITERALS ---
export type Gender = "MALE" | "FEMALE";

// --- SUB-INTERFACES ---

export interface StudentProfile {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // Format: YYYY-MM-DD
  photoUrl?: string | null;
}

export interface StudentAcademic {
  admissionNo: string;
  sectionId: string; // ULID
  streamId?: string | null;
  entryYear: number;
  premsNumber?: string | null;
  bemisNumber?: string | null;
  indexNo?: string | null;
}

export interface StudentGuardian {
  fullName: string;
  phone: string;
  email?: string | null;
  homeAddress?: string | null;
  relationship: string; // Default: "PARENT"
}

// --- MAIN ENROLLMENT PAYLOAD ---

export interface EnrollStudentPayload {
  profile: StudentProfile;
  academic: StudentAcademic;
  guardian?: StudentGuardian | null;
}

export interface EnrollStudentFormInput {
  profile: {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: string;
    photoUrl: string;
  };
  academic: {
    admissionNo: string;
    sectionId: string;
    streamId: string;
    entryYear: number | string;
    premsNumber: string;
    bemisNumber: string;
    indexNo: string;
  };
  guardian: {
    fullName: string;
    phone: string;
    email: string;
    homeAddress: string;
    relationship: string;
  };
}

// --- ZOD SCHEMA INFERRED TYPES ---
export type EnrollStudentInput = z.input<typeof enrollSchema>;   // Data kabla ya transform
export type EnrollStudentOutput = z.output<typeof enrollSchema>; // Payload iliyosafishwa kuelekea API


/**
 * Student enrollment result data interface
 */
export interface EnrollStudentResult {
  systemId: string;
  studentId: string;
  message: string;
}
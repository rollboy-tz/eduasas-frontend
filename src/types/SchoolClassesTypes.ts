/**
 * @fileoverview Class Profile Type Definitions
 * @description Mfumo wa types wa data ya Class Profile kutoka Backend API.
 */

export interface ClassSection {
  id: string;
  name: string;
  capacity: number;
  streamId: string | null;
}

export interface ClassStream {
  id: string;
  name: string;
  capacity?: number;
}

export type ClassCategory = "NURSERY" | "PRIMARY" | "O-LEVEL" | "A-LEVEL";

export interface ClassProfile {
  id: string;
  schoolUId: string;
  academicYearId: string;
  status: string;
  classCode: string;
  classCategory: ClassCategory;
  gradingRuleId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  shortName: string;
  streams: ClassStream[];
  sections: ClassSection[];
  streamsCount: number;
  sectionsCount: number;
  studentsCount: number;
  subjectsCount: number;
}

export interface SchoolClass {
  id: string;
  schoolUId: string;
  academicYearId: string;
  status: 'created' | 'active' | 'archived'; // Unaweza kuongeza statuses nyingine kama zipo
  classCode: string;
  classCategory: 'PRIMARY' | 'O-LEVEL' | 'A-LEVEL';
  gradingRuleId: string;
  streamsCount: number;
  sectionsCount: number;
  studentsCount: number;
  subjectsCount: number;
  isActive: boolean;
  displayName: string;
  shortName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * This interface used either to create or update section
 */
export interface SectionsMutation {
  name: string;
  capacity: number;
  streamId: string | null;
  classTeacherId: string | null;
}

/**
 * Stream details found in class sections list
 */
export interface SectionStream {
    id: string;
    name: string;
    code: string;
}

/**
 * Sections list streams
 */
export interface ClassSections {
    id: string;
    name: string;
    streamId: string;
    stream: SectionStream | null;
    capacity: number;
    currentStudents: number;
    availableSlots: number;
    classTeacher: null;
    timestamps: {
        createdAt: string;
        updatedAt: string;
    }
}
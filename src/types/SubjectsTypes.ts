/**
 * @fileoverview School Subjects Schema Types
 * @description Inafafanua muundo wa masomo (Registered, Trashed, na Suggestions).
 */

import { SchoolEducationLevel } from "./SchoolCategoriesTypes";

export type SubjectSource = 'NATIONAL' | 'CUSTOM';
export type SubjectStatus = 'ACTIVE' | 'TRASHED';

// Interface kwa ajili ya masomo yaliyosajiliwa (Registered)
export interface RegisteredSubject {
  id: string;
  subjectId: string | null; // Nullable kwa sababu CUSTOM subjects hazina ID ya National
  name: string;
  code: string;
  category: SchoolEducationLevel;
  source: SubjectSource;
  status: 'ACTIVE';
  deletedAt: string | null;
}

// Interface kwa ajili ya masomo yaliyopo kwenye Trash
export interface TrashedSubject {
  id: string;
  subjectId: string | null;
  name: string;
  code: string;
  category: SchoolEducationLevel;
  source: SubjectSource;
  status: 'TRASHED';
  deletedAt: string; // Hapa lazima iwe na tarehe kwa sababu ni TRASHED
}

// Interface kwa ajili ya masomo yanayopendekezwa (Suggestions)
export interface SubjectSuggestion {
  id: string;
  name: string;
  code: string;
  category: SchoolEducationLevel;
  language: string;
  createdAt: string;
}

// Interface kuu ya API Response
export interface SubjectsDataResponse {
  metadata: {
    schoolName: string;
    activeCategories: SchoolEducationLevel[];
    totalRegistered: number;
  };
  registered: RegisteredSubject[];
  trashed: TrashedSubject[];
  suggestions: SubjectSuggestion[];
}
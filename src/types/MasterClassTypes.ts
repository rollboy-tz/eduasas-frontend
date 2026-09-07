// src/types/master-class.ts
import { SchoolEducationLevel } from "./SchoolCategoriesTypes";

export interface MasterClass {
  classCode: string;   // e.g., "SEC_01"
  displayName: string; // e.g., "Form One"
  shortName: string;   // e.g., "Form 1"
  category: SchoolEducationLevel;
}

export interface MasterClassesResponse {
  data: MasterClass[];
}

// Hii ni type kwa ajili ya component ya kusajili darasa (Select/Dropdown)
export interface ClassSelectorProps {
  category: SchoolEducationLevel;
  onSelect: (selectedClass: MasterClass) => void;
  disabled?: boolean;
}
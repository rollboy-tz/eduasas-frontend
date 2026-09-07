export type SchoolStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "ARCHIVED";
import { SchoolCategory } from "./SchoolCategoriesTypes";

export interface AssignedRole {
  name: string;
  priority: number;
}

export interface AssociatedSchool {
  id: string;              
  schoolId: string;        
  name: string;
  logo: string | null;
  status: SchoolStatus;
  primaryCategory: string;
  categories: SchoolCategory[]; // Kutoka kwenye JSON yako
  primaryRole: string;          // Hii ni label ya role kuu
  assignedRoles: AssignedRole[]; // Hii ndio Multi-Role array yetu
  lastAccessed: string;
}

export interface UserSchoolsData {
  totalAssociated: number;
  schools: AssociatedSchool[];
  message: string;
}
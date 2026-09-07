// src/types/school-staff.ts

import { StaffRole, StaffStatus } from "./SchoolContextTypes";

export interface StaffUser {
  uid: string;
  picture: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface SchoolStaffMember {
  staffId: string;
  staffNumber: string;
  designation: string | null;
  joiningDate: string;
  status: StaffStatus;
  roles: StaffRole[]; // Sasa ni Array
  user: StaffUser;
}

// Hii ndio shape ya response inayotoka kwenye API yako
export interface StaffListResponse {
  items: SchoolStaffMember[];
  totalCount: number;
  schoolUId: string;
  cachedAt: string;
}
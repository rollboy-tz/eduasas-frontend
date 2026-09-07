/* =========================================================
   ENUM TYPES (Kulingana na Drizzle Schema yako)
   ========================================================= */

   export type StaffStatus = 
   | "ACTIVE" 
   | "ON-LEAVE" 
   | "RESIGNED" 
   | "TERMINATED" 
   | "TRASHED" 
   | "SUSPENDED";
 
 export type RestrictionLevel = "NONE" | "READ-ONLY" | "LOCKED";
 
 export type SystemRole = "SUPER_ADMIN" | "SYSTEM_OPERATOR" | "SYSTEM_AUDITOR" | "USER";
 
 /* =========================================================
    CONTEXT INTERFACES
    ========================================================= */
 
 export interface UserContext {
   id: string;
   uid: string;
   systemRole: SystemRole;
 }
 
 export interface StaffRole {
   roleKey: string;
   displayName: string;
   priority: number;
   restrictionLevel: RestrictionLevel;
   assignedAt: string; // Imeongezwa: Kulingana na payload ya ISO String Date
 }
 
 export interface StaffContext {
   id: string;
   staffNumber: string;
   status: StaffStatus;
   assignedRoles: StaffRole[];
 }
 
 export interface SchoolContext {
   schoolUId: string;
   schoolId: string;
   slug: string;
 }
 
 /* =========================================================
    FINAL RESPONSE INTERFACE
    ========================================================= */
 
 export interface SchoolContextResponse {
   user: UserContext;
   school: SchoolContext;
   staff: StaffContext; // Imerekebishwa: Kutoka 'staffProfile' kwenda 'staff' ili ifanane na JSON
 }
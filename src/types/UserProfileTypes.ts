// src/types/user-profile.ts

export interface UserSettings {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    compactView: boolean;
    landingPage: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    dndEnabled: boolean;
    dndStartTime: string;
    dndEndTime: string;
    autoSave: boolean;
    academicChannels: string[];
    paymentChannels: string[];
    systemChannels: string[];
  }
  
  export interface UserSchoolRole {
    roleKey: string;
    displayName: string;
    priority: number;
  }
  
  export interface UserAffiliatedSchool {
    schoolUId:     string;
    schoolId:      string; // e.g., "ESCH-260528001"
    name:          string;
    slug:          string;
    status:        "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED" | "TRASHED";
    logo:          string | null;
    displayName:   string | null;
    roles:         UserSchoolRole[];
    primaryRole:   UserSchoolRole;
    designation:   string | null;
    staffNumber:   string;
  }
  
  export interface UserProfile {
    id: string;
    uid: string; // e.g., "EAU-260528002"
    email: string;
    phone: string | null;
    firstName: string;
    secondName: string | null;
    lastName: string;
    displayName: string | null;
    gender: string | null;
    picture: string | null;
    nationality: string | null;
    systemRole: "SUPER_ADMIN" | "SYSTEM_OPERATOR" | "SYSTEM_AUDITOR" | "USER";
    status: "PENDING" | "VERIFIED" | "ACTIVE" | "IN-ACTIVE" | "SUSPENDED" | "TRASHED" | "RESTRICTED";
    authProvider: "LOCAL" | "GOOGLE";
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    lastLoginAt: string;
    createdAt: string;
    settings: UserSettings;
    schools: UserAffiliatedSchool[];
    cachedAt: string;
  }
  
  export interface SecurityAction {
    field: string;
    severity: "CRITICAL" | "HIGH" | "LOW";
    action: string;
    message: string;
  }
  
  export interface AccountSecurity {
    isComplianceMet: boolean;
    requiredActions: SecurityAction[];
    alertLevel: "WARNING" | "INFO" | "DANGER";
    recommendation: string;
  }
  
  export interface UserProfileResponse {
    profile: UserProfile;
    accountSecurity: AccountSecurity;
  }
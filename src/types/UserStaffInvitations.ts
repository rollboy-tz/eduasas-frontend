// src/types/invitations.ts

export type InvitationStatus = "PENDING" | "JOINED" | "EXPIRED" | "DECLINED";

export interface SchoolInfo {
  name: string;
  uid: string;
}

export interface RoleInfo {
  name: string;
  key: string;
}

export interface StaffInfo {
  id: string;
  designation: string | null;
  number: string;
  joiningDate: string; // ISO Date String
  status: "ACTIVE" | "PENDING" | "JOINED" | "EXPIRED" | "DECLINED";
}

export interface UserStaffInvitation {
  id: string;
  name: string;
  status: InvitationStatus;
  invitedAt: string; // ISO Date String
  expiresAt: string; // ISO Date String
  archived: boolean;
  description: string | null;
  school: SchoolInfo;
  role: RoleInfo;
  staff: StaffInfo | null; // Inakuja tu ikiwa status ni JOINED
  token: string;
}
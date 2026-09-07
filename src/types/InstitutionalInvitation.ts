// src/types/institutional-invitations.ts

export type InstitutionalInviteStatus = "PENDING" | "JOINED" | "EXPIRED" | "DECLINED" | "CANCELLED";

export interface SendInvitationPayload {
  name: string;
  roleId: string; // ULID
  description?: string | null;
  email?: string; // Mojawapo lazima iwepo (email au phone)
  phone?: string;
}

export interface RoleDetail {
  displayName: string;
  roleKey: string;
}

export interface SenderDetail {
  firstName: string;
  lastName: string;
}

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  picture: string | null;
}

export interface InstitutionalStaffInfo {
  id: string;
  staffNumber: string;
  designation: string | null;
  joiningDate: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  user?: UserDetail; 
}

export interface InstitutionalInvitation {
  id: string;
  schoolUId: string;
  name: string; // Jina lililoandikwa wakati wa kutuma mwaliko
  email: string;
  phone: string | null;
  roleId: string;
  staffId: string | null;
  description: string | null;
  status: InstitutionalInviteStatus;
  senderId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  role: RoleDetail;
  sender: SenderDetail; // Nani ndani ya shule (e.g. Headmaster) alituma huu mwaliko
  staff: InstitutionalStaffInfo | null; // Hii inakuja mwalimu akiwa ameshaunganishwa (JOINED)
}
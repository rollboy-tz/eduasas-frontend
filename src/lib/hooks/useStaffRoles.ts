/**
 * @fileoverview Staff Roles Engine
 * @description Inavuta orodha ya majukumu ya wafanyakazi (Staff Roles) 
 * na kuipanga kulingana na kipaumbele (priority).
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0 (TanStack Query)
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

/**
 * @interface StaffRoles
 * @description Muundo wa taarifa za majukumu ya mfanyakazi.
 */
export interface StaffRoles {
  id: string;
  priorityNumber: number;
  displayName: string;
  roleKey: string;
  description: string;
}

/**
 * ### StaffRolesHookReturn
 * @property {StaffRoles[]} roles - Orodha ya majukumu yaliyopangwa kwa kipaumbele.
 * @property {boolean} isLoading - Hali ya upakiaji.
 * @property {any} isError - Hitilafu zilizotokea.
 */

/**
 * ### useStaffRoles
 * Hook ya kitalamu kwa ajili ya kuvuta na kupanga majukumu ya wafanyakazi.
 * @returns {StaffRolesHookReturn}
 */
export function useStaffRoles() {
  // 1. Fetching (GET)
  const { data, error, isLoading } = useQuery<StaffRoles[]>({
    queryKey: ['public-staff-roles'],
    queryFn: () => apiFetch<StaffRoles[]>("/public/staff-roles"),
    
    // Performance: Cache hii ni ya muda mrefu (dakika 10)
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });

  // 2. Logic: Panga roles kwa priorityNumber (Ascending)
  const roles = data ? [...data].sort((a, b) => a.priorityNumber - b.priorityNumber) : [];

  return {
    roles,
    isLoading,
    isError: error,
  };
}
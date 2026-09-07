/**
 * @fileoverview School Staff List & Career Engine
 * @description Inasimamia orodha ya wafanyakazi, majukumu (Roles), 
 * na hali ya ajira (Status) kwa kutumia TanStack Query.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0
 */

"use client";

import { useSchoolData } from "@/shared/providers";
import { StaffListResponse, StaffStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { api, apiFetch } from "@/lib/api";





/**
 * ### StaffListHookReturn
 * @property {Array} staffList - Orodha ya wafanyakazi.
 * @property {number} totalCount - Jumla ya wafanyakazi.
 * @property {boolean} isLoading - Hali ya uvutaji data.
 * @property {Function} assignRole - Kupeana jukumu.
 * @property {Function} swapRole - Kubadilisha jukumu.
 * @property {Function} revokeRole - Kuondoa jukumu.
 * @property {Function} updateDesignation - Kubadilisha cheo/designation.
 * @property {Function} changeStatus - Kubadilisha status (Active/Suspended).
 * @property {Function} refreshStaffList - Kulazimisha sync na server.
 */

/**
 * ### useSchoolStaffList
 * Hook ya kitalamu kwa ajili ya usimamizi wa staff list na career lifecycle.
 * @returns {StaffListHookReturn}
 */
export function useSchoolStaffList() {
  const queryClient = useQueryClient();
  const { profile } = useUser();
  const { data: tenant } = useSchoolData();

  const STAFF_LIST_KEY = ['school-staff-list', tenant?.school.slug, profile?.id];

  // 1. Fetching (GET)
  const { data, isLoading, error } = useQuery<StaffListResponse>({
    queryKey: STAFF_LIST_KEY, 
    queryFn: () => apiFetch<StaffListResponse>("/school/staff/list"),
    enabled: !!tenant?.school.slug && !!profile?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });

  // 2. Mutation Engine (CRUD)
  const mutation = useMutation({
    mutationFn: (args: { url: string; method: 'post' | 'patch'; body: any }) => 
      api[args.method](args.url, args.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_LIST_KEY }),
  });

  /**
   * @function assignRole
   * @description Inahusisha mfanyakazi na jukumu jipya.
   */
  const assignRole = async (staffId: string, roleId: string) => 
    mutation.mutateAsync({ url: "/school/staff/career/roles/assign", method: 'post', body: { staffId, roleId } });

  /**
   * @function swapRole
   * @description Inabadilisha jukumu moja kwa lingine.
   */
  const swapRole = async (staffId: string, oldRoleId: string, newRoleId: string) => 
    mutation.mutateAsync({ url: "/school/staff/career/roles/swap", method: 'post', body: { staffId, oldRoleId, newRoleId } });

  /**
   * @function revokeRole
   * @description Inafuta jukumu la mfanyakazi.
   */
  const revokeRole = async (staffId: string, roleId: string) => 
    mutation.mutateAsync({ url: "/school/staff/career/roles/revoke", method: 'post', body: { staffId, roleId } });

  /**
   * @function updateDesignation
   * @description Inarekebisha cheo (designation) cha mfanyakazi.
   */
  const updateDesignation = async (staffId: string, designation: string) => 
    mutation.mutateAsync({ url: "/school/staff/career/bio-metadata", method: 'patch', body: { staffId, designation } });

  /**
   * @function changeStatus
   * @description Inabadilisha hali ya kazi (status) ya mfanyakazi.
   */
  const changeStatus = async (staffId: string, status: StaffStatus) => 
    mutation.mutateAsync({ url: "/school/staff/career/status-policy", method: 'patch', body: { staffId, status } });

  return {
    staffList: data?.items || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    isError: error,
    assignRole,
    swapRole,
    revokeRole,
    updateDesignation,
    changeStatus,
    refreshStaffList: () => queryClient.invalidateQueries({ queryKey: STAFF_LIST_KEY }),
  };
}
/**
 * @fileoverview Staff Invitations Engine
 * @description Inasimamia mzunguko wa maisha ya mialiko ya kazi (Accept, Decline, Archive).
 * Inatumia Optimistic UI kwa ajili ya spidi ya juu na Batch state management.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0 (TanStack Query)
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/api-fetch";
import { api, apiMutation }  from "@/lib/api";
import { useSchoolData } from "@/shared/providers";
import { InstitutionalInvitation, UserStaffInvitation } from "@/types";
import { useUser } from "./useUser";



/**
 * ### InvitationsHookReturn
 * @property {InstitutionalInvitation[]} invitations - List ya mialiko iliyotumwa.
 * @property {Object} metrics - Takwimu za mialiko (Sent, Pending, Joined, etc).
 * @property {boolean} isLoading - Hali ya upakiaji.
 * @property {Function} sendInvitation - Kutuma mwaliko mpya.
 * @property {Function} cancelInvitation - Kughairi mwaliko.
 * @property {Function} resendInvitation - Kutuma tena mwaliko.
 */

export function useSchoolStaffInvitations() {
  const queryClient = useQueryClient();
  const { profile } = useUser();
  const { data: tenant } = useSchoolData();

  // Ulinzi wa usalama: Key hii inahakikisha data ni specific kwa shule na user
  const INVITE_KEY = ['school-invitations', tenant?.school.slug, profile?.id];

  // 1. Fetching (GET)
  const { data, isLoading, error } = useQuery<InstitutionalInvitation[]>({
    queryKey: ["INVITE_KEY"], //TODO: Keep actuary key
    queryFn: () => apiFetch<InstitutionalInvitation[]>("/school/staff/invitations/sent"),
    enabled: true,//!!tenant?.school.slug && !!profile?.id, //TODO: Keepe layer hia
    staleTime: 1000 * 60 * 3, 
  });

  const invitations = data || [];

  // 2. Metrics Engine
  const metrics = {
    totalSent: invitations.length,
    totalPending: invitations.filter(inv => inv.status === "PENDING").length,
    totalJoined: invitations.filter(inv => inv.status === "JOINED").length,
    totalExpired: invitations.filter(inv => inv.status === "EXPIRED").length,
    totalDeclined: invitations.filter(inv => inv.status === "DECLINED").length,
    totalCancelled: invitations.filter(inv => inv.status === "CANCELLED").length,
  };

  // 3. Mutation Engine (CRUD)
  const mutation = useMutation({
    mutationFn: (args: { url: string; method: 'post' | 'patch'; body?: any }) => 
      api[args.method](args.url, args.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITE_KEY }),
  });

  /**
   * @function sendInvitation
   * @description Inatuma mwaliko mpya kwenda backend.
   */
  const sendInvitation = async (payload: any) => await apiMutation("post", "/school/staff/invitations/send", payload);

  /**
   * @function cancelInvitation
   * @description Inasitisha mwaliko uliotangulia.
   */
  const cancelInvitation = async (id: string) => {
    // Optimistic: Update status locally
    queryClient.setQueryData(INVITE_KEY, (old: InstitutionalInvitation[] = []) =>
      old.map(inv => inv.id === id ? { ...inv, status: 'CANCELLED' } : inv)
    );
    
    await mutation.mutateAsync({ 
      url: `/school/staff/invitations/cancel/${id}`, 
      method: 'post' 
    });
  };

  /**
   * @function resendInvitation
   * @description Inatuma tena mwaliko kwa yuleyule aliyetumwa awali.
   */
  const resendInvitation = async (id: string) => {
    await mutation.mutateAsync({ 
      url: `/school/staff/invitations/resend/${id}`, 
      method: 'post' 
    });
  };

  return {
    invitations,
    metrics,
    isLoading,
    isError: error,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    refresh: () => queryClient.invalidateQueries({ queryKey: INVITE_KEY }),
  };
}


/**
 * ### InvitationsHookReturn
 * @property {UserStaffInvitation[]} invitations - Orodha ya mialiko.
 * @property {boolean} hasPending - Ikiwa kuna mialiko mipya ya PENDING.
 * @property {boolean} isLoading - Hali ya uvutaji data.
 * @property {Function} acceptInvitation - Kukubali mwaliko.
 * @property {Function} declineInvitation - Kukataa mwaliko.
 * @property {Function} archiveInvitation - Kuficha mwaliko (Archive).
 * @property {Function} unarchiveInvitation - Kurudisha mwaliko uliofichwa.
 * @property {Function} refresh - Kulazimisha sync na server.
 */

/**
 * Hook ya kitalamu kwa ajili ya User Staff Invitations.
 * Inatumia mbinu ya Atomic Cache Invalidation.
 * @returns {InvitationsHookReturn}
 */
export function useUserStaffInvitations() {
  const queryClient = useQueryClient();
  const { profile } = useUser();

  const INVITE_QUERY_KEY = ['staff-invitations', profile?.id];
  // 1. Fetching Data (GET)
  const { data, isLoading, error } = useQuery<UserStaffInvitation[]>({
    queryKey: INVITE_QUERY_KEY,
    queryFn: () => apiFetch<UserStaffInvitation[]>("/my/staff/invitations"),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });

  const invitations = data || [];
  const hasPending = invitations.some((inv) => inv.status === "PENDING" && !inv.archived);

  // 2. Mutations (Optimistic UI Engine)
  
  /** * @description Utility ya kufanya update kwenye cache kabla server haijajibu.
   */
  const updateCache = (id: string, patch: Partial<UserStaffInvitation>) => {
    queryClient.setQueryData(INVITE_QUERY_KEY, (old: UserStaffInvitation[] = []) =>
      old.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv))
    );
  };

  const mutation = useMutation({
    mutationFn: (args: { url: string; method: 'post' | 'patch'; body?: any }) => 
      api[args.method](args.url, args.body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: INVITE_QUERY_KEY }),
  });

  /**
   * Kukubali Mwaliko.
   * @param {string} id - ID ya mwaliko.
   * @param {string} token - Token ya usalama.
   */
  const acceptInvitation = async (id: string, token: string) => {
    updateCache(id, { status: "JOINED" });
    await mutation.mutateAsync({ url: `/my/staff/invitations/accept/${id}`, method: 'post', body: { token } });
  };

  /**
   * Kukataa Mwaliko.
   * @param {string} id - ID ya mwaliko.
   * @param {string} token - Token ya usalama.
   */
  const declineInvitation = async (id: string, token: string) => {
    updateCache(id, { status: "DECLINED" });
    await mutation.mutateAsync({ url: `/my/staff/invitations/decline/${id}`, method: 'post', body: { token } });
  };

  /**
   * Kuficha mwaliko (Archive).
   * @param {string} id - ID ya mwaliko.
   */
  const archiveInvitation = async (id: string) => {
    updateCache(id, { archived: true });
    await mutation.mutateAsync({ url: `/my/staff/invitations/archive/${id}`, method: 'patch' });
  };

  /**
   * Kurudisha mwaliko (Unarchive).
   * @param {string} id - ID ya mwaliko.
   */
  const unarchiveInvitation = async (id: string) => {
    updateCache(id, { archived: false });
    await mutation.mutateAsync({ url: `/my/staff/invitations/unarchive/${id}`, method: 'patch' });
  };

  return {
    invitations,
    hasPending,
    isLoading,
    isError: error,
    acceptInvitation,
    declineInvitation,
    archiveInvitation,
    unarchiveInvitation,
    refresh: () => queryClient.invalidateQueries({ queryKey: INVITE_QUERY_KEY }),
  };
}
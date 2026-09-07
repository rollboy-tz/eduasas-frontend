/**
 * @fileoverview User Profile Engine
 * @description Inasimamia identity, settings, na uanachama wa shule za mtumiaji 
 * kwa kutumia TanStack Query.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  UserProfileResponse, 
  UserProfile, 
  UserSettings,
  UserAffiliatedSchool 
} from '@/types';
import { api, apiFetch  } from '@/lib/api';
import { getUserKey } from "@/lib/utils";
import { useAuth } from "@/shared/providers";

/**
 * @typedef {Object} UserHookReturn
 * @property {UserProfile | undefined} profile - Taarifa za msingi (Identity)
 * @property {UserSettings | undefined} settings - Mipangilio ya UI (Theme, Language)
 * @property {any} security - Hali ya ulinzi na compliance
 * @property {UserAffiliatedSchool[]} schools - Orodha ya shule alizojiunga nazo mwalimu
 * @property {boolean} isLoading - Hali ya uvutaji data
 * @property {Error | null} error - Hitilafu zilizotokea
 * @property {Function} updateProfile - Kurekebisha identity ya user
 * @property {Function} updateSettings - Kurekebisha preferences
 * @property {Function} updateSchoolMembership - Kurekebisha data ya mwalimu ndani ya shule
 * @property {Function} refresh - Kulazimisha sync na server
 */

/**
 * ### useUser
 * Hook kiongozi kwa ajili ya kusimamia Global State ya Mtumiaji.
 * Inatumia TanStack Query kwa data fetching na caching ya kimataifa.
 * * @returns {UserHookReturn}
 */
export function useUser() {
  const queryClient = useQueryClient();
  const { isAuthenticated, sessionKey } = useAuth()
  const profileKey = sessionKey ?? getUserKey(); //Hapa hatutaki null ni kumage cache
  const USER_QUERY_KEY = ['user-profile', profileKey];
  
  
  // 1. Fetching Data (TanStack Query)
  const { data, isLoading, error } = useQuery<UserProfileResponse>({
    queryKey: USER_QUERY_KEY,
    queryFn: () => apiFetch<UserProfileResponse>('/my/profile'),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 15,    // 15 minutes cache retention
    enabled: !!isAuthenticated && !!profileKey,
  });

  // 2. Mutations (CRUD Operations)
  
  // Generic mutation kwa ajili ya ku-update data na kufanya Invalidation
  const mutation = useMutation({
    mutationFn: (args: { url: string; method: 'patch' | 'post'; data: any }) => 
      api[args.method](args.url, args.data),
    onSuccess: () => {
      // Invalidation: Inafanya system irudi kuvuta data mpya toka server (Auto-Sync)
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    }
  });

  /**
   * @function updateProfile
   * @description Inarekebisha taarifa za mtumiaji (jina, picha, jinsia).
   */
  const updateProfile = async (newProfileData: Partial<UserProfile>) => {
    return mutation.mutate({ url: '/my/profile', method: 'patch', data: newProfileData });
  };

  /**
   * @function updateSettings
   * @description Inarekebisha mipangilio ya mtumiaji (Theme, Language).
   */
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    return mutation.mutate({ url: '/my/settings', method: 'patch', data: newSettings });
  };

  /**
   * @function updateSchoolMembership
   * @description Inarekebisha data ya mwalimu ndani ya shule (designation).
   */
  const updateSchoolMembership = async (schoolUId: string, schoolData: Partial<UserAffiliatedSchool>) => {
    return mutation.mutate({ url: `/my/schools/${schoolUId}/membership`, method: 'patch', data: schoolData });
  };


  return {
    profile: data?.profile,
    settings: data?.profile.settings,
    security: data?.accountSecurity,
    schools: data?.profile.schools,
    isLoading,
    error: error as Error | null,
    updateProfile,
    updateSettings,
    updateSchoolMembership,
    refresh: () => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY })
  };
}
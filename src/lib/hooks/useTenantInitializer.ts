/**
 * @fileoverview Tenant Initializer Hook
 * @description Automatically fetches and initializes the active school context 
 * from the backend as soon as a user successfully authenticates, syncing it 
 * with the global TenantProvider.
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SchoolContextResponse } from "@/types";
import { useTenant } from "@/shared/providers";

/**
 * @interface TenantInitializerReturn
 * @description Contract defining the return structure of the useTenantInitializer hook.
 */
interface TenantInitializerReturn {
  data: SchoolContextResponse | undefined;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * @function useTenantInitializer
 * @description
 * Custom TanStack Query hook designed to run right after user authentication. 
 * It queries the `/school/context` endpoint to retrieve the active tenant details 
 * and automatically triggers `setTenant` to update the global multi-tenant state.
 * 
 * @param {boolean} isAuthenticated - Flag indicating whether the user is currently authenticated.
 * @param {string | null} sessionKey - Unique session identifier used for query caching key invalidation.
 * @returns {TenantInitializerReturn} Query data, loading state, and manual refetch function.
 * 
 * @example
 * ```tsx
 * // Inside your authenticated layout or App wrapper
 * const { isAuthenticated, sessionKey } = useAuth();
 * const { isLoading } = useTenantInitializer(isAuthenticated, sessionKey);
 * 
 * if (isLoading) return <EduScreenLoader/>;
 * ```
 */
export const useTenantInitializer = (
  isAuthenticated: boolean, 
  sessionKey: string | null
): TenantInitializerReturn => {
  const { setTenant } = useTenant();

  // Fetch active school context using TanStack Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["school-context", sessionKey],
    queryFn: () => apiFetch<SchoolContextResponse>("/school/context"),
    
    // Performance & Lifecycle Settings
    staleTime: Infinity,          // Context data remains fresh for the session lifetime
    gcTime: 1000 * 60 * 30,       // Retain in memory for 30 minutes if unmounted
    refetchOnMount: true,         
    refetchOnWindowFocus: false,  
    retry: false,                 // Do not auto-retry context fetching to prevent redirect loops on failure
    enabled: !!isAuthenticated && !!sessionKey, // Only execute if user is authenticated and session exists
  });

  // Automatically synchronize fetched school context with the TenantProvider
  useEffect(() => {
    if (data?.school?.schoolUId) {
      setTenant(data.school.schoolUId);
    }
  }, [data, setTenant]);

  return { 
    data, 
    isLoading, 
    refetch 
  };
};
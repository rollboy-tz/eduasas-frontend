/**
 * @fileoverview Enterprise School Data Engine Provider
 * @description 
 * ### ARCHITECTURE OVERVIEW:
 * This provider acts as the secondary multi-tenant layer, responsible for fetching, caching, 
 * and validating school-specific workspace data (School profile, staff roles, permissions) 
 * via TanStack Query. It works hand-in-hand with the `TenantProvider` to enforce strict 
 * data integrity and prevent cross-tenant data leaks.
 * 
 * ### CORE RESPONSIBILITIES:
 * 1. **Tenant-Scoped Caching:** Uses the active `tenantId` in the query key to isolate cache pools per school.
 * 2. **Integrity Verification:** Compares the server's returned school ID against the active client tenant state.
 * 3. **Gatekeeper Enforcement:** Waits for the tenant initialization gate (`isInitialized`) before firing API requests.
 * 
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.0.0-Enterprise
 */

import React, { createContext, useContext, useMemo, JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "./TenantProvider";
import { apiFetch } from "@/lib/api";
import { SchoolContextResponse } from "@/types";

/**
 * @interface SchoolDataContextType
 * @description Contract defining the School Data Context values, loading flags, and manual refetch utilities.
 */
export interface SchoolDataContextType {
  /** The full school workspace context response payload from the backend. */
  data: SchoolContextResponse | undefined;
  /** Indicates whether the school context query is actively fetching data. */
  isLoading: boolean;
  /** Indicates whether a network or server failure occurred during context retrieval. */
  isError: boolean;
  /** The captured error object if the query failed, or null. */
  error: Error | null;
  /** Forces a manual background re-validation of the school context data. */
  refetch: () => void;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

/**
 * @function SchoolDataProvider
 * @description
 * Enterprise Context Provider component that fetches and maintains school-level context data. 
 * Scopes TanStack queries strictly to the active `tenantId` and performs real-time response integrity 
 * checks to guarantee that server-side sessions match client-side subdomain expectations.
 * 
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components wrapped by this data engine provider.
 * @returns {JSX.Element} The rendered enterprise context provider wrapper.
 */
export function SchoolDataProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { schoolUId: tenantId, isInitialized, setTenant } = useTenant();

  // Fetch school context scoped strictly to the active tenant ID and protected by initialization gates
  const { data, isLoading, isError, error, refetch } = useQuery<SchoolContextResponse, Error>({
    queryKey: ["school-subdomain-context-data", tenantId],
    queryFn: async (): Promise<SchoolContextResponse> => {
      const result = await apiFetch<SchoolContextResponse>("/school/context");

      // Integrity Check: Ensure server response matches the client-side active tenant state
      if (tenantId && result?.school?.schoolUId && result.school.schoolUId !== tenantId) {
        console.warn("⚠️ [SchoolDataEngine] Integrity Mismatch: Server context differs from local tenant. Syncing...");
        
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("eduasas:sync-context", {
            detail: { schoolUId: tenantId }
          }));
        }

        // Server-wins policy: update local tenant state to match the valid server response
        setTenant(result.school.schoolUId);
      }
      
      return result;
    },
    // Only execute the query when the tenant engine is fully initialized and a valid tenant ID exists
    enabled: isInitialized && !!tenantId,
    staleTime: 1000 * 60 * 5, // Context data remains fresh for 5 minutes
    gcTime: 1000 * 60 * 30,    // Retained in memory cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,                 // Retry once on failure before exposing error state
  });

  // Memoize context values to optimize downstream consumer re-renders
  const contextValue = useMemo<SchoolDataContextType>(() => ({
    data,
    isLoading,
    isError,
    error: error ?? null,
    refetch
  }), [data, isLoading, isError, error, refetch]);

  return (
    <SchoolDataContext.Provider value={contextValue}>
      {children}
    </SchoolDataContext.Provider>
  );
}

/**
 * @hook useSchoolData
 * @description
 * Enterprise custom React hook to consume active school workspace data, state flags, and refetch utilities.
 * 
 * @returns {SchoolDataContextType} The active school data context.
 * @throws {Error} Thrown if executed outside of an active `SchoolDataProvider` scope.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useSchoolData();
 * 
 * if (isLoading) return <SkeletonLoader/>;
 * if (isError) return <ErrorBanner/>;
 * 
 * return <h1>{data?.school.name}</h1>;
 * ```
 */
export const useSchoolData = (): SchoolDataContextType => {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error("Enterprise Security Violation: useSchoolData() must be executed strictly within a SchoolDataProvider scope.");
  }
  return context;
};
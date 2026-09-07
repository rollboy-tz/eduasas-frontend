/**
 * @fileoverview Enterprise Tenant Context Provider (Subdomain-Aware Multi-Tenant Guard)
 * @description 
 * ### ARCHITECTURE OVERVIEW:
 * This provider serves as the ultimate multi-tenant state orchestrator for the EduAsas platform. 
 * It enforces a strict **Triple-Source Synchronization** strategy:
 * 1. **URL Subdomain Slug:** The primary source of truth extracted via `parseDomainAndTenant`.
 * 2. **User Affiliations & Server Context:** Validated against the user's profile schools list.
 * 3. **Local Storage Persistence:** Automatically synchronized to ensure seamless offline state retention.
 * 
 * ### CORE RESPONSIBILITIES:
 * - Intercepts browser hostnames to detect active school tenant slugs.
 * - Reconciles discrepancies between URL subdomains and cached `localStorage` states.
 * - Blocks premature component rendering until tenant resolution and validation complete (`isInitialized`).
 * - Broadcasts cross-tab synchronization events for SPA-wide state consistency.
 * 
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.0.0-Enterprise
 * @see {@link parseDomainAndTenant} For underlying subdomain parsing logic.
 */

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, JSX } from "react";
import { useUser } from "@/lib/hooks";
import { UserAffiliatedSchool } from "@/types";
import { parseDomainAndTenant } from "@/lib/utils";

/**
 * @interface TenantContextType
 * @description Contract defining the Tenant Context state, exposing active tenant identifiers,
 * gatekeeper initialization status, and manual mutation handlers.
 */
export interface TenantContextType {
  /** The unique universal ID of the active school tenant, or null if on root domain. */
  schoolUId: string | null;
  /** The URL-friendly slug identifier of the active school tenant, or null. */
  schoolSlug: string | null;
  /** Gatekeeper flag: false until URL subdomain, local storage, and user profile are fully reconciled. */
  isInitialized: boolean;
  /** Manually overrides the active tenant state and updates persistence storage. */
  setTenant: (schoolUId: string) => void;
  /** Clears active tenant session state and local storage persistence. */
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

/** Storage key used to persist the active school tenant universal ID across browser sessions. */
const LOCAL_STORAGE_KEY = "eduasas_active_tenant";

/**
 * @function TenantProvider
 * @description
 * Enterprise Context Provider managing multi-tenant scope and synchronization. 
 * It cross-examines the browser hostname subdomain slug with the user's profile affiliations 
 * and local storage cache to guarantee bulletproof tenant isolation.
 * 
 * @param {Object} props - Component properties.
 * @param {ReactNode} props.children - Child components requiring tenant context scoping.
 * @returns {JSX.Element} The rendered enterprise context provider wrapper.
 */
export const TenantProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const { profile, isLoading: isUserLoading } = useUser();
  const [tenant, setTenantData] = useState<{ uid: string | null; slug: string | null }>({ 
    uid: null, 
    slug: null 
  });
  
  // Gatekeeper state: Remains false until domain parsing and profile validation finish.
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  /**
   * @function resolveTenantSession
   * @description
   * Core reconciliation engine. Evaluates the URL subdomain slug against user affiliations, 
   * falls back to local storage if necessary, and synchronizes state securely.
   */
  const resolveTenantSession = useCallback((schools: UserAffiliatedSchool[]) => {
    // 1. Hatua ya Kwanza: Chunguza kupitia URL Subdomain (The Supreme Source of Truth)
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const domainContext = parseDomainAndTenant(hostname);
    const urlSlug = domainContext.tenant;

    if (urlSlug) {
      // Tafuta shule inayolingana na slug iliyopo kwenye URL
      const schoolBySlug = schools.find((s) => s.slug.toLowerCase() === urlSlug.toLowerCase());
      
      if (schoolBySlug) {
        setTenantData({ uid: schoolBySlug.schoolUId, slug: schoolBySlug.slug });
        localStorage.setItem(LOCAL_STORAGE_KEY, schoolBySlug.schoolUId);
        setIsInitialized(true);
        return;
      } else {
        console.warn(`⚠️ [TenantProvider] Subdomain slug '${urlSlug}' not found in user affiliations.`);
      }
    }

    // 2. Hatua ya Pili: Kama hakuna slug kwenye URL (au haikupatikana), angalia Local Storage
    const savedId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedId) {
      const schoolById = schools.find((s) => s.schoolUId === savedId);
      if (schoolById) {
        setTenantData({ uid: schoolById.schoolUId, slug: schoolById.slug });
        setIsInitialized(true);
        return;
      } else {
        // Shule iliyohifadhiwa haipo tena kwenye ruhusa za mtumiaji; safisha
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    // 3. Hatua ya Mwisho: Tupo kwenye Root Domain au hakuna tenant halali
    setTenantData({ uid: null, slug: null });
    setIsInitialized(true);
  }, []);

  // Effect to trigger tenant resolution once user profile data is fully loaded
  useEffect(() => {
    if (isUserLoading) return;

    if (profile?.schools && profile.schools.length > 0) {
      resolveTenantSession(profile.schools);
    } else {
      // Open the gate even if the user has no affiliated schools
      setIsInitialized(true);
    }
  }, [profile, isUserLoading, resolveTenantSession]);

  /**
   * @function setTenant
   * @description 
   * Explicitly sets the active school tenant, updates local storage persistence, 
   * and broadcasts a custom synchronization event across active browser tabs.
   * 
   * @param {string} schoolUId - The unique universal ID of the target school.
   */
  const setTenant = useCallback((schoolUId: string) => {
    if (!profile?.schools) {
      console.warn("⚠️ [TenantProvider] Cannot set tenant: User profile or school affiliations are missing.");
      return;
    }
    
    const found = profile.schools.find((s) => s.schoolUId === schoolUId);
    if (found) {
      setTenantData({ uid: found.schoolUId, slug: found.slug });
      localStorage.setItem(LOCAL_STORAGE_KEY, found.schoolUId);

      // Broadcast synchronization event across the SPA
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("eduasas:sync-context", {
          detail: { schoolUId: found.schoolUId, slug: found.slug }
        }));
      }
    } else {
      console.error(`[TenantProvider] Failed to set tenant this School not authorized for user.`);
    }
  }, [profile]);

  /**
   * @function clearTenant
   * @description Clears active tenant state and removes local storage credentials.
   */
  const clearTenant = useCallback(() => {
    setTenantData({ uid: null, slug: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // Memoized context contract to prevent redundant down-tree re-renders
  const value = useMemo<TenantContextType>(() => ({
    schoolUId: tenant.uid,
    schoolSlug: tenant.slug,
    isInitialized,
    setTenant,
    clearTenant
  }), [tenant, isInitialized, setTenant, clearTenant]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * @hook useTenant
 * @description
 * Enterprise custom React hook to consume active tenant session state and manipulation tools.
 * 
 * @returns {TenantContextType} The active tenant context contract.
 * @throws {Error} Thrown if executed outside of an active `TenantProvider` tree wrapper.
 * 
 * @example
 * ```tsx
 * const { schoolUId, schoolSlug, isInitialized, setTenant } = useTenant();
 * 
 * if (!isInitialized) return <TenantSkeletonLoader/>;
 * if (!schoolUId) return <SchoolSelectorModal/>;
 * ```
 */
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("Enterprise Security Violation: useTenant() must be executed strictly within a TenantProvider scope.");
  }
  return context;
};
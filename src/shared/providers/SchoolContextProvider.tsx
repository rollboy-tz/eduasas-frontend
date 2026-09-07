/**
 * @fileoverview EduAsas Enterprise School Context Provider (Subdomain Architecture)
 * @description 
 * ### ARCHITECTURE OVERVIEW:
 * This provider serves as the primary multi-tenant security and state orchestration layer 
 * for the EduAsas platform. It transitions away from legacy path-based routing (`/s/[schoolId]`) 
 * in favor of a strict **Subdomain-based Architecture (`school-slug.domain.ext`)**.
 * 
 * ### CORE RESPONSIBILITIES:
 * 1. **Domain & Tenant Parsing:** Evaluates incoming request hostnames via `parseDomainAndTenant` 
 *    to securely isolate workspace contexts.
 * 2. **Single-Flight Fetching:** Uses TanStack Query to fetch, cache, and synchronize the school 
 *    workspace context (`/school/context`) without redundant network requests.
 * 3. **RBAC Security Guard:** Computes staff hierarchy, privilege priority, and operational restrictions 
 *    (`LOCKED`, `READ-ONLY`, `ACTIVE`, `SUPER_ADMIN`) to protect downstream UI mutations.
 * 4. **Fail-Safe Environment Handling:** Dynamically handles local development (`http` + dynamic ports) 
 *    versus production/beta (`https`) during error recovery redirections.
 * 
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.2.0-Enterprise
 * @see {@link parseDomainAndTenant} For domain parsing specifications.
 */

import React, { createContext, useContext, useCallback, useMemo, JSX } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
    SchoolContextResponse,
    RestrictionLevel,
    SchoolContext as ISchoolContext,
    StaffContext,
    UserContext
} from "@/types";
import { showFeedback } from "@/components/modals";
import { parseDomainAndTenant, RequestContext } from "@/lib/utils";

/* =========================================================
   TYPES & INTERFACES (ENTERPRISE CONTRACTS)
   ========================================================= */

/**
 * @type ContextStatus
 * @description Represents the lifecycle state of the multi-tenant school workspace session.
 * - `idle`: Initial mounting phase before evaluation.
 * - `loading`: Network request is actively fetching context data.
 * - `ready`: Context successfully verified and loaded.
 * - `no-context`: User is either on the root domain or lacks an active school tenant assignment.
 * - `error`: Network or server failure encountered while verifying session integrity.
 */
export type ContextStatus = "idle" | "loading" | "ready" | "no-context" | "error";

/**
 * @interface SchoolContextType
 * @description 
 * The master context contract provided to the entire application tree. 
 * Guarantees strict type safety across all school-scoped views, hooks, and security guards.
 */
export interface SchoolContextType {
    /** Active school profile details, configuration, and identifiers. */
    school: ISchoolContext | null;
    /** Staff details, employment status, and organizational profile of the current user. */
    staff: StaffContext | null;
    /** Global user account context (System roles, authentication state). */
    user: UserContext | null;
    /** Current operational state of the tenant engine. */
    status: ContextStatus;
    /** Convenience boolean flag: true while fetching context data. */
    isLoading: boolean;
    /** Convenience boolean flag: true when context is fully resolved and ready. */
    isReady: boolean;
    /** Convenience boolean flag: true if a valid school workspace context exists. */
    hasContext: boolean;
    /** Parsed Request Context metadata (Stage, Subdomain Tenant Slug, Base Domain). */
    domainContext: RequestContext;
    
    /** Forces a manual background re-fetch of the current school workspace context. */
    refreshContext: () => void;
    /** Clears local cache entries for the current tenant context. */
    clearContext: () => void;

    // --- SECURITY & RBAC PERMISSION HELPERS ---
    /** Indicates if the user's account is locked or suspended within this school. */
    isLocked: boolean;
    /** Indicates if the user's workspace access is strictly restricted to read-only mode. */
    isReadOnly: boolean;
    /** Indicates if the staff member's active status is fully operational. */
    isActive: boolean;
    /** Indicates if the user holds ownership privileges over this school workspace. */
    isOwner: boolean;
    /** Indicates if the user is a global platform Super Administrator. */
    isSuperAdmin: boolean;
    /** The resolved primary operational role key of the staff member, or null. */
    primaryRole: string | null;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

/* =========================================================
   PROVIDER IMPLEMENTATION
   ========================================================= */

/**
 * @function SchoolContextProvider
 * @description
 * Enterprise boundary provider wrapping protected school-level application trees. 
 * It inspects the browser hostname to extract the tenant slug, manages caching lifecycle via TanStack Query, 
 * computes fine-grained security permissions, and traps critical runtime synchronization errors.
 * 
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components requiring multi-tenant context access.
 * @returns {JSX.Element} The rendered context provider tree.
 */
export function SchoolContextProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const queryClient = useQueryClient();

    // 1. EXTRACT & PARSE HOSTNAME (Subdomain Architecture Enforcement)
    const domainContext = useMemo<RequestContext>(() => {
        if (typeof window === "undefined") {
            return { stage: "prod", tenant: null, isRootDomain: true, domain: "eduasas.co.tz" };
        }
        return parseDomainAndTenant(window.location.hostname);
    }, []);

    // 2. TANSTACK QUERY ENGINE (Single-Flight Tenant Data Fetching)
    // Automatically disabled if the user is visiting the root domain.
    const { 
        data, 
        isLoading, 
        isError, 
        error, 
        refetch 
    } = useQuery<SchoolContextResponse, Error>({
        queryKey: ["school-subdomain-context", domainContext.tenant],
        queryFn: () => apiFetch<SchoolContextResponse>("/school/context"),
        enabled: !domainContext.isRootDomain && !!domainContext.tenant,
        staleTime: 1000 * 60 * 5, // Context data remains fresh for 5 minutes
        gcTime: 1000 * 60 * 30,    // Retained in memory cache for 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });

    /**
     * Evaluates the active workspace status based on domain constraints and query lifecycles.
     */
    const status = useMemo<ContextStatus>(() => {
        if (domainContext.isRootDomain) return "no-context";
        if (isLoading) return "loading";
        if (isError) {
            const errAny = error as any;
            if (errAny?.statusCode === 404 || errAny?.errorCode === "CONTEXT_REQUIRED") {
                return "no-context";
            }
            return "error";
        }
        if (data?.school) return "ready";
        return "no-context";
    }, [domainContext.isRootDomain, isLoading, isError, error, data]);

    /**
     * @function clearContext
     * @description Evicts the school context cache entry from the global TanStack Query store.
     */
    const clearContext = useCallback(() => {
        queryClient.setQueryData(["school-subdomain-context", domainContext.tenant], null);
    }, [queryClient, domainContext.tenant]);

    // =========================================================
    // PERMISSION CALCULATOR (The Enterprise RBAC Engine)
    // =========================================================
    const helpers = useMemo(() => {
        if (!data) {
            return {
                isLocked: false, 
                isReadOnly: false, 
                isActive: false,
                isOwner: false, 
                isSuperAdmin: false, 
                primaryRole: null,
            };
        }

        const isSuperAdmin = data.user?.systemRole === "SUPER_ADMIN";
        const roles = data.staff?.assignedRoles ?? [];

        // Sort roles by privilege priority (Ascending order: 1 represents highest administrative power)
        const sortedRoles = [...roles].sort((a, b) => a.priority - b.priority);
        const topRole = sortedRoles[0];

        const restriction = topRole?.restrictionLevel as RestrictionLevel | undefined;
        const staffStatus = data.staff?.status;

        const primaryRole = isSuperAdmin ? "SUPER_ADMIN" : topRole?.roleKey ?? null;

        return {
            isSuperAdmin,
            // SuperAdmins bypass all school-level operational restrictions
            isLocked: isSuperAdmin ? false : restriction === "LOCKED",
            isReadOnly: isSuperAdmin ? false : restriction === "READ-ONLY",
            isActive: isSuperAdmin ? true : staffStatus === "ACTIVE",
            isOwner: isSuperAdmin ? true : roles.some((r) => r.roleKey === "OWNER"),
            primaryRole,
        };
    }, [data]);

    // Memoized Context Value Contract to prevent wasteful downstream re-renders
    const contextValue = useMemo<SchoolContextType>(() => ({
        school: data?.school ?? null,
        staff: data?.staff ?? null,
        user: data?.user ?? null,
        status,
        isLoading: status === "loading",
        isReady: status === "ready",
        hasContext: status === "ready" && !!data?.school,
        domainContext,
        refreshContext: () => { void refetch(); },
        clearContext,
        ...helpers,
    }), [data, status, domainContext, refetch, clearContext, helpers]);

    // =========================================================
    // ERROR BOUNDARY & FAIL-SAFE REDIRECTION INJECTOR
    // =========================================================
    if (status === "error" && typeof window !== "undefined") {
        const errAny = error as any;
        
        // Dynamically configure protocol (http for local development, https for secure beta/production)
        const isLocal = domainContext.stage === "local";
        const protocol = isLocal ? "http" : "https";
        const port = isLocal && window.location.port ? `:${window.location.port}` : "";
        const rootHomeUrl = `${protocol}://${domainContext.domain}${port}/home`;

        showFeedback({
            title: `Workspace Sync Error (${errAny?.statusCode || 500})`,
            type: "error",
            message: errAny?.message || "Critical failure verifying school context session.",
            actions: [
                { 
                    label: "Abort & Exit Portal", 
                    onClick: () => { window.location.href = rootHomeUrl; }, 
                    variant: "danger" 
                },
                { 
                    label: "Retry", 
                    onClick: () => { void refetch(); }, 
                    variant: "primary" 
                },
            ]
        });
    }

    return (
        <SchoolContext.Provider value={contextValue}>
            {children}
        </SchoolContext.Provider>
    );
}

/* =========================================================
   ENTERPRISE CONSUMER HOOKS API
   ========================================================= */

/**
 * @hook useSchoolContext
 * @description 
 * Primary enterprise custom hook to consume active multi-tenant school session states.
 * 
 * @returns {SchoolContextType} The active school workspace context.
 * @throws {Error} Thrown if executed outside an active `SchoolContextProvider` tree wrapper.
 * 
 * @example
 * ```tsx
 * const { school, isReady, isLoading } = useSchoolContext();
 * if (isLoading) return <SkeletonLoader/>;
 * return <h1>Welcome to {school?.name}</h1>;
 * ```
 */
export const useSchoolContext = (): SchoolContextType => {
    const context = useContext(SchoolContext);
    if (!context) {
        throw new Error("Enterprise Security Violation: useSchoolContext() must be executed strictly within a SchoolContextProvider scope.");
    }
    return context;
};

/**
 * @hook useSchoolContextOptional
 * @description 
 * Safe optional hook variant. Returns the active context value or `undefined` 
 * without throwing runtime exceptions if called outside a provider boundary.
 */
export const useSchoolContextOptional = (): SchoolContextType | undefined => {
    return useContext(SchoolContext);
};

/**
 * @hook useSchoolContextInfo
 * @description 
 * Lightweight utility hook tailored for dashboard headers and layout widgets 
 * requiring core school identification markers and status flags.
 */
export const useSchoolContextInfo = () => {
    const { school, isReady, hasContext, status, domainContext, refreshContext, clearContext } = useSchoolContext();
    return { school, isReady, hasContext, domainContext, refreshContext, clearContext, contextStatus: status };
};

/**
 * @hook useStaffPermissions
 * @description 
 * Dedicated RBAC security hook. Exposes capability flags (`isLocked`, `isReadOnly`, `isActive`, `isOwner`, `isSuperAdmin`) 
 * used to guard sensitive interactive elements like data mutations, approvals, and deletion buttons.
 */
export const useStaffPermissions = () => {
    const { isLocked, isReadOnly, isActive, isOwner, isSuperAdmin, primaryRole } = useSchoolContext();
    return { isLocked, isReadOnly, isActive, isOwner, isSuperAdmin, primaryRole };
};
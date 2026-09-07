/**
 * @file session-validator.ts
 * @description Manages user session verification using TanStack Query. 
 * Provides single-flight protection, intelligent caching, and resilience against 
 * temporary network failures (preventing false unauthenticated states during timeouts).
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch, isApiError } from "@/lib/api";

/* =========================================================
   1. CORE FETCHER (THE ENGINE)
   ========================================================= */

/**
 * @function validateSessionApi
 * @description
 * Low-level utility function that pings the backend session verification endpoint.
 * Leverages `apiFetch` and intelligently distinguishes between temporary network glitches 
 * (which should trigger a retry) and actual authentication failures (which require logout).
 * 
 * @returns {Promise<boolean>} Resolves to `true` if the session is valid and active.
 * @throws {ApiError} Throws network or server errors so TanStack Query can execute retry logic.
 */
export async function validateSessionApi(): Promise<boolean> {
  try {
    // Pings the backend auth validation endpoint. If it succeeds without error, session is valid.
    await apiFetch<any>("/auth/validate");
    return true;
  } catch (error: unknown) {
    // Check if the caught error is our canonical ApiError instance
    if (isApiError(error)) {
      // Determine if this is a definitive authentication or authorization failure
      const isAuthError =
        error.statusCode === 401 ||
        error.action === "RE_AUTHENTICATE" ||
        error.action === "LOGOUT" ||
        error.errorCode === "SESSION_EXPIRED" ||
        error.errorCode === "INVALID_SESSION" ||
        error.errorCode === "SESSION_NOT_FOUND" ||
        (error.status === "error" && error.message.toLowerCase().includes("session"));

      if (isAuthError) {
        // Session is genuinely dead/expired. Notify global application listeners.
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("eduasas:re-authenticate", { 
            detail: { message: error.message, statusCode: error.statusCode } 
          }));
        }
        return false; // Return false to indicate invalid session
      }
    }

    // For non-auth errors (e.g., 500 Server Error, Gateway Timeout, Network Offline),
    // DO NOT return false. Re-throw the error so TanStack Query can perform retries.
    throw error;
  }
}

/* =========================================================
   2. TANSTACK QUERY HOOK (THE MANAGER)
   ========================================================= */

/**
 * @function useSessionValidation
 * @description
 * Custom TanStack Query hook managing the complete user session lifecycle on the frontend.
 * 
 * Key Features:
 * - **Caching:** Preserves verification results for 30 seconds (`staleTime`) to prevent spamming requests.
 * - **Deduplication:** Multiple components calling this hook concurrently trigger only 1 network request.
 * - **Resilience:** Automatically retries up to 2 times with exponential backoff if a network timeout occurs.
 * 
 * @returns TanStack Query result object containing `data` (boolean), `isLoading`, `isError`, etc.
 * 
 * @example
 * ```tsx
 * const { data: isSessionValid, isLoading, isError } = useSessionValidation();
 * 
 * if (isLoading) return <LoadingScreen/>;
 * if (isError) return <NetworkErrorAlert/>; // Network issues persist after retries
 * if (!isSessionValid) return <Navigate replace to="/login"/>; // Session expired
 * ```
 */
export function useSessionValidation() {
  return useQuery({
    // Unique query key for cache identification and manual invalidation
    queryKey: ["session-validity"],
    
    // Core function that executes the verification ping
    queryFn: validateSessionApi,
    
    // UI Optimization: Treat session validity data as fresh for 30 seconds
    staleTime: 30 * 1000, 
    
    // Keep cached data in memory for 5 minutes even if components unmount
    gcTime: 5 * 60 * 1000, 
    
    // Prevent refetching when the user switches browser tabs, saving bandwidth
    refetchOnWindowFocus: false, 
    
    // Resilience: If validateSessionApi throws a network error, retry twice
    retry: 2,
    
    // Exponential backoff delay between retries (Attempt 1: ~1s, Attempt 2: ~2s, max 10s)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
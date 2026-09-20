/**
 * @fileoverview Auth Security Engine (The Fortress)
 * @description Manages user identity, tenant contexts, and secure state teardowns. 
 * Acts as the primary line of defense by purging query caches and validating sessions 
 * across the Vite Single Page Application.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { validateSessionApi, logoutAndRedirect } from "@/lib/handlers";
import { apiMutation } from "@/lib/api";
import { TenantProvider } from "./TenantProvider";
import { SchoolDataProvider } from "./SchoolDataProvider";
import { getUserKey } from "@/lib/utils";
import { EduScreenLoader } from "@/components/elements";
import { showFeedback } from "@/components/modals";

/**
 * @interface AuthContextType
 * @description Contract defining the authentication state and actions available to the application.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionKey: string | null;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Public routes that do not require active session validation on mount,
 * preventing unnecessary network overhead.
 */
const PUBLIC_ROUTES = new Set([
  "/login",
  "/register",
  "/password",
  "/verify",
  "/",
]);

/**
 * @function AuthProvider
 * @description
 * The core security provider component (`The Guard`). Handles:
 * 1. Cache Purging (Preventing stale data leaks across user sessions).
 * 2. Session Validation (Guarding private endpoints against unauthorized access).
 * 3. Global Event Synchronization (Listening to cross-tab login/logout events).
 * 
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components wrapped by the security engine.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const isLoggingOut = useRef<boolean>(false);

  // Determine if the current window location is a public route (Vite-compatible)
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isPublicRoute = PUBLIC_ROUTES.has(currentPath);

  /**
   * @function handleLogout
   * @description
   * Executes a strict security teardown: clears TanStack Query memory cache, 
   * purges local storage, pings the backend termination endpoint using `apiMutation`, 
   * and forces a clean redirect to the sign-in portal.
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      // 1. HARD PURGE: Clear all TanStack query caches to prevent memory data leaks
      queryClient.clear();

      // 2. Clear persistent web storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Signal Server via our secure apiMutation utility
      await apiMutation("POST", "/auth/logout");
    } catch (error) {
      console.error("⚠️ [Security] Server logout ping failed, forcing local cleanup sequence.", error);
    } finally {
      // 4. Delegate to our robust centralized logout redirect utility
      await logoutAndRedirect();
    }
  }, [queryClient]);

  /* -------------------------------------------------------
     EVENT LISTENERS - "The Sync Engine"
     ------------------------------------------------------- */
  useEffect(() => {
    const handleNewSession = () => {
      const activeKey = getUserKey();
      queryClient.clear();
      setSessionKey(activeKey);
      setAuthenticated(true);
    };

    // Captures session expiration events and displays an enterprise-grade strict security feedback modal
    const handleReAuthenticate = (event: Event) => {
      if (isLoggingOut.current) return;

      const customEvent = event as CustomEvent<{ message?: string; statusCode?: number }>;
      const errorMsg = customEvent.detail?.message || "Your session has expired or your security token is invalid. Please sign in again to continue.";

      showFeedback({
        type: "error",
        isStrict: true,
        title: "Session Expired",
        message: errorMsg,
        actions: [
          {
            variant: "secondary",
            label: "Sign In",
            onClick: async () => {
              isLoggingOut.current = true;
              queryClient.clear();
              localStorage.clear();
              sessionStorage.clear();
              await logoutAndRedirect();
            }
          }
        ]
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("eduasas:login", handleNewSession as EventListener);
      window.addEventListener("eduasas:logout", handleLogout as EventListener);
      window.addEventListener("eduasas:re-authenticate", handleReAuthenticate as EventListener);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("eduasas:login", handleNewSession as EventListener);
        window.removeEventListener("eduasas:logout", handleLogout as EventListener);
        window.removeEventListener("eduasas:re-authenticate", handleReAuthenticate as EventListener);
      }
    };
  }, [handleLogout, queryClient]);

  /* -------------------------------------------------------
     INITIAL SESSION CHECK
     ------------------------------------------------------- */
  useEffect(() => {
    if (isPublicRoute) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      setIsLoading(true);
      try {
        const isValid = await validateSessionApi();
        if (isMounted) {
          setAuthenticated(isValid);
          if (isValid) {
            setSessionKey(getUserKey());
          }
        }
      } catch {
        if (isMounted) {
          setAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [isPublicRoute]);

  // Display screen loader during initial session validation on protected routes
  if (isLoading && !isPublicRoute) {
    return <EduScreenLoader loadingText="A moment please" />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, handleLogout, sessionKey }}>
      {/* Security Barrier: Tenant and School Contexts depend entirely on active authentication */}
      <TenantProvider>
        <SchoolDataProvider>
          {children}
        </SchoolDataProvider>
      </TenantProvider>
    </AuthContext.Provider>
  );
}

/**
 * @hook useAuth
 * @description
 * Custom React hook to consume authentication state and execution methods.
 * 
 * @returns {AuthContextType} The active authentication context.
 * @throws {Error} Thrown if called outside of an active `AuthProvider` scope.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used strictly within an AuthProvider scope.");
  }
  return context;
};
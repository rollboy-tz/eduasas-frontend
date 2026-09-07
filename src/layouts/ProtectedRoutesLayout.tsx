/**
 * @fileoverview Protected Route Component for Root / Enterprise Level Views
 * @description 
 * ### ARCHITECTURE OVERVIEW:
 * Acts as a strict security guard interceptor for non-school (root domain) React routes. 
 * It coordinates with the global authentication lifecycle (`useAuth`) to ensure that 
 * unauthenticated or session-expired users cannot access protected enterprise workspaces.
 * 
 * ### BEHAVIORAL CONTRACT:
 * 1. **Loading State:** Renders a high-performance branded loader (`EduScreenLoader`) 
 *    while asynchronous session verification is in progress.
 * 2. **Unauthenticated Interception:** Automatically flushes unauthorized attempts 
 *    and issues a clean client-side redirection (`Navigate`) back to the login portal.
 * 3. **Authorized Passage:** Unlocks layout nested outlets (`<Outlet />`) upon successful 
 *    session confirmation.
 * 
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 2.0.0-Enterprise
 * @see {@link useAuth} For underlying authentication state orchestration.
 */

import { JSX } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/shared/providers";
import { EduScreenLoader } from "@/components/elements";

/**
 * @function ProtectedRoute
 * @description 
 * Route guard component wrapping enterprise-level routes to enforce authentication boundaries.
 * Captures current path location state to allow intelligent post-login redirects if necessary.
 * 
 * @returns {JSX.Element} The rendered protected route outlet or redirect/loading element.
 */
export const ProtectedRoutes = (): JSX.Element => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Session Verification & Hydration Phase
  if (isLoading) {
    return (
      <EduScreenLoader loadingText="Verifying session..." />
    );
  }

  // 2. Authentication Enforcement & Interception
  if (!isAuthenticated) {
    // Preserve the attempted target URL in router state for seamless post-login redirection
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Authorized Workspace Access Resolution
  return <Outlet />;
};

export const ProtectedRoutesLayout = (): JSX.Element => {
  return (
    <AuthProvider>
      <ProtectedRoutes />
    </AuthProvider>
  )
}
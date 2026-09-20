/**
 * @file src/lib/logout-and-redirect.ts
 * @description Centralized logout utility for the EduAsas platform.
 * Clears all client-side storage (localStorage, sessionStorage, client cookies), 
 * triggers backend destruction of HttpOnly session cookies, dispatches global logout events, 
 * and safely redirects the user to a fresh sign-in page without return callbacks (loop-free).
 */

import { api } from "../api";
import { parseDomainAndTenant } from "@/lib/utils";

/**
 * @function logoutAndRedirect
 * @description
 * Executes a complete, secure session teardown and redirects cleanly to the root login page.
 * 
 * @returns {Promise<void>} Resolves once cleanup and redirection triggers are initiated.
 */
export const logoutAndRedirect = async (): Promise<void> => {
  // 1. Notify all active listeners across the SPA that a logout has been initiated
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:logout"));
  }

  // 2. Purge all client-side web storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (err) {
    console.error("⚠️ [Logout] Failed to clear local/session storage:", err);
  }

  // 3. Purge all accessible non-HttpOnly client cookies
  const purgeClientCookies = () => {
    if (typeof document === "undefined") return;

    const cookies = document.cookie.split(";");
    const hostname = window.location.hostname;
    const domainParts = hostname.split(".");
    const rootDomain = domainParts.length > 2 
      ? `.${domainParts.slice(-2).join(".")}` 
      : hostname;

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

      const expiredAt = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = `${name}=; ${expiredAt}; path=/;`;
      document.cookie = `${name}=; ${expiredAt}; path=/; domain=${hostname};`;
      document.cookie = `${name}=; ${expiredAt}; path=/; domain=${rootDomain};`;
    });
  };

  purgeClientCookies();

  // 4. TERMINATE SERVER-SIDE SESSION (HttpOnly Cookies)
  try {
    const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "https://api.eduasas.co.tz";
    
    if (typeof fetch === "function") {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
    } else {
      await api.post('/auth/logout');
    }
  } catch (err) {
    console.error("⚠️ [Logout] Server logout ping failed, proceeding with client-side teardown...", err);
  }

  // 5. FRESH REDIRECTION TO SIGN-IN (No return_url loop risk)
  setTimeout(() => {
    if (typeof window !== "undefined") {
      const context = parseDomainAndTenant();
      
      // Inapeleka moja kwa moja kwenye root login page (mfano: http://localhost:3000/login au https://eduasas.co.tz/login)
      window.location.href = `${context.rootOrigin}/login`;
    }
  }, 50);
};
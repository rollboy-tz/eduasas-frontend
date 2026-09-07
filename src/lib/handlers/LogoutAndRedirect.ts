/**
 * @file src/lib/logout-and-redirect.ts
 * @description Centralized logout utility for the EduAsas platform.
 * Clears all client-side storage (localStorage, sessionStorage, client cookies), 
 * triggers backend destruction of HttpOnly session cookies, dispatches global logout events, 
 * and safely redirects the user to the sign-in page with an active return callback URL.
 */

import { api } from "../api";

/**
 * @function logoutAndRedirect
 * @description
 * Executes a complete, secure session teardown. 
 * Prevents race conditions during browser redirection by using network `keepalive` 
 * for the server logout ping, ensuring HttpOnly cookies are successfully cleared on the backend.
 * 
 * @returns {Promise<void>} Resolves once cleanup and redirection triggers are initiated.
 * 
 * @example
 * ```ts
 * // Trigger manual logout from user settings menu
 * await logoutAndRedirect();
 * ```
 */
export const logoutAndRedirect = async (): Promise<void> => {
  // 1. Notify all active listeners across the SPA that a logout has been initiated
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:logout"));
  }

  // 2. Capture the current pathname and search query for post-login redirection
  const currentPath = typeof window !== "undefined" 
    ? window.location.pathname + window.location.search 
    : "/home";

  // 3. Purge all client-side web storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (err) {
    console.error("⚠️ [Logout] Failed to clear local/session storage:", err);
  }

  // 4. Purge all accessible non-HttpOnly client cookies
  const purgeClientCookies = () => {
    if (typeof document === "undefined") return;

    const cookies = document.cookie.split(";");
    const hostname = window.location.hostname;
    // Extract root domain for robust cookie clearing (e.g., app.eduasas.co.tz -> .eduasas.co.tz)
    const domainParts = hostname.split(".");
    const rootDomain = domainParts.length > 2 
      ? `.${domainParts.slice(-2).join(".")}` 
      : hostname;

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

      // Expire cookie across standard paths and domains
      const expiredAt = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = `${name}=; ${expiredAt}; path=/;`;
      document.cookie = `${name}=; ${expiredAt}; path=/; domain=${hostname};`;
      document.cookie = `${name}=; ${expiredAt}; path=/; domain=${rootDomain};`;
    });
  };

  purgeClientCookies();

  // 5. TERMINATE SERVER-SIDE SESSION (HttpOnly Cookies)
  // CRITICAL FIX: We use native fetch with `keepalive: true` to prevent the browser 
  // from aborting the logout network request when `window.location.href` triggers navigation.
  try {
    const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "/api";
    
    if (typeof fetch === "function") {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        keepalive: true, // Inahakikisha ombi linafika server hata kama browser inafunga/inabadilisha ukurasa
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
    } else {
      // Fallback to axios instance if fetch isn't available
      await api.post('/auth/logout');
    }
  } catch (err) {
    console.error("⚠️ [Logout] Server logout ping failed, proceeding with client-side teardown...", err);
  }

  // 6. SAFE REDIRECTION TO SIGN-IN
  // Delay slightly (50ms) to allow any final synchronous event loops to clear, 
  // then redirect with the encoded callback parameter.
  setTimeout(() => {
    if (typeof window !== "undefined") {
      const encodedCallback = encodeURIComponent(currentPath);
      window.location.href = `/login?return_url=${encodedCallback}`;
    }
  }, 50);
};
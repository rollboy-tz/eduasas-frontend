/**
 * @fileoverview Advanced Enterprise Redirect Destination Utility Hook
 * @author Injinia Rollboy (EduAsas Tech)
 * @version 3.0.5-Enterprise-Beast
 */

import { useLocation } from "react-router-dom";

/**
 * Internal type definition for location state structure passed through React Router.
 */
interface LocationStateFrom {
    pathname?: string;
    search?: string;
    hash?: string;
    [key: string]: unknown;
}

/**
 * Interface representing the complete structure of utility methods and properties 
 * returned by the `useRedirectDestination` hook.
 */
export interface UseRedirectDestinationReturn {
    redirectTo: string;
    originalDestination: LocationStateFrom | undefined;
    
    /**
     * 🔗 Generates a router Link state configuration object, optionally accepting a 
     * modified URL string to pass along query updates across authentication portals.
     */
    getPreservedState: (customUrl?: string) => { state: { from: LocationStateFrom | undefined } };
    
    addQuery: (params: Record<string, string>) => string;
    removeQuery: (keys: string[]) => string;
    replaceQuery: (params: Record<string, string>) => string;
    createNew: (newPath: string, params?: Record<string, string>) => string;
    dropHistory: () => void;
}

/**
 * Interface representing the raw shape of React Router location object state.
 */
interface CustomLocationState {
    from?: LocationStateFrom;
    [key: string]: unknown;
}

/**
 * @function useRedirectDestination
 * @description 
 * Custom React hook that reads router state to extract original destination parameters,
 * computes fallback URLs, and provides state-forwarding and URL-manipulation helpers safely.
 * 
 * ### COMPREHENSIVE USAGE EXAMPLE:
 * ```tsx
 * import { useNavigate, Link } from "react-router-dom";
 * import { useRedirectDestination } from "@/hooks/useRedirectDestination";
 * 
 * export const LoginPortal = () => {
 *   const navigate = useNavigate();
 *   const { redirectTo, addQuery, removeQuery, replaceQuery, createNew, dropHistory, getPreservedState } = useRedirectDestination("/home");
 * 
 *   const handleLoginSuccess = () => {
 *     const cleanedUrl = removeQuery(["token_expired", "error_code"]);
 *     const finalUrl = addQuery({ session: "active", welcome: "true" });
 *     navigate(finalUrl, { replace: true });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleLoginSuccess}>Sign In</button>
 *       <Link to="/register" {...getPreservedState()}>Register</Link>
 *     </div>
 *   );
 * };
 * ```
 * 
 * @param {string} [fallbackUrl="/home"] - The default route to navigate to if no prior history state exists.
 * @returns {UseRedirectDestinationReturn} Object containing resolved route string and utility helper functions.
 */

export const useRedirectDestination = (fallbackUrl: string = "/home"): UseRedirectDestinationReturn => {
    const location = useLocation();

    const routerState = (location.state as CustomLocationState) || {};
    const originalDestination = routerState.from;

    const fromPath = originalDestination?.pathname || "";
    const fromSearch = originalDestination?.search || "";

    const redirectTo = fromPath ? `${fromPath}${fromSearch}` : fallbackUrl;

    /**
     * 🔗 **getPreservedState**
     * Generates a router Link state configuration object, optionally accepting a 
     * modified URL string so that any query additions, removals, or replacements 
     * are seamlessly passed along when jumping between auth portals (e.g., Login <-> Register).
     * 
     * @param {string} [customUrl] - Optional modified URL string to preserve. Defaults to current `redirectTo`.
     * @returns {{ state: { from: LocationStateFrom | undefined } }} The router state binding object.
     * 
     * @example
     * ```tsx
     * const modifiedUrl = addQuery({ ref: "banner_promo" });
     * 
     * <Link to="/register" {...getPreservedState(modifiedUrl)}>
     *   Create an Account (Preserving modified queries)
     * </Link>
     * ```
     */
    const getPreservedState = (customUrl?: string) => {
        const targetUrl = customUrl || redirectTo;
        const baseOrigin = window.location.origin;

        try {
            const urlObj = new URL(targetUrl, baseOrigin);
            const preservedDestination: LocationStateFrom = {
                pathname: urlObj.pathname,
                search: urlObj.search,
                hash: urlObj.hash,
            };

            return {
                state: { from: preservedDestination },
            };
        } catch {
            return {
                state: { from: originalDestination },
            };
        }
    };

    /**
     * Utility Engine: Helper to safely parse and manipulate URL parameters 
     * using the native JavaScript URL constructor and current environment origin.
     */
    const manipulateUrl = (mutator: (urlObj: URL) => void): string => {
        const baseOrigin = window.location.origin;
        const currentUrlToParse = redirectTo || fallbackUrl;

        const urlObj = new URL(currentUrlToParse, baseOrigin);
        mutator(urlObj);

        return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    };

    /**
     * ➕ Appends or updates specified query parameters to the current `redirectTo` URL.
     * 
     * @param {Record<string, string>} params - Key-value pairs of query parameters to add or update.
     * @returns {string} The newly modified URL string with added query parameters.
     * 
     * @example
     * ```ts
     * const newUrl = addQuery({ status: "active", view: "grid" });
     * console.log(newUrl); // "/reports?tab=list&status=active&view=grid"
     * ```
     */
    const addQuery = (params: Record<string, string>): string => {
        return manipulateUrl((urlObj) => {
            Object.entries(params).forEach(([key, value]) => {
                urlObj.searchParams.set(key, value);
            });
        });
    };

    /**
     * ➖ Removes specified query parameter keys from the current `redirectTo` URL.
     * 
     * @param {string[]} keys - An array of query parameter keys to strip out.
     * @returns {string} The cleaned URL string without the specified query keys.
     * 
     * @example
     * ```ts
     * const cleanedUrl = removeQuery(["error", "token_expired"]);
     * console.log(cleanedUrl);
     * ```
     */
    const removeQuery = (keys: string[]): string => {
        return manipulateUrl((urlObj) => {
            keys.forEach((key) => {
                urlObj.searchParams.delete(key);
            });
        });
    };

    /**
     * 🔄 Completely replaces all existing search query parameters with a brand new set of keys and values.
     * 
     * @param {Record<string, string>} params - Key-value pairs representing the new set of parameters.
     * @returns {string} The updated URL string containing only the newly assigned parameters.
     * 
     * @example
     * ```ts
     * const freshUrl = replaceQuery({ fresh: "true", step: "2" });
     * console.log(freshUrl); // "/current-path?fresh=true&step=2"
     * ```
     */
    const replaceQuery = (params: Record<string, string>): string => {
        return manipulateUrl((urlObj) => {
            urlObj.search = "";
            Object.entries(params).forEach(([key, value]) => {
                urlObj.searchParams.set(key, value);
            });
        });
    };

    /**
     * 🚀 Instantiates a completely new custom destination path, overriding any historical context.
     * 
     * @param {string} newPath - The destination pathname (e.g., "/dashboard/overview").
     * @param {Record<string, string>} [params] - Optional query parameters to bundle with the new path.
     * @returns {string} The newly constructed custom URL string.
     * 
     * @example
     * ```ts
     * const customUrl = createNew("/analytics", { report: "annual" });
     * console.log(customUrl); // "/analytics?report=annual"
     * ```
     */
    const createNew = (newPath: string, params?: Record<string, string>): string => {
        const baseOrigin = window.location.origin || "http://localhost";
        const urlObj = new URL(newPath, baseOrigin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                urlObj.searchParams.set(key, value);
            });
        }

        return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    };

    /**
     * 🗑️ Drops and flushes out any historical destination context, resetting state back to empty or fallback.
     * 
     * @example
     * ```ts
     * dropHistory();
     * ```
     */
    const dropHistory = (): void => {
        if (originalDestination) {
            originalDestination.pathname = undefined;
            originalDestination.search = undefined;
        }
    };

    return {
        redirectTo,
        originalDestination,
        getPreservedState,
        addQuery,
        removeQuery,
        replaceQuery,
        createNew,
        dropHistory,
    };
};
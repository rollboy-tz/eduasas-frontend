/**
 * @file SchoolConsumerPage.tsx
 * @description Enterprise-grade consumer subdomain authentication handler optimized for Vite SPAs.
 * Captures cryptographic redirect tokens, executes secure backend validation via React Query,
 * cleans up sensitive URL parameters, handles invalid/expired token states gracefully with a minimal,
 * sleek UI, and redirects unauthenticated users safely back to the central portal using robust domain utilities.
 * 
 * @architecture Cross-Subdomain Session Handshake & Token Exchange Consumer (Vite SPA)
 */

import { useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { EduScreenLoader } from "@/components/elements";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, RefreshCcw } from "lucide-react";
import { parseDomainAndTenant } from "@/lib/utils";
import { Button } from "@/components/atoms";

export const SchoolConsumerPage = () => {
  /**
   * Parses native URL parameters safely in a Vite SPA environment.
   */
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = queryParams.get("token");
  const redirectTo = queryParams.get("redirect_to") || "/dashboard";

  /**
   * Determines the robust root fallback domain dynamically using the enterprise domain parsing utility.
   * Handles local development ports and multi-tenant subdomains seamlessly.
   * 
   * @returns {string} The fully qualified fallback URL pointing to the schools registry/portal.
   */
  const getRootDomainUrl = (): string => {

    //1 Use perse domain utils tu get host context
    const context = parseDomainAndTenant();

    // 2. Baind details origin with schools path
    return `${context.origin}/schools`;
  };

  // 1. Execute secure backend validation query via React Query only if token exists
  const { error, isLoading, isSuccess } = useQuery({
    queryKey: ["auth-consumer", token],
    queryFn: () => apiFetch(`/auth/consumer?token=${encodeURIComponent(token || "")}`),
    enabled: !!token,
    retry: false, // Strict security policy: Do not auto-retry invalid/expired consumer tokens
  });

  // 2. Handle immediate redirection if token parameter is completely missing from URL
  useEffect(() => {
    if (!token) {
      const fallbackUrl = getRootDomainUrl();
      window.location.replace(fallbackUrl);
    }
  }, [token]);

  // 3. Handle successful authentication handshake & cleanup URL parameters in Vite SPA
  useEffect(() => {
    if (isSuccess) {
      queryParams.delete("token");
      queryParams.delete("redirect_to");

      const cleanQuery = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const destination = `${redirectTo}${cleanQuery}`;

      // Replace state cleanly and navigate internally within the tenant workspace
      window.history.replaceState({}, "", destination);
      window.location.href = destination;
    }
  }, [isSuccess, queryParams, redirectTo]);

  // Render sleek enterprise loader while processing session synchronization
  if (isLoading || (token && !error)) {
    return <EduScreenLoader loadingText="Authenticating workspace session" />;
  }

  // Render minimal, smooth, and compact error UI if token is invalid, expired, or tampered with
  if (error || !token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md p-6 bg-white rounded-md border border-slate-200 text-center space-y-5 shadow-2xl"
        >
          <div className="w-15 h-15 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-8 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Authentication Failed</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
              {error?.message || "The security token provided is invalid or has already been consumed."}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center gap-3.5">

            <Button
              onClick={() => {
                window.location.href = getRootDomainUrl();
              }}
              variant="secondary"
              className="inline-flex items-center justify-center gap-2 rounded"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Portals
            </Button>

            <Button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded"

            >
              <RefreshCcw className="w-4 h-4" strokeWidth={2} />
              Retry
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return <EduScreenLoader loadingText="Redirecting..." />;
}
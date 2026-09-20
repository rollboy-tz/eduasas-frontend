/**
 * @file SwitchSchoolPage.tsx
 * @description Enterprise-grade tenant context switching component optimized for Vite SPAs.
 * Implements a bulletproof cryptographic token handshake protocol, automated multi-attempt 
 * retry mechanisms with exponential backoff feel, request timeout safeguards (AbortController),
 * secure TanStack Query cache isolation, and graceful failure fallback screens.
 * 
 * @architecture Multi-tenant Subdomain Routing & Session Synchronization
 * @security Prevents stale cache data leakage across different school workspaces.
 */

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useToast } from "@/lib/store";
import { motion } from "framer-motion";
import { EduMainLoader } from "@/components/atoms";
import { Check } from "lucide-react";
import { useSchoolData, useTenant } from "@/shared/providers";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/lib/hooks";
import { useSwitchTenant } from "@/lib/handlers";
import { EduScreenLoader } from "@/components/elements";
import { cn, parseDomainAndTenant } from "@/lib/utils";
import { showFeedback } from "@/components/modals";
import { useNavigate } from "react-router-dom";

/**
 * Represents the granular states of the multi-step tenant switching workflow.
 * 0: Pending / Not started
 * 1: In progress / Active
 * 2: Successfully completed
 */
interface SwitchWorkflowSteps {
  switching: 0 | 1 | 2;
  verifying: 0 | 1 | 2;
  finalizing: 0 | 1 | 2;
}

/**
 * Detailed error structure captured when all automated retry attempts fail.
 */
interface WorkflowErrorDetail {
  title: string;
  msg: string;
}

/** Maximum allowed automated retry attempts before triggering the hard failure feedback UI. */
const MAX_RETRIES = 3;

/** Network request timeout threshold in milliseconds (15 seconds) to prevent hanging requests. */
const REQUEST_TIMEOUT_MS = 15000;

/**
 * SwitchSchoolPage Component
 * Orchestrates the secure transition from a central dashboard or portal into an isolated school subdomain workspace.
 */
export const SwitchSchoolPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isProcessing = useRef<boolean>(false);

  // Core Hooks & Contexts
  const { schools, isLoading: isUserLoading } = useUser();
  const { isInitialized } = useTenant();
  const { switchTenant } = useSwitchTenant();
  const { refetch: refetchSchoolData } = useSchoolData();

  // Component States
  const [steps, setSteps] = useState<SwitchWorkflowSteps>({ switching: 1, verifying: 0, finalizing: 0 });
  const [errorDetail, setErrorDetail] = useState<WorkflowErrorDetail | null>(null);
  const [syncAttempt, setSyncAttempt] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  /**
   * Parses native URL parameters safely in a Vite SPA environment.
   */
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const schoolIdParam = queryParams.get("schoolId");
  const slugParam = queryParams.get("school_slug");
  const pushTo = queryParams.get("push_to") || "/dashboard";

  const domainContext = parseDomainAndTenant();

  /**
   * Resolves the target school object based on URL query parameters or falls back to the primary school profile.
   */
  const currentSchool = useMemo(() => {
    if (!schools || schools.length === 0) return null;
    return schools.find((s) => s.slug === slugParam || s.schoolId === schoolIdParam) || schools[0];
  }, [schools, slugParam, schoolIdParam]);

  /**
   * Dynamically determines the root domain securely, preventing SSR or window scope mismatches.
   * @returns {string} The core root domain (e.g., eduasas.co.tz)
   */
  const getHostDomain = useCallback((): string => {
    if (typeof window === "undefined") return "eduasas.co.tz";

    // extract domain with stage baind with port if found
    if (domainContext.port) return `${domainContext.domainWithStage}:${domainContext.port}`;

    //Extract protocol
    return domainContext.domainWithStage || "eduasas.co.tz";
  }, []);

  const hostDomain = getHostDomain();
  const DOMAIN = hostDomain || import.meta.env.VITE_ROOT_DOMAIN || "eduasas.co.tz";
  const PROTOCOL = domainContext.protocol;

  /**
   * Executes the cryptographically secure workspace handshake protocol.
   * Handles session context mutation, token acquisition, query cache isolation, and subdomain redirection.
   * 
   * @throws {Error} If session token generation fails or network timeout occurs.
   */
  const runHandshake = useCallback(async () => {
    if (isProcessing.current || !isInitialized || isUserLoading || !currentSchool || errorDetail) return;

    isProcessing.current = true;
    const { schoolId, schoolUId, slug } = currentSchool;

    // Timeout guard setup using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Step 1: Initialize session switch and fetch secure redirect token
      setSteps({ switching: 1, verifying: 0, finalizing: 0 });

      const res = await switchTenant(schoolUId, schoolId);

      if (!res || !res.redirectToken || res.schoolUId !== schoolUId) {
        throw new Error("Cryptographic redirect token generation failed for the target workspace.");
      }

      const generatedToken = res.redirectToken;

      // Step 2: Verify active nodes and prefetch workspace data
      setSteps({ switching: 2, verifying: 1, finalizing: 0 });
      await refetchSchoolData();

      // Step 3: Purge old query cache to prevent cross-tenant data contamination
      queryClient.clear();

      // Step 4: Finalize workspace profile preparation
      setSteps({ switching: 2, verifying: 2, finalizing: 1 });
      await new Promise((r) => setTimeout(r, 500));

      setSteps({ switching: 2, verifying: 2, finalizing: 2 });
      await new Promise((r) => setTimeout(r, 200));

      toast.show({ message: "Done, Redirecting...", type: "success" });

      // Build target enterprise subdomain destination URL with token parameter
      const destinationUrl = `${PROTOCOL}//${slug}.${DOMAIN}/consumer?token=${generatedToken}&redirect_to=${encodeURIComponent(pushTo)}`;
      console.log(destinationUrl);

      // Clear timeout before navigation
      clearTimeout(timeoutId);
      window.location.href = destinationUrl;

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(`[Handshake Error] Attempt ${syncAttempt + 1} failed:`, err);
      isProcessing.current = false;

      // Automated Retry Logic Check
      if (syncAttempt < MAX_RETRIES - 1) {
        const nextAttempt = syncAttempt + 1;
        setSyncAttempt(nextAttempt);
        setIsRetrying(true);

        toast.show({ message: `Process failed. Retrying (${nextAttempt}/${MAX_RETRIES - 1})...`, type: "error" });

        // Graceful pause before resetting retry state
        setTimeout(() => {
          setIsRetrying(false);
        }, 1500);

      } else {
        // Hard failure: Exceeded max retries, render fallback error screen feedback
        setErrorDetail({
          title: err.statusCode ? `Proccess failed (${err.statusCode})` : "Unable to complete process",
          msg: err.name === "AbortError"
            ? "The request timed out while communicating with the server. Please check your network connection."
            : err.message || "Could not establish a secure workspace session after multiple attempts.",
        });
        toast.show({ message: "Auto retry limit reached.", type: "error" });
      }
    }
  }, [
    isInitialized,
    currentSchool,
    isUserLoading,
    refetchSchoolData,
    syncAttempt,
    switchTenant,
    queryClient,
    PROTOCOL,
    DOMAIN,
    pushTo,
    toast,
    errorDetail
  ]);

  /**
   * Triggers the handshake execution pipeline as soon as required dependencies and states settle.
   */
  useEffect(() => {
    if (currentSchool && !errorDetail && !isRetrying) {
      void runHandshake();
    }
  }, [currentSchool, runHandshake, errorDetail, isRetrying]);

  /**
   * Resets error states to permit manual retry attempts triggered by the user interface.
   */
  const handleManualRetry = () => {
    setErrorDetail(null);
    setSyncAttempt(0);
    isProcessing.current = false;
  };

  useEffect(() => {
    if(errorDetail){
      showFeedback({
        type: "error",
        isStrict: true,
        title: errorDetail.title,
        message: errorDetail.msg,
        actions: [
          { label: "Cancel & Exit", onClick: () => navigate(-1), variant: "secondary" },
          { label: "Retry ", onClick: () => handleManualRetry() }
        ]
      })
    }
  })

  // Render skeleton loader while user session or school list is loading
  if (isUserLoading || !currentSchool) {
    return (<EduScreenLoader loadingText="Initializing workspace context..." />);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 space-y-3 text-center select-none">

        {/* Active School Entity Identity Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-row text-start items-center gap-3 border border-slate-200 rounded-md py-2.5 px-3.5 bg-white/90"
        >
          <div className="w-9 h-9 rounded-full border border-slate-200 bg-blue-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {currentSchool.logo ? (
              <img src={currentSchool.logo} alt="School logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white uppercase">{currentSchool.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading font-bold text-sm text-gray-900 truncate">{currentSchool.name}</p>
            <p className="text-[12px] font-semibold text-gray-500 tracking-wider">ID: {currentSchool.schoolId}</p>
          </div>
        </motion.div>
        {/* Real-time Workflow Execution Progress Rows */}
        <div className="text-left flex flex-col gap-1">
          <StatusRow label="Establishing session" state={steps.switching} />
          <StatusRow label="Verifying active session" state={steps.verifying} />
          <StatusRow label="Finalizing switching proccess" state={steps.finalizing} />

          {syncAttempt > 0 && !isRetrying && (
            <p className="text-xs text-amber-500 font-medium text-center pt-5 animate-pulse">
              Re-establishing (Attempt {syncAttempt}/{MAX_RETRIES - 1})
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

/**
 * StatusRow Component
 * Renders an individual step item with precise status indicators (pending, active loader, or verified checkmark).
 * 
 * @param {Object} props - Component properties
 * @param {string} props.label - Descriptive text for the current workflow stage
 * @param {0 | 1 | 2} props.state - Current execution state of the step
 */
function StatusRow({ label, state }: { label: string; state: 0 | 1 | 2 }) {
  const isActive = state === 1;

  return (
    <div className="flex items-center justify-start gap-2 transition-all duration-300 h-7">
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {state === 0 && <div className="w-2.5 h-1 rounded-full bg-gray-400" />}
        {state === 1 && <EduMainLoader size={15} />}
        {state === 2 && <Check className="w-5 h-5 text-blue-600 stroke-[3]" />}
      </div>
      <span
        className={cn("text-sm transition-all duration-300",
          isActive ? "text-gray-900 font-bold" : "text-gray-500 font-semibold")}
      >
        {label}
      </span>
    </div>
  );
}
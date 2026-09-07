/**
 * @file src/lib/globalErrorHandler.ts
 * @description Centralized Global Error Handler for the EduAsas multi-tenant Single Page Application.
 * Parses backend error codes, categorizes them into predictable side-effect actions, 
 * and automatically triggers appropriate user notifications, context resets, or secure redirects.
 */


import { useToast } from "../store";
import { logoutAndRedirect } from "./LogoutAndRedirect";

/* =========================================================
   1. ERROR CONSTANTS (Server -> Frontend Contract)
   ========================================================= */

/**
 * Standardized machine-readable error codes sent by backend microservices/APIs.
 */
export const SERVER_ERRORS = {
    // Auth / Session Errors
    TOKEN_NOT_FOUND: "TOKEN_NOT_FOUND",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    TOKEN_INVALID: "TOKEN_INVALID",
    TOKEN_REUSE: "TOKEN_REUSE",
    TOKEN_TYPE_MISMATCH: "TOKEN_TYPE_MISMATCH",
    TOKEN_MALFORMED: "TOKEN_MALFORMED",
    TOKEN_VERSION_MISMATCH: "TOKEN_VERSION_MISMATCH",
    SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
    AUTH_REQUIRED: "AUTH_REQUIRED",
    AUTH_SECURITY_BREACH: "AUTH_SECURITY_BREACH",

    // Account & User Management
    USER_NOT_FOUND: "USER_NOT_FOUND",
    ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
    ACCOUNT_RESTRICTED: "ACCOUNT_RESTRICTED",
    ACCOUNT_PENDING: "ACCOUNT_PENDING",
    ACCOUNT_EXISTS: "ACCOUNT_EXISTS",
    ALREADY_VERIFIED: "ALREADY_VERIFIED",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    INVALID_OTP: "INVALID_OTP",
    OAUTH_USER_LOGIN_ATTEMPT: "OAUTH_USER_LOGIN_ATTEMPT",

    // School / Tenant Context
    SCHOOL_NOT_FOUND: "SCHOOL_NOT_FOUND",
    SCHOOL_SUSPENDED: "SCHOOL_SUSPENDED",
    CONTEXT_REQUIRED: "CONTEXT_REQUIRED",
    NO_ACTIVE_ROLES: "NO_ACTIVE_ROLES",
    ALREADY_ACTIVE: "ALREADY_ACTIVE",

    // Access Control & Permissions
    ACCESS_DENIED: "ACCESS_DENIED",

    // Data & Validation
    MISSING_IDENTITY: "MISSING_IDENTITY",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    INVALID_CATEGORY_REFERENCE: "INVALID_CATEGORY_REFERENCE",

    // Miscellaneous / External Integration
    PURPOSE_ERROR: "PURPOSE_ERROR",
    GOOGLE_AUTH_FAILED: "GOOGLE_AUTH_FAILED",
    MISSING_EMAIL: "MISSING_EMAIL",
} as const;

export type ServerError = typeof SERVER_ERRORS[keyof typeof SERVER_ERRORS];

/* =========================================================
   2. ACTION GROUPS (Frontend Reaction Strategy)
   ========================================================= */

/**
 * Maps server error categories to specific frontend execution behaviors.
 */
export const ERROR_ACTIONS = {
    /** Terminate session immediately and redirect to login. */
    TERMINATE_SESSION: [
        SERVER_ERRORS.TOKEN_NOT_FOUND,
        SERVER_ERRORS.TOKEN_EXPIRED,
        SERVER_ERRORS.TOKEN_INVALID,
        SERVER_ERRORS.TOKEN_REUSE,
        SERVER_ERRORS.TOKEN_TYPE_MISMATCH,
        SERVER_ERRORS.TOKEN_MALFORMED,
        SERVER_ERRORS.TOKEN_VERSION_MISMATCH,
        SERVER_ERRORS.SESSION_NOT_FOUND,
        SERVER_ERRORS.AUTH_REQUIRED,
        SERVER_ERRORS.AUTH_SECURITY_BREACH,
    ],

    /** Clear tenant context and redirect back to the main school portal/selector. */
    REDIRECT_TO_PORTAL: [
        SERVER_ERRORS.SCHOOL_NOT_FOUND,
        SERVER_ERRORS.CONTEXT_REQUIRED,
        SERVER_ERRORS.SCHOOL_SUSPENDED,
        SERVER_ERRORS.NO_ACTIVE_ROLES,
    ],

    /** Restrict interactive UI elements or display a blocking warning. */
    RESTRICT_ACCESS: [
        SERVER_ERRORS.ACCESS_DENIED,
        SERVER_ERRORS.ACCOUNT_SUSPENDED,
        SERVER_ERRORS.ACCOUNT_RESTRICTED,
    ],

    /** Display a non-blocking notification toast to the user. */
    NOTIFY_ONLY: [
        SERVER_ERRORS.VALIDATION_ERROR,
        SERVER_ERRORS.MISSING_IDENTITY,
        SERVER_ERRORS.INVALID_OTP,
        SERVER_ERRORS.ALREADY_VERIFIED,
        SERVER_ERRORS.INVALID_CREDENTIALS,
        SERVER_ERRORS.ACCOUNT_EXISTS,
        SERVER_ERRORS.INVALID_CATEGORY_REFERENCE,
        SERVER_ERRORS.OAUTH_USER_LOGIN_ATTEMPT,
        SERVER_ERRORS.GOOGLE_AUTH_FAILED,
    ],
} as const;

/* =========================================================
   3. OPTIONS INTERFACE
   ========================================================= */

export interface ErrorOptions {
    /** Whether to log the error code to the console in development/production. Defaults to true. */
    logError?: boolean;
    /** Optional custom override message to display in the toast or session storage. */
    message?: string;
}

/* =========================================================
   4. GLOBAL ERROR HANDLER FUNCTION
   ========================================================= */

/**
 * @function globalErrorHandler
 * @description
 * Evaluates a backend error code and executes the corresponding enterprise UI or navigation action 
 * within the Vite SPA environment.
 * 
 * @param {string} errorCode - The machine-readable error code received from the server.
 * @param {ErrorOptions} [options={ logError: true }] - Configuration options for logging and message overrides.
 * 
 * @example
 * ```ts
 * try {
 *   await apiMutation("POST", "/schools", payload);
 * } catch (error) {
 *   if (isApiError(error) && error.errorCode) {
 *     globalErrorHandler(error.errorCode, { message: error.message });
 *   }
 * }
 * ```
 */
export const globalErrorHandler = (
    errorCode: string,
    options: ErrorOptions = { logError: true }
): void => {
    if (options.logError) {
        console.error(`[GlobalErrorHandler] Triggered with code: --> ${errorCode}`);
    }

    const toast = useToast();

    const errorList = errorCode as ServerError;

    /* -------------------------------------------------------
       1. TERMINATE SESSION
          Immediately logs out the user without displaying a premature toast 
          (since the hard redirect will instantly wipe the view). 
          Stores a fallback message in sessionStorage for the login screen.
       ------------------------------------------------------- */
    if ((ERROR_ACTIONS.TERMINATE_SESSION as readonly string[]).includes(errorList)) {
        const msg = options.message ?? "Your session has expired. Please sign in again.";
        sessionStorage.setItem("auth:redirect-message", msg);
        logoutAndRedirect();
        return;
    }

    /* -------------------------------------------------------
       2. REDIRECT TO PORTAL
          Tenant/School context is invalid or missing. 
          Displays an informative toast and redirects to the portal selector.
       ------------------------------------------------------- */
    if ((ERROR_ACTIONS.REDIRECT_TO_PORTAL as readonly string[]).includes(errorList)) {
        toast.show({ message: options.message ?? "School context required. Redirecting to portal...", type: "info", duration: 2000 });
        setTimeout(() => {
            window.location.replace("/home");
        }, 500);
        return;
    }

    /* -------------------------------------------------------
       3. RESTRICT ACCESS
          Displays a persistent warning toast for permission or suspension issues.
       ------------------------------------------------------- */
    if ((ERROR_ACTIONS.RESTRICT_ACCESS as readonly string[]).includes(errorList)) {
        toast.show({
            message: options.message ?? "Access denied.", type: "warning",
            duration: 5000,
        });
        return;
    }

    /* -------------------------------------------------------
       4. NOTIFY ONLY
          Displays a standard error toast without altering routing or application state.
       ------------------------------------------------------- */
    if ((ERROR_ACTIONS.NOTIFY_ONLY as readonly string[]).includes(errorList)) {
        toast.show({ message: options.message ?? `Error: ${errorCode}`, type: "error", duration: 4000 });
        return;
    }

    /* -------------------------------------------------------
       5. ACCOUNT PENDING VERIFICATION
          Specific workflow redirect for unverified accounts.
       ------------------------------------------------------- */
    if (errorCode === SERVER_ERRORS.ACCOUNT_PENDING) {
        toast.show({ message: options.message ?? "Please verify your account to continue.", type: "warning", duration: 4000 });
        window.location.replace("/verify");
        return;
    }

    /* -------------------------------------------------------
       6. GENERIC FALLBACK
          Catches any unrecognized error codes and displays a safe generic toast.
       ------------------------------------------------------- */
    toast.show({ message: options.message ?? `An unexpected error occurred. Code: (${errorCode})`, type: "error", duration: 4000 });
};
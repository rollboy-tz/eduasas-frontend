// lib/api/api-respone.ts

/**
 * @type ResponseAction
 * @description
 * Defines the enterprise side-effect instruction sent by the backend. 
 * When the frontend interceptor receives a response containing one of these actions, 
 * it automatically triggers the corresponding global behavior (e.g., clearing tenant context, 
 * forcing re-authentication, or redirecting the user).
 */
export type ResponseAction =
  | "NONE"             // No side-effect required; handle standard data flow.
  | "RE_AUTHENTICATE"  // User session has expired or is invalid; trigger re-auth flow.
  | "SYNC_CONTEXT"     // Synchronize or update the active school/tenant context state.
  | "KILL_CONTEXT"     // Clear active tenant context (e.g., school removed or switched) while keeping user session alive.
  | "REDIRECT"         // Force a safe browser redirect to a specific URL provided in the payload.
  | "NOTIFY_ONLY"      // Display an alert or toast message based on the response message.
  | "RELOAD_DATA"      // Trigger data refetching (e.g., invalidate queries via TanStack Query).
  | "LOGOUT";          // Perform an immediate hard logout and clear local states.

/**
 * @interface ApiResponse
 * @template T
 * @description
 * The canonical, standardized JSON wrapper structure for all API responses 
 * across the EduAsas multi-tenant platform. Ensures predictable parsing 
 * for both success and error flows on the client side.
 * 
 * @example
 * ```ts
 * const response: ApiResponse<SchoolProfile> = await api.get("/schools/current");
 * if (response.success) {
 *   console.log(response.data.name);
 * }
 * ```
 */
export interface ApiResponse<T = any> {
  /** 
   * Indicates whether the overall operation was successfully processed by the server.
   */
  success: boolean;

  /** 
   * Categorizes the general tone/result of the server response.
   * - "success": Operation completed without issues.
   * - "error": Operation failed.
   * - "warning": Operation completed successfully but requires user or system attention.
   */
  status: "success" | "error" | "warning";

  /** 
   * The underlying HTTP status code of the response (e.g., 200, 201, 400, 401, 403, 422, 500).
   * Crucial for conditional checks and session validation flows.
   */
  statusCode: number;

  /** 
   * Human-readable message describing the result of the operation. 
   * Often used directly for UI toast notifications or status banners.
   */
  message: string;

  /** 
   * The automated directive/action the frontend should execute in response to this payload.
   */
  action: ResponseAction;

  /** 
   * The primary payload data returned by the server. Type-safe via generic parameter `T`.
   */
  data: T;

  /** 
   * Optional auxiliary metadata returned by the server (e.g., pagination info, 
   * total counts, server timing metrics, or audit details).
   */
  metadata?: any;

  /** 
   * Optional machine-readable error code defined by backend services 
   * (e.g., "SCHOOL_NOT_FOUND", "EXAM_LOCKED", "DUPLICATE_REGISTRATION").
   * Used for targeted frontend logic or inline form error highlighting.
   */
  errorCode?: string;

  /** 
   * Detailed validation errors or nested exception payloads, typically populated 
   * during bad requests (e.g., Zod validation schema failures).
   */
  errors?: any;

  /** 
   * ISO-8601 timestamp representing the exact time the server generated the response.
   */
  timestamp: string;
}
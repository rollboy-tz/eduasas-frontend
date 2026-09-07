/**
 * @file src/lib/api-mutation.ts
 * @description Centralized Mutation Handler for POST, PUT, PATCH, and DELETE operations.
 */

import { isAxiosError } from "axios";
import { api } from "./api";
import type { ApiResponse } from "./api-respone";
import { ApiError, isApiError } from "./errors";

/**
 * Supported HTTP mutation methods. Accepts both uppercase and lowercase string literals 
 * (e.g., "POST", "post", "PUT", "put", "PATCH", "patch", "DELETE", "delete").
 */
export type MutationMethod = 
  | "POST" | "PUT" | "PATCH" | "DELETE"
  | "post" | "put" | "patch" | "delete";

/**
 * @function apiMutation
 * @description
 * High-performance, type-safe mutation handler for executing state-changing HTTP requests 
 * (POST, PUT, PATCH, DELETE) within the EduAsas multi-tenant Single Page Application.
 * 
 * Automatically handles backend responses, validates success/warning criteria, and 
 * guarantees that **only `ApiError` instances** are thrown on failure—eliminating raw 
 * `AxiosError`, generic `Error`, or `unknown` exceptions in catch blocks. Fully compatible 
 * with TanStack Query mutations.
 * 
 * @template TResponse - The data type expected inside the `data` property of the `ApiResponse`.
 * @template TPayload - The payload data type being sent to the backend (defaults to `unknown`).
 * 
 * @param {MutationMethod} method - The HTTP method to execute ("POST", "PUT", "PATCH", "DELETE").
 * @param {string} url - The relative endpoint URL for the mutation.
 * @param {TPayload} [data] - Optional payload data to transmit in the request body.
 * @returns {Promise<ApiResponse<TResponse>>} The full canonical `ApiResponse` container.
 * @throws {ApiError} Always throws a structured `ApiError` featuring the correct `statusCode`, 
 *                    `errorCode`, and side-effect directives if the request fails.
 * 
 * @example Using with TanStack Query (useMutation)
 * ```ts
 * const mutation = useMutation<ApiResponse<StudentResponse>, ApiError, CreateStudentPayload>({
 *   mutationFn: (newStudent) => apiMutation<StudentResponse, CreateStudentPayload>("POST", "/students", newStudent),
 *   onSuccess: (res) => {
 *     toast.success(res.message);
 *   },
 *   onError: (error) => {
 *     // error is guaranteed to be an ApiError
 *     if (error.statusCode === 422) {
 *       setFieldErrors(error.errors);
 *     }
 *   }
 * });
 * ```
 * 
 * @example Using inside an async function with try/catch
 * ```ts
 * try {
 *   const response = await apiMutation<void>("DELETE", "/schools/123-abc");
 *   console.log(response.message);
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.error(`[${error.statusCode}] ${error.errorCode}: ${error.message}`);
 *   }
 * }
 * ```
 */
export async function apiMutation<TResponse = unknown, TPayload = unknown>(
  method: MutationMethod,
  url: string,
  data?: TPayload
): Promise<ApiResponse<TResponse>> {
  try {
    const response = await api({ method, url, data });
    const result = response as unknown as ApiResponse<TResponse>;

    // Defensive check: Ensure the response status indicates success or warning
    if (!result || (result.status !== "success" && result.status !== "warning")) {
      const statusCode = result?.statusCode || 500;
      throw new ApiError({
        success: false,
        status: "error",
        statusCode,
        message: result?.message || "Mutation failed with invalid response status",
        action: result?.action || "NONE",
        data: result?.data ?? null,
        timestamp: result?.timestamp || new Date().toISOString(),
        errorCode: result?.errorCode || "INVALID_STATUS",
        errors: result?.errors,
      } as ApiResponse<unknown>, statusCode);
    }

    return result;
  } catch (error: unknown) {
    if (import.meta.env.NODE_ENV === "development") {
      console.error(`🚨 [apiMutation ERROR] ${method.toUpperCase()} ${url}:`, error);
    }

    // 1. If it's already an ApiError, rethrow it untouched
    if (isApiError(error)) throw error;

    // 2. Backend responded with an HTTP error status (4xx/5xx) and standard error payload
    if (isAxiosError(error) && error.response?.data) {
      const backend = error.response.data as Partial<ApiResponse<unknown>>;
      const httpStatus = error.response.status;
      const statusCode = backend.statusCode ?? httpStatus;

      throw new ApiError({
        success: false,
        status: "error",
        statusCode,
        message: backend.message ?? `Server error (${httpStatus})`,
        action: backend.action ?? "NONE",
        data: backend.data ?? null,
        timestamp: backend.timestamp ?? new Date().toISOString(),
        errorCode: backend.errorCode ?? `HTTP_${httpStatus}`,
        errors: backend.errors,
      } as ApiResponse<unknown>, statusCode);
    }

    // 3. Axios error without response (e.g., Network offline, CORS block, or Timeout)
    if (isAxiosError(error)) {
      const isTimeout = error.code === "ECONNABORTED";
      const httpStatus = isTimeout ? 504 : 0;

      throw new ApiError({
        success: false,
        status: "error",
        statusCode: httpStatus,
        message: isTimeout
          ? "Request timed out. Please check your connection and try again."
          : "Failed to connect to the server. Please check your network connection.",
        action: "NONE",
        data: null,
        timestamp: new Date().toISOString(),
        errorCode: error.code ?? (isTimeout ? "GATEWAY_TIMEOUT" : "NETWORK_ERROR"),
      } as ApiResponse<unknown>, httpStatus);
    }

    // 4. Catch-all fallback for any unexpected JavaScript or runtime errors
    const message = error instanceof Error ? error.message : "Mutation failed due to an unexpected error.";
    throw new ApiError({
      success: false,
      status: "error",
      statusCode: 500,
      message,
      action: "NONE",
      data: null,
      timestamp: new Date().toISOString(),
      errorCode: "MUTATION_FAILURE",
    } as ApiResponse<unknown>, 500);
  }
}
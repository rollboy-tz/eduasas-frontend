import { isAxiosError } from "axios";
import { api } from "./api";
import { ApiResponse } from "./api-respone";
import { ApiError, isApiError } from "./errors";

/**
 * @function apiFetch
 * @description
 * High-performance, type-safe utility wrapper around Axios for executing HTTP GET requests 
 * within the EduAsas multi-tenant Single Page Application. 
 * 
 * Automatically parses standard API responses and guarantees that **only `ApiError` instances** 
 * are thrown on failure—eliminating raw `AxiosError`, generic `Error`, or `unknown` exceptions 
 * in catch blocks. Fully compatible with TanStack Query.
 * 
 * @template T - The expected data type returned inside the response payload.
 * @param {string} url - The relative endpoint URL to fetch data from.
 * @returns {Promise<T>} The unwrapped data payload (`T`) returned by the server.
 * @throws {ApiError} Always throws a canonical `ApiError` containing the correct `statusCode`, 
 *                    `errorCode`, and backend side-effect actions if the request fails.
 * 
 * @example Using with TanStack Query and TypeScript Generics
 * ```ts
 * const { data, error, isLoading } = useQuery<SchoolContextResponse, ApiError>({
 *   queryKey: ['school-context'],
 *   queryFn: () => apiFetch<SchoolContextResponse>("/schools/context"),
 * });
 * 
 * if (error) {
 *   // TypeScript knows `error` is an ApiError; access statusCode and errorCode directly
 *   console.error(`[${error.statusCode}] ${error.errorCode}: ${error.message}`);
 * }
 * ```
 * 
 * @example Using inside standard async/await with try/catch blocks
 * ```ts
 * try {
 *   const schools = await apiFetch<SchoolListResponse[]>("/schools");
 * } catch (error) {
 *   if (isApiError(error)) {
 *     if (error.statusCode === 401) {
 *       // Handle unauthorized state explicitly via statusCode
 *     }
 *   }
 * }
 * ```
 */
export async function apiFetch<T>(url: string): Promise<T> {
  try {
    const result = await api.get<any, ApiResponse<T>>(url);

    // Defensive check: If the API response format is not explicitly success or warning
    if (!result || (result.status !== "success" && result.status !== "warning")) {
      throw new ApiError({
        ...result,
        status: "error",
        statusCode: result?.statusCode || 500,
      } as ApiResponse<unknown>, result?.statusCode || 500);
    }

    return result.data;
  } catch (error: unknown) {
    if (import.meta.env.NODE_ENV === "development") {
      console.error(`🚨 [apiFetch ERROR] Endpoint: ${url}`, error);
    }

    // 1. If it's already an ApiError, rethrow it untouched
    if (isApiError(error)) throw error;

    // 2. Backend responded with an HTTP error status (4xx/5xx) and standard error payload
    if (isAxiosError(error) && error.response?.data) {
      const backend = error.response.data as Partial<ApiResponse<unknown>>;
      const httpStatus = error.response.status;

      throw new ApiError({
        success: false,
        status: "error",
        statusCode: backend.statusCode ?? httpStatus,
        message: backend.message ?? `Server error (${httpStatus})`,
        action: backend.action ?? "NONE",
        data: backend.data ?? null,
        timestamp: backend.timestamp ?? new Date().toISOString(),
        errorCode: backend.errorCode ?? `HTTP_${httpStatus}`,
      } as ApiResponse<unknown>, backend.statusCode ?? httpStatus);
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
    const message = error instanceof Error ? error.message : "Failed to fetch data due to an unexpected error.";
    throw new ApiError({
      success: false,
      status: "error",
      statusCode: 500,
      message,
      action: "NONE",
      data: null,
      timestamp: new Date().toISOString(),
      errorCode: "FETCH_FAILURE",
    } as ApiResponse<unknown>, 500);
  }
}
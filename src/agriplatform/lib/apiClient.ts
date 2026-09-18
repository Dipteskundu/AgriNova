/**
 * Core API Client & Infrastructure
 * Provides simulation wrappers, unified response format, and error handling.
 */

import { ApiResponse } from '@/agriplatform/types';

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Simulates an asynchronous API network call with artificial latency.
 * Emulates REST responses for both Farmer and Admin portal operations.
 */
export async function simulateApiCall<T>(
  data: T,
  delayMs = 250,
  shouldFail = false,
  errorMessage = 'Failed to execute requested operation'
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new ApiError(errorMessage, 400));
      } else {
        resolve({
          success: true,
          data,
          timestamp: new Date().toISOString(),
          message: 'Operation executed successfully',
        });
      }
    }, delayMs);
  });
}

/**
 * Unified error format for UI consumption
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected server error occurred. Please try again.';
}

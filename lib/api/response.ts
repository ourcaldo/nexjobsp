import { NextResponse } from 'next/server';

/**
 * Standard API Response Format
 * 
 * All API endpoints should return responses in this format for consistency:
 * - Success responses include `success: true` and `data` field
 * - Error responses include `success: false` and `error` field
 * - Optional `metadata` for paginated responses
 * 
 * @example
 * // Success response
 * return apiSuccess({ id: 1, name: 'John' });
 * 
 * @example
 * // Success with pagination
 * return apiSuccess(items, { page: 1, limit: 10, total: 100, hasMore: true });
 * 
 * @example
 * // Error response
 * return apiError('Invalid request', 400);
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasMore?: boolean;
  };
}

/**
 * Create a successful API response (NextResponse).
 * This is the canonical helper — use this in all API routes.
 *
 * @param data - The data to return
 * @param metadata - Optional pagination metadata
 * @returns NextResponse with standardized success format
 *
 * @example
 * return apiSuccess({ bookmarks: bookmarkList });
 * return apiSuccess(jobs, { page: 1, limit: 20, total: 150, hasMore: true });
 */
export const apiSuccess = <T>(data: T, metadata?: ApiResponse['metadata']) => {
  return NextResponse.json({
    success: true,
    data,
    ...(metadata && { metadata })
  });
};

/**
 * Create an error API response (NextResponse).
 * This is the canonical helper — use this in all API routes.
 *
 * @param error - Error message
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with standardized error format
 *
 * @example
 * return apiError('No authorization token provided', 401);
 * return apiError('Internal server error', 500);
 */
export const apiError = (error: string, status: number = 400) => {
  return NextResponse.json({
    success: false,
    error
  }, { status });
};

/**
 * @deprecated Use {@link apiSuccess} instead.
 * Kept for backwards-compatibility; delegates to apiSuccess.
 */
export const successResponse = <T>(data: T, metadata?: ApiResponse['metadata']): Response => {
  return apiSuccess(data, metadata) as unknown as Response;
};

/**
 * @deprecated Use {@link apiError} instead.
 * Kept for backwards-compatibility; delegates to apiError.
 */
export const errorResponse = (error: string, status: number = 400): Response => {
  return apiError(error, status) as unknown as Response;
};

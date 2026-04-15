/**
 * Auth & Security Helpers
 * Standardizes role checking and authorization across all backend functions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Verify admin role and return authenticated user
 * Use in all admin-only backend functions
 */
export async function requireAdminRole(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    if (user.role !== 'admin') {
      const error = new Error('Forbidden: Admin access required');
      error.status = 403;
      throw error;
    }

    return user;
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    throw error;
  }
}

/**
 * Verify user is authenticated
 * Use in functions requiring user context
 */
export async function requireAuth(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    return user;
  } catch (error) {
    if (!error.status) {
      error.status = 401;
    }
    throw error;
  }
}

/**
 * Standard error response formatter
 */
export function errorResponse(error, statusCode = 500) {
  return Response.json(
    {
      error: error.message || 'Internal server error',
      status: statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Standard success response formatter
 */
export function successResponse(data, statusCode = 200) {
  return Response.json(data, { status: statusCode });
}
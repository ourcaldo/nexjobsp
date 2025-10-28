import { generateSecureToken } from './crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface CSRFToken {
  token: string;
  expiresAt: number;
}

const CSRF_TOKEN_EXPIRY = 3600000;

export const generateCSRFToken = (): CSRFToken => {
  const token = generateSecureToken();
  const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY;
  
  return { token, expiresAt };
};

export const validateCSRFToken = (
  request: NextRequest,
  expectedToken?: string
): boolean => {
  if (!expectedToken) {
    return false;
  }

  const headerToken = request.headers.get('x-csrf-token') || 
                      request.headers.get('csrf-token');
  
  if (!headerToken) {
    return false;
  }

  return headerToken === expectedToken;
};

export const createCSRFHeader = (token: string): Record<string, string> => {
  return {
    'X-CSRF-Token': token,
  };
};

export const isStateChangingMethod = (method: string): boolean => {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
};

export const validateRequest = (
  request: NextRequest,
  csrfToken?: string,
  requireCSRF: boolean = false
): { valid: boolean; error?: string } => {
  if (requireCSRF && isStateChangingMethod(request.method)) {
    if (!validateCSRFToken(request, csrfToken)) {
      return {
        valid: false,
        error: 'Invalid or missing CSRF token'
      };
    }
  }

  return { valid: true };
};

export const withCSRFProtection = (
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { requireToken?: boolean } = {}
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (isStateChangingMethod(request.method) && options.requireToken !== false) {
      const headerToken = request.headers.get('x-csrf-token');
      
      if (!headerToken) {
        return NextResponse.json(
          { error: 'CSRF token is required' },
          { status: 403 }
        );
      }
    }

    return handler(request);
  };
};

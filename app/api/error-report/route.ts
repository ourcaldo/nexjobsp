import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const log = logger.child('api:error-report');

export const dynamic = 'force-dynamic';

/**
 * POST /api/error-report
 *
 * Receives client-side error reports from the ErrorBoundary component.
 * Logs structured error data server-side for monitoring and debugging.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      message,
      stack,
      componentStack,
      timestamp,
      userAgent,
      url,
    } = body;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid error message' },
        { status: 400 }
      );
    }

    // Truncate large payloads to prevent log flooding
    const sanitizedError = {
      message: message.slice(0, 1000),
      stack: typeof stack === 'string' ? stack.slice(0, 5000) : undefined,
      componentStack: typeof componentStack === 'string' ? componentStack.slice(0, 3000) : undefined,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 500) : undefined,
      url: typeof url === 'string' ? url.slice(0, 2000) : undefined,
    };

    log.error('Client-side error report', sanitizedError);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    log.error('Failed to process error report', {}, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

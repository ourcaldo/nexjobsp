import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This endpoint has been moved to /api/public/settings for security reasons
  return NextResponse.json({ 
    error: 'This endpoint has been moved to /api/public/settings/ for security reasons',
    redirect: '/api/public/settings/'
  }, { status: 301 });
}

/**
 * NextAuth.js API Route Handler
 * Handles authentication requests
 * 
 * Note: Temporarily disabled for landing page functionality
 * TODO: Re-enable when backend authentication is ready
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Authentication API is temporarily disabled',
    status: 'maintenance' 
  }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Authentication API is temporarily disabled',
    status: 'maintenance' 
  }, { status: 503 });
}
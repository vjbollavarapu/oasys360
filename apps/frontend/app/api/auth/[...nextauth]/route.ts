/**
 * NextAuth.js API Route Handler
 * 
 * Note: NextAuth is disabled - using backend API authentication directly
 * This route exists only for compatibility with components that might still reference it
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth is disabled. Please use the backend API authentication at /api/v1/auth/',
    status: 'disabled',
    backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  }, { status: 410 }); // 410 Gone - resource no longer available
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth is disabled. Please use the backend API authentication at /api/v1/auth/',
    status: 'disabled',
    backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  }, { status: 410 }); // 410 Gone - resource no longer available
}
/**
 * Next.js Middleware for OASYS Platform
 * Handles route protection and authentication checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup', 
    '/auth/forgot-password',
    '/auth/error',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/demo',
    '/documentation',
    '/api-docs',
    '/features',
    '/api/auth', // NextAuth API routes
  ];

  // Define admin-only routes
  const adminRoutes = [
    '/admin',
    '/platform-admin',
    '/super-admin',
  ];

  // Define tenant-specific routes (require authentication)
  const tenantRoutes = [
    '/accounting',
    '/invoicing',
    '/banking',
    '/sales',
    '/purchase',
    '/inventory',
    '/reports',
    '/documents',
    '/ai-processing',
    '/web3',
    '/mobile',
    '/firm',
    '/profile',
    '/settings',
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if route requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route requires tenant access
  const isTenantRoute = tenantRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Allow all public routes (including the landing page)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For now, allow all routes to pass through without authentication
  // This allows the landing page to work while we set up proper authentication
  // TODO: Implement proper authentication checks once backend is ready
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
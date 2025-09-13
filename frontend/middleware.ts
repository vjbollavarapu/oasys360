/**
 * Next.js Middleware for Authentication
 * Handles route protection and authentication checks
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

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
    ];

    // Define admin-only routes
    const adminRoutes = [
      '/admin',
      '/platform-admin',
      '/super-admin',
    ];

    // Define tenant-specific routes
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

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check authentication
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin access
    if (isAdminRoute) {
      const userRole = token.role;
      const adminRoles = ['platform_admin', 'super_admin', 'firm_admin'];
      
      if (!userRole || !adminRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/accounting', req.url));
      }
    }

    // Check tenant access
    if (isTenantRoute) {
      const userTenant = token.tenant;
      
      if (!userTenant) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Add user context to headers for API routes
    if (token) {
      response.headers.set('X-User-ID', token.sub || '');
      response.headers.set('X-User-Role', token.role || '');
      response.headers.set('X-User-Tenant', token.tenant?.id || '');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public routes
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
        ];

        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );

        if (isPublicRoute) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

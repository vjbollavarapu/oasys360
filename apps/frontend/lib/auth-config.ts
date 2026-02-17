/**
 * NextAuth.js Configuration for OASYS Platform
 * Handles authentication with Django backend
 */

import { NextAuthOptions } from 'next-auth';
import { getAuthProviders } from './auth-providers';
import { authService } from './api-services';

export const authOptions: NextAuthOptions = {
  providers: getAuthProviders(),
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          tenant: user.tenant,
          accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.tenant = token.tenant;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await authService.refreshToken();
    
    if (response.success && response.data) {
      const { access, refresh } = response.data;
      
      return {
        ...token,
        accessToken: access,
        refreshToken: refresh,
        accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      };
    }
    
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      tenant?: {
        id: string;
        name: string;
      };
    };
  }
  
  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    tenant?: {
      id: string;
      name: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    role?: string;
    tenant?: {
      id: string;
      name: string;
    };
    error?: string;
  }
}

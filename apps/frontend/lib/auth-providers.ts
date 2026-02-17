/**
 * Authentication Providers for OASYS Platform
 * Additional authentication methods and utilities
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authService } from './api-services';

// Google OAuth Provider
export const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code',
    },
  },
});

// Email/Password Credentials Provider
export const credentialsProvider = CredentialsProvider({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
    password: { label: 'Password', type: 'password' },
    rememberMe: { label: 'Remember Me', type: 'checkbox' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email and password are required');
    }

    try {
      const response = await authService.login(credentials.email, credentials.password);
      
      if (response.success && response.data) {
        const { access, refresh, user } = response.data;
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          tenant: user.tenant,
          accessToken: access,
          refreshToken: refresh,
        };
      }
      
      throw new Error('Invalid credentials');
    } catch (error: any) {
      console.error('Authentication error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  },
});

// Web3 Wallet Provider (for future implementation)
export const web3Provider = CredentialsProvider({
  id: 'web3',
  name: 'Web3 Wallet',
  credentials: {
    walletAddress: { label: 'Wallet Address', type: 'text' },
    signature: { label: 'Signature', type: 'text' },
    message: { label: 'Message', type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.walletAddress || !credentials?.signature) {
      throw new Error('Wallet address and signature are required');
    }

    try {
      // This would integrate with Web3 authentication
      // For now, we'll create a placeholder implementation
      const response = await authService.loginWithWeb3({
        walletAddress: credentials.walletAddress,
        signature: credentials.signature,
        message: credentials.message,
      });
      
      if (response.success && response.data) {
        const { access, refresh, user } = response.data;
        
        return {
          id: user.id.toString(),
          email: user.email || `${credentials.walletAddress}@web3.local`,
          name: user.name || `Web3 User ${credentials.walletAddress.slice(0, 6)}...`,
          role: user.role,
          tenant: user.tenant,
          accessToken: access,
          refreshToken: refresh,
        };
      }
      
      throw new Error('Web3 authentication failed');
    } catch (error: any) {
      console.error('Web3 authentication error:', error);
      throw new Error(error.message || 'Web3 authentication failed');
    }
  },
});

// SSO Provider (for enterprise customers)
export const ssoProvider = CredentialsProvider({
  id: 'sso',
  name: 'Single Sign-On',
  credentials: {
    ssoToken: { label: 'SSO Token', type: 'text' },
    provider: { label: 'Provider', type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.ssoToken || !credentials?.provider) {
      throw new Error('SSO token and provider are required');
    }

    try {
      const response = await authService.loginWithSSO({
        token: credentials.ssoToken,
        provider: credentials.provider,
      });
      
      if (response.success && response.data) {
        const { access, refresh, user } = response.data;
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          tenant: user.tenant,
          accessToken: access,
          refreshToken: refresh,
        };
      }
      
      throw new Error('SSO authentication failed');
    } catch (error: any) {
      console.error('SSO authentication error:', error);
      throw new Error(error.message || 'SSO authentication failed');
    }
  },
});

// Multi-factor Authentication Provider
export const mfaProvider = CredentialsProvider({
  id: 'mfa',
  name: 'Multi-Factor Authentication',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
    mfaCode: { label: 'MFA Code', type: 'text' },
    mfaType: { label: 'MFA Type', type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password || !credentials?.mfaCode) {
      throw new Error('Email, password, and MFA code are required');
    }

    try {
      const response = await authService.loginWithMFA({
        email: credentials.email,
        password: credentials.password,
        mfaCode: credentials.mfaCode,
        mfaType: credentials.mfaType || 'totp',
      });
      
      if (response.success && response.data) {
        const { access, refresh, user } = response.data;
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          tenant: user.tenant,
          accessToken: access,
          refreshToken: refresh,
        };
      }
      
      throw new Error('MFA authentication failed');
    } catch (error: any) {
      console.error('MFA authentication error:', error);
      throw new Error(error.message || 'MFA authentication failed');
    }
  },
});

// Provider configuration for different environments
export const getAuthProviders = (): NextAuthOptions['providers'] => {
  const providers: NextAuthOptions['providers'] = [
    credentialsProvider,
  ];

  // Add Google OAuth in development and production
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(googleProvider);
  }

  // Add Web3 provider if enabled
  if (process.env.NEXT_PUBLIC_ENABLE_WEB3_FEATURES === 'true') {
    providers.push(web3Provider);
  }

  // Add SSO provider if configured
  if (process.env.SSO_ENABLED === 'true') {
    providers.push(ssoProvider);
  }

  // Add MFA provider if enabled
  if (process.env.MFA_ENABLED === 'true') {
    providers.push(mfaProvider);
  }

  return providers;
};

// Authentication method utilities
export const authMethods = {
  credentials: 'Email & Password',
  google: 'Google',
  web3: 'Web3 Wallet',
  sso: 'Single Sign-On',
  mfa: 'Multi-Factor Authentication',
} as const;

export type AuthMethod = keyof typeof authMethods;

// Get available authentication methods based on configuration
export const getAvailableAuthMethods = (): AuthMethod[] => {
  const methods: AuthMethod[] = ['credentials'];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    methods.push('google');
  }

  if (process.env.NEXT_PUBLIC_ENABLE_WEB3_FEATURES === 'true') {
    methods.push('web3');
  }

  if (process.env.SSO_ENABLED === 'true') {
    methods.push('sso');
  }

  if (process.env.MFA_ENABLED === 'true') {
    methods.push('mfa');
  }

  return methods;
};

// Authentication status checker
export const checkAuthStatus = async (token: string): Promise<boolean> => {
  try {
    const response = await authService.getCurrentUser();
    return response.success;
  } catch (error) {
    return false;
  }
};

// Token validation utility
export const validateToken = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};

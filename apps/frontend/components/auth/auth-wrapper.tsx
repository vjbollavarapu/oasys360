"use client";

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return fallback || <div>Loading...</div>;
  }

  if (!session) {
    return fallback || <div>Please log in to access this page.</div>;
  }

  return <>{children}</>;
}

/**
 * Logout Button Component
 * Handles user logout with NextAuth.js
 */

"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  redirectTo?: string;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className = '',
  children,
  showIcon = true,
  redirectTo = '/auth/login',
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { handleError } = useErrorHandler();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await signOut({
        redirect: false,
        callbackUrl: redirectTo,
      });
      
      // Redirect to login page
      router.push(redirectTo);
    } catch (error) {
      handleError(error, {
        component: 'LogoutButton',
        action: 'logout',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : showIcon ? (
        <LogOut className="w-4 h-4" />
      ) : null}
      {children || 'Logout'}
    </Button>
  );
}

export default LogoutButton;

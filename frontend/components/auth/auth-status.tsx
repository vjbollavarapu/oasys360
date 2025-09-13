/**
 * Authentication Status Component
 * Shows current authentication status and user information
 */

"use client";

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoutButton } from './logout-button';
import { User, Shield, Building2, Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuthStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function AuthStatus({ showDetails = false, className = '' }: AuthStatusProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-1">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Not signed in</span>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const userInitials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          {user.role && (
            <Badge variant="secondary" className="text-xs w-fit">
              {user.role}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{user.email}</span>
              </CardDescription>
            </div>
          </div>
          <LogoutButton size="sm" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {user.role && (
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Role:</span>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        )}
        
        {user.tenant && (
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Tenant:</span>
            <Badge variant="secondary">{user.tenant.name}</Badge>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Session active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default AuthStatus;

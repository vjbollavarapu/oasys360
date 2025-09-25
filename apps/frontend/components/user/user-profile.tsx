/**
 * User Profile Component
 * Displays and manages user profile information
 */

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  Calendar, 
  Clock, 
  Settings,
  Edit,
  Key,
  Bell,
  Globe,
  Smartphone
} from 'lucide-react';
import { userService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC } from '@/lib/rbac';
import { UserEditForm } from './user-edit-form';
import { UserPreferences } from './user-preferences';

interface UserProfileProps {
  userId?: string;
  showEditButton?: boolean;
  className?: string;
}

export function UserProfile({ userId, showEditButton = true, className = '' }: UserProfileProps) {
  const { data: session } = useSession();
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Load user data
  const loadUser = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      let response;
      if (userId) {
        response = await userService.getUser(userId);
      } else {
        response = await userService.getCurrentUser();
      }
      
      if (response.success && response.data) {
        setUser(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleUserUpdated = () => {
    loadUser();
    setShowEditForm(false);
  };

  // Get user initials
  const getUserInitials = (user: any) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'platform_admin':
      case 'super_admin':
        return 'destructive';
      case 'firm_admin':
      case 'tenant_admin':
        return 'default';
      case 'cfo':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            User not found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {showEditForm ? (
        <UserEditForm
          user={user}
          onSuccess={handleUserUpdated}
          onCancel={() => setShowEditForm(false)}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="text-2xl">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  {showEditButton && hasPermission('update_user') && (
                    <Button onClick={() => setShowEditForm(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role.replace('_', ' ')}
                  </Badge>
                  {user.tenant && (
                    <Badge variant="outline" className="text-sm">
                      <Building2 className="w-3 h-3 mr-1" />
                      {user.tenant.name}
                    </Badge>
                  )}
                  <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-sm">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-sm">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="text-sm">{user.department || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <p className="text-sm font-mono">{user.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <p className="text-sm">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Two-Factor Auth</Label>
                    <p className="text-sm">{user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Last Login</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
                {user.lastPasswordChange && (
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Last Password Change</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        {formatDate(user.lastPasswordChange)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  User's recent actions and system interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Activity tracking will be implemented in a future update
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <UserPreferences userId={user.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default UserProfile;

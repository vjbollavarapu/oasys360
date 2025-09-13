/**
 * RBAC Management Page
 * Comprehensive role-based access control management
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3,
  Key,
  Lock,
  Eye,
  Edit
} from 'lucide-react';
import { RoleManager } from '@/components/rbac/role-manager';
import { PermissionMatrix } from '@/components/rbac/permission-matrix';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

export default function RBACManagementPage() {
  const { hasPermission, userRole } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user has admin permissions
  const canManageRBAC = hasPermission(PERMISSIONS.READ_USER) && 
    (userRole === 'platform_admin' || userRole === 'super_admin');

  if (!canManageRBAC) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              You don't have permission to access RBAC management.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="platform_admin">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">RBAC Management</h1>
            <p className="text-muted-foreground">
              Manage roles, permissions, and access control across the platform
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9</div>
              <p className="text-xs text-muted-foreground">
                2 custom, 7 system roles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                Across 9 categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,156</div>
              <p className="text-xs text-muted-foreground">
                93.7% of total users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                1.9% of total users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Role Hierarchy
                  </CardTitle>
                  <CardDescription>
                    System role hierarchy and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Platform Admin</div>
                        <div className="text-sm text-muted-foreground">Full platform access</div>
                      </div>
                      <Badge variant="destructive">Level 100</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Super Admin</div>
                        <div className="text-sm text-muted-foreground">Multi-tenant administration</div>
                      </div>
                      <Badge variant="default">Level 90</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Firm Admin</div>
                        <div className="text-sm text-muted-foreground">Firm-level administration</div>
                      </div>
                      <Badge variant="secondary">Level 80</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Tenant Admin</div>
                        <div className="text-sm text-muted-foreground">Tenant-level administration</div>
                      </div>
                      <Badge variant="outline">Level 60</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">Staff & Users</div>
                        <div className="text-sm text-muted-foreground">Standard user roles</div>
                      </div>
                      <Badge variant="outline">Level 10-50</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Permission Categories
                  </CardTitle>
                  <CardDescription>
                    Distribution of permissions across categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Management</span>
                      <Badge variant="outline">4 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tenant Management</span>
                      <Badge variant="outline">4 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accounting</span>
                      <Badge variant="outline">6 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Invoicing</span>
                      <Badge variant="outline">6 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Banking</span>
                      <Badge variant="outline">5 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reports</span>
                      <Badge variant="outline">3 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Features</span>
                      <Badge variant="outline">2 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Web3 Features</span>
                      <Badge variant="outline">2 permissions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Administration</span>
                      <Badge variant="outline">3 permissions</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common RBAC management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PermissionGate permission="CREATE_USER">
                    <Button className="w-full" onClick={() => setActiveTab('roles')}>
                      <Edit className="w-4 h-4 mr-2" />
                      Manage Roles
                    </Button>
                  </PermissionGate>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setActiveTab('permissions')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    View Permissions
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RoleManager />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionMatrix />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>RBAC Analytics</CardTitle>
                <CardDescription>
                  Insights into role usage and permission patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Analytics dashboard will be implemented in a future update
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

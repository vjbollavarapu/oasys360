/**
 * Role Manager Component
 * Interface for managing user roles and permissions
 */

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRBAC, ROLES, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from './permission-gate';

// Form validation schema
const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
}

interface RoleManagerProps {
  userId?: string;
  onRoleChange?: (role: string) => void;
}

export function RoleManager({ userId, onRoleChange }: RoleManagerProps) {
  const { hasPermission, userRole } = useRBAC();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  // Load roles (mock data for now)
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Platform Admin',
        description: 'Full platform access and administration',
        permissions: Object.values(PERMISSIONS),
        isSystem: true,
        userCount: 3,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Tenant Admin',
        description: 'Administrative access within a tenant',
        permissions: [
          PERMISSIONS.CREATE_USER,
          PERMISSIONS.READ_USER,
          PERMISSIONS.UPDATE_USER,
          PERMISSIONS.CREATE_ACCOUNT,
          PERMISSIONS.READ_ACCOUNT,
          PERMISSIONS.UPDATE_ACCOUNT,
          PERMISSIONS.CREATE_INVOICE,
          PERMISSIONS.READ_INVOICE,
          PERMISSIONS.UPDATE_INVOICE,
        ],
        isSystem: true,
        userCount: 15,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Accountant',
        description: 'Standard accounting operations',
        permissions: [
          PERMISSIONS.READ_ACCOUNT,
          PERMISSIONS.CREATE_ACCOUNT,
          PERMISSIONS.UPDATE_ACCOUNT,
          PERMISSIONS.CREATE_INVOICE,
          PERMISSIONS.READ_INVOICE,
          PERMISSIONS.UPDATE_INVOICE,
          PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        ],
        isSystem: true,
        userCount: 45,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];
    setRoles(mockRoles);
  }, []);

  // Group permissions by category
  const permissionCategories = {
    'User Management': [
      PERMISSIONS.CREATE_USER,
      PERMISSIONS.READ_USER,
      PERMISSIONS.UPDATE_USER,
      PERMISSIONS.DELETE_USER,
    ],
    'Tenant Management': [
      PERMISSIONS.CREATE_TENANT,
      PERMISSIONS.READ_TENANT,
      PERMISSIONS.UPDATE_TENANT,
      PERMISSIONS.DELETE_TENANT,
    ],
    'Accounting': [
      PERMISSIONS.CREATE_ACCOUNT,
      PERMISSIONS.READ_ACCOUNT,
      PERMISSIONS.UPDATE_ACCOUNT,
      PERMISSIONS.DELETE_ACCOUNT,
      PERMISSIONS.POST_JOURNAL_ENTRY,
      PERMISSIONS.UNPOST_JOURNAL_ENTRY,
    ],
    'Invoicing': [
      PERMISSIONS.CREATE_INVOICE,
      PERMISSIONS.READ_INVOICE,
      PERMISSIONS.UPDATE_INVOICE,
      PERMISSIONS.DELETE_INVOICE,
      PERMISSIONS.SEND_INVOICE,
      PERMISSIONS.MARK_INVOICE_PAID,
    ],
    'Banking': [
      PERMISSIONS.CREATE_TRANSACTION,
      PERMISSIONS.READ_TRANSACTION,
      PERMISSIONS.UPDATE_TRANSACTION,
      PERMISSIONS.DELETE_TRANSACTION,
      PERMISSIONS.RECONCILE_TRANSACTION,
    ],
    'Reports': [
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.VIEW_TAX_REPORTS,
      PERMISSIONS.EXPORT_REPORTS,
    ],
    'AI Features': [
      PERMISSIONS.USE_AI_PROCESSING,
      PERMISSIONS.CONFIGURE_AI_MODELS,
    ],
    'Web3 Features': [
      PERMISSIONS.USE_WEB3_FEATURES,
      PERMISSIONS.MANAGE_WEB3_WALLETS,
    ],
    'System Administration': [
      PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_INTEGRATIONS,
    ],
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(false);
    setIsCreating(false);
    setValue('name', role.name);
    setValue('description', role.description);
    setValue('permissions', role.permissions);
  };

  const handleCreateRole = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedRole(null);
    reset();
  };

  const handleEditRole = () => {
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveRole = async (data: RoleFormData) => {
    // Mock save operation
    console.log('Saving role:', data);
    
    if (isCreating) {
      const newRole: Role = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystem: false,
        userCount: 0,
        createdAt: new Date().toISOString(),
      };
      setRoles(prev => [...prev, newRole]);
      setSelectedRole(newRole);
    } else if (selectedRole) {
      const updatedRole = {
        ...selectedRole,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      };
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
      setSelectedRole(updatedRole);
    }
    
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      alert('Cannot delete system roles');
      return;
    }
    
    if (role.userCount > 0) {
      alert('Cannot delete role with assigned users');
      return;
    }
    
    setRoles(prev => prev.filter(r => r.id !== role.id));
    if (selectedRole?.id === role.id) {
      setSelectedRole(null);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = watch('permissions');
    if (checked) {
      setValue('permissions', [...currentPermissions, permission]);
    } else {
      setValue('permissions', currentPermissions.filter(p => p !== permission));
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    if (role.isSystem) return 'default';
    return 'secondary';
  };

  if (!hasPermission(PERMISSIONS.READ_USER)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to manage roles.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <PermissionGate permission="CREATE_USER">
          <Button onClick={handleCreateRole}>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Roles
              </CardTitle>
              <CardDescription>
                Select a role to view or edit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.userCount} users
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(role)}>
                        {role.isSystem ? 'System' : 'Custom'}
                      </Badge>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Role Details */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {selectedRole.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedRole.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(selectedRole)}>
                      {selectedRole.isSystem ? 'System Role' : 'Custom Role'}
                    </Badge>
                    {!selectedRole.isSystem && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditRole}
                        disabled={isEditing}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="permissions" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="permissions" className="space-y-4">
                    {isEditing || isCreating ? (
                      <form onSubmit={handleSubmit(handleSaveRole)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Role Name</Label>
                          <Input
                            id="name"
                            {...register('name')}
                            placeholder="Enter role name"
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            {...register('description')}
                            placeholder="Enter role description"
                            className={errors.description ? 'border-destructive' : ''}
                          />
                          {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label>Permissions</Label>
                          {Object.entries(permissionCategories).map(([category, permissions]) => (
                            <div key={category} className="space-y-2">
                              <h4 className="font-medium text-sm">{category}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {permissions.map((permission) => (
                                  <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={permission}
                                      checked={watch('permissions').includes(permission)}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(permission, checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={permission} className="text-sm">
                                      {permission.replace(/_/g, ' ')}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Save Role
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setIsCreating(false);
                              if (selectedRole) {
                                setValue('name', selectedRole.name);
                                setValue('description', selectedRole.description);
                                setValue('permissions', selectedRole.permissions);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(permissionCategories).map(([category, permissions]) => {
                          const rolePermissions = selectedRole.permissions;
                          const categoryPermissions = permissions.filter(p => 
                            rolePermissions.includes(p)
                          );
                          
                          if (categoryPermissions.length === 0) return null;
                          
                          return (
                            <div key={category} className="space-y-2">
                              <h4 className="font-medium text-sm">{category}</h4>
                              <div className="flex flex-wrap gap-2">
                                {categoryPermissions.map((permission) => (
                                  <Badge key={permission} variant="outline" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {permission.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="users" className="space-y-4">
                    <div className="text-center text-muted-foreground py-8">
                      User assignment will be implemented in a future update
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Role ID</Label>
                        <p className="text-sm text-muted-foreground">{selectedRole.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">User Count</Label>
                        <p className="text-sm text-muted-foreground">{selectedRole.userCount}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedRole.isSystem ? 'System Role' : 'Custom Role'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedRole.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  Select a role to view details
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleManager;

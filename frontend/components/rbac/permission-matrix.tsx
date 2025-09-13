/**
 * Permission Matrix Component
 * Visual representation of roles and their permissions
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';
import { useRBAC, ROLES, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from './permission-gate';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
}

interface PermissionMatrixProps {
  className?: string;
}

export function PermissionMatrix({ className = '' }: PermissionMatrixProps) {
  const { hasPermission } = useRBAC();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Mock roles data
  const roles: Role[] = [
    {
      id: 'platform_admin',
      name: 'Platform Admin',
      permissions: Object.values(PERMISSIONS),
      isSystem: true,
    },
    {
      id: 'super_admin',
      name: 'Super Admin',
      permissions: Object.values(PERMISSIONS).filter(p => 
        !p.includes('PLATFORM') && !p.includes('SYSTEM')
      ),
      isSystem: true,
    },
    {
      id: 'firm_admin',
      name: 'Firm Admin',
      permissions: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.READ_USER,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.UPDATE_TENANT,
        PERMISSIONS.CREATE_ACCOUNT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.UPDATE_ACCOUNT,
        PERMISSIONS.DELETE_ACCOUNT,
        PERMISSIONS.POST_JOURNAL_ENTRY,
        PERMISSIONS.UNPOST_JOURNAL_ENTRY,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.UPDATE_INVOICE,
        PERMISSIONS.DELETE_INVOICE,
        PERMISSIONS.SEND_INVOICE,
        PERMISSIONS.MARK_INVOICE_PAID,
        PERMISSIONS.CREATE_TRANSACTION,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.UPDATE_TRANSACTION,
        PERMISSIONS.DELETE_TRANSACTION,
        PERMISSIONS.RECONCILE_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_TAX_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.USE_AI_PROCESSING,
        PERMISSIONS.USE_WEB3_FEATURES,
        PERMISSIONS.MANAGE_WEB3_WALLETS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
        PERMISSIONS.VIEW_AUDIT_LOGS,
      ],
      isSystem: true,
    },
    {
      id: 'firm_staff',
      name: 'Firm Staff',
      permissions: [
        PERMISSIONS.READ_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.CREATE_ACCOUNT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.UPDATE_ACCOUNT,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.UPDATE_INVOICE,
        PERMISSIONS.SEND_INVOICE,
        PERMISSIONS.CREATE_TRANSACTION,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.UPDATE_TRANSACTION,
        PERMISSIONS.RECONCILE_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_TAX_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.USE_AI_PROCESSING,
        PERMISSIONS.USE_WEB3_FEATURES,
      ],
      isSystem: true,
    },
    {
      id: 'tenant_admin',
      name: 'Tenant Admin',
      permissions: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.READ_USER,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.UPDATE_TENANT,
        PERMISSIONS.CREATE_ACCOUNT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.UPDATE_ACCOUNT,
        PERMISSIONS.DELETE_ACCOUNT,
        PERMISSIONS.POST_JOURNAL_ENTRY,
        PERMISSIONS.UNPOST_JOURNAL_ENTRY,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.UPDATE_INVOICE,
        PERMISSIONS.DELETE_INVOICE,
        PERMISSIONS.SEND_INVOICE,
        PERMISSIONS.MARK_INVOICE_PAID,
        PERMISSIONS.CREATE_TRANSACTION,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.UPDATE_TRANSACTION,
        PERMISSIONS.DELETE_TRANSACTION,
        PERMISSIONS.RECONCILE_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_TAX_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.USE_AI_PROCESSING,
        PERMISSIONS.USE_WEB3_FEATURES,
        PERMISSIONS.MANAGE_WEB3_WALLETS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
      ],
      isSystem: true,
    },
    {
      id: 'cfo',
      name: 'CFO',
      permissions: [
        PERMISSIONS.READ_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.POST_JOURNAL_ENTRY,
        PERMISSIONS.UNPOST_JOURNAL_ENTRY,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.MARK_INVOICE_PAID,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_TAX_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.USE_AI_PROCESSING,
        PERMISSIONS.USE_WEB3_FEATURES,
      ],
      isSystem: true,
    },
    {
      id: 'accountant',
      name: 'Accountant',
      permissions: [
        PERMISSIONS.READ_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.CREATE_ACCOUNT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.UPDATE_ACCOUNT,
        PERMISSIONS.POST_JOURNAL_ENTRY,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.UPDATE_INVOICE,
        PERMISSIONS.SEND_INVOICE,
        PERMISSIONS.CREATE_TRANSACTION,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.UPDATE_TRANSACTION,
        PERMISSIONS.RECONCILE_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_TAX_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
        PERMISSIONS.USE_AI_PROCESSING,
      ],
      isSystem: true,
    },
    {
      id: 'staff',
      name: 'Staff',
      permissions: [
        PERMISSIONS.READ_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.UPDATE_INVOICE,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.CREATE_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.USE_AI_PROCESSING,
      ],
      isSystem: true,
    },
    {
      id: 'viewer',
      name: 'Viewer',
      permissions: [
        PERMISSIONS.READ_USER,
        PERMISSIONS.READ_TENANT,
        PERMISSIONS.READ_ACCOUNT,
        PERMISSIONS.READ_INVOICE,
        PERMISSIONS.READ_TRANSACTION,
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      ],
      isSystem: true,
    },
  ];

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

  // Filter permissions based on search and category
  const filteredPermissions = Object.entries(permissionCategories)
    .filter(([category]) => 
      filterCategory === 'all' || category.toLowerCase().includes(filterCategory.toLowerCase())
    )
    .flatMap(([_, permissions]) => 
      permissions.filter(permission =>
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // Filter roles based on selection
  const displayRoles = selectedRoles.length > 0 
    ? roles.filter(role => selectedRoles.includes(role.id))
    : roles;

  const getPermissionIcon = (role: Role, permission: string) => {
    if (role.permissions.includes(permission)) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-gray-300" />;
  };

  const getRoleBadgeVariant = (role: Role) => {
    if (role.isSystem) return 'default';
    return 'secondary';
  };

  if (!hasPermission(PERMISSIONS.READ_USER)) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to view the permission matrix.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permission Matrix
              </CardTitle>
              <CardDescription>
                Visual representation of roles and their permissions
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(permissionCategories).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedRoles.length > 0 ? 'selected' : 'all'} 
              onValueChange={(value) => setSelectedRoles(value === 'all' ? [] : [])}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="selected">Selected Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permission Matrix Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64">Permission</TableHead>
                  {displayRoles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-24">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-sm font-medium">{role.name}</span>
                        <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {permission.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </TableCell>
                    {displayRoles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        {getPermissionIcon(role, permission)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Has Permission</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-muted-foreground">No Permission</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PermissionMatrix;

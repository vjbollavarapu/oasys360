/**
 * User Create Form Component
 * Form for creating new users
 */

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock, Shield, Building2, AlertCircle } from 'lucide-react';
import { userService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, ROLES } from '@/lib/rbac';

// Form validation schema
const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.string().min(1, 'Role is required'),
  isActive: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface UserCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  tenantId?: string;
}

export function UserCreateForm({ onSuccess, onCancel, tenantId }: UserCreateFormProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, clearError } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      isActive: true,
      sendWelcomeEmail: true,
    },
  });

  // Available roles based on user permissions
  const getAvailableRoles = () => {
    const roles = [];
    
    if (hasPermission('create_user')) {
      roles.push(
        { value: ROLES.STAFF, label: 'Staff' },
        { value: ROLES.ACCOUNTANT, label: 'Accountant' },
        { value: ROLES.VIEWER, label: 'Viewer' },
      );
    }
    
    if (hasPermission('create_user')) {
      roles.push(
        { value: ROLES.CFO, label: 'CFO' },
        { value: ROLES.TENANT_ADMIN, label: 'Tenant Admin' },
      );
    }
    
    if (hasPermission('create_user')) {
      roles.push(
        { value: ROLES.FIRM_STAFF, label: 'Firm Staff' },
        { value: ROLES.FIRM_ADMIN, label: 'Firm Admin' },
      );
    }
    
    if (hasPermission('create_user')) {
      roles.push(
        { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
        { value: ROLES.PLATFORM_ADMIN, label: 'Platform Admin' },
      );
    }
    
    return roles;
  };

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      const userData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive,
        sendWelcomeEmail: data.sendWelcomeEmail,
        ...(tenantId && { tenantId }),
      };

      const response = await userService.createUser(userData);
      
      if (response.success) {
        reset();
        onSuccess();
      } else {
        handleError(new Error(response.message || 'Failed to create user'));
      }
    } catch (error) {
      handleError(error, {
        component: 'UserCreateForm',
        action: 'createUser',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Basic user information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Enter first name"
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Enter last name"
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="user@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Set up user credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter password"
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm password"
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role and Permissions
          </CardTitle>
          <CardDescription>
            Assign user role and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select onValueChange={(value) => setValue('role', value)}>
              <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
              />
              <Label htmlFor="isActive">Active user</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendWelcomeEmail"
                checked={watch('sendWelcomeEmail')}
                onCheckedChange={(checked) => setValue('sendWelcomeEmail', checked as boolean)}
              />
              <Label htmlFor="sendWelcomeEmail">Send welcome email</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating User...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}

export default UserCreateForm;

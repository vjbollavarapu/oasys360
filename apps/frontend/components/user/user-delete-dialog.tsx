/**
 * User Delete Dialog Component
 * Confirmation dialog for deleting users
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { userService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  tenant?: {
    id: string;
    name: string;
  };
}

interface UserDeleteDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserDeleteDialog({ user, open, onOpenChange, onSuccess }: UserDeleteDialogProps) {
  const { error, handleError, clearError } = useErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const expectedConfirmation = `DELETE ${user.email}`;
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleDelete = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    clearError();

    try {
      const response = await userService.deleteUser(user.id);
      
      if (response.success) {
        onSuccess();
        onOpenChange(false);
        setConfirmationText('');
      } else {
        handleError(new Error(response.message || 'Failed to delete user'));
      }
    } catch (error) {
      handleError(error, {
        component: 'UserDeleteDialog',
        action: 'deleteUser',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setConfirmationText('');
    clearError();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* User Information */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.email}
            </div>
            <div className="text-sm text-muted-foreground">
              Role: {user.role.replace('_', ' ')}
            </div>
            {user.tenant && (
              <div className="text-sm text-muted-foreground">
                Tenant: {user.tenant.name}
              </div>
            )}
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm, type <code className="bg-muted px-1 rounded">{expectedConfirmation}</code> in the box below:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedConfirmation}
              className={confirmationText && !isConfirmationValid ? 'border-destructive' : ''}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-destructive">
                Confirmation text does not match
              </p>
            )}
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting this user will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove all user data and preferences</li>
                <li>Delete any pending tasks assigned to this user</li>
                <li>Remove access to all systems and applications</li>
                <li>Cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserDeleteDialog;

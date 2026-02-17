/**
 * ERP Connection Form Component
 * Create and edit ERP integrations (QuickBooks, Xero, NetSuite)
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { erpIntegrationService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { AlertCircle, CheckCircle } from 'lucide-react';

const erpConnectionSchema = z.object({
  provider: z.enum(['quickbooks', 'xero', 'netsuite']),
  name: z.string().min(1, 'Connection name is required'),
  company_id: z.string().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
  auto_sync: z.boolean().default(false),
  sync_frequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
});

type ErpConnectionFormData = z.infer<typeof erpConnectionSchema>;

interface ErpConnectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Partial<ErpConnectionFormData> & { id?: string };
}

export function ErpConnectionForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  initialData 
}: ErpConnectionFormProps) {
  const { withErrorHandling } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthStep, setOauthStep] = useState<'form' | 'oauth' | 'complete'>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ErpConnectionFormData>({
    resolver: zodResolver(erpConnectionSchema),
    defaultValues: {
      provider: initialData?.provider || 'quickbooks',
      name: initialData?.name || '',
      company_id: initialData?.company_id || '',
      client_id: initialData?.client_id || '',
      client_secret: initialData?.client_secret || '',
      environment: initialData?.environment || 'sandbox',
      auto_sync: initialData?.auto_sync || false,
      sync_frequency: initialData?.sync_frequency || 'daily',
    },
  });

  const selectedProvider = watch('provider');

  const onSubmit = async (data: ErpConnectionFormData) => {
    await withErrorHandling(async () => {
      setIsSubmitting(true);
      
      const connectionData = {
        provider: data.provider,
        name: data.name,
        config: {
          company_id: data.company_id,
          client_id: data.client_id,
          client_secret: data.client_secret,
          environment: data.environment,
          auto_sync: data.auto_sync,
          sync_frequency: data.sync_frequency,
        },
      };

      if (initialData?.id) {
        // Update existing connection
        await erpIntegrationService.updateErpConnection(initialData.id, connectionData);
      } else {
        // Create new connection
        await erpIntegrationService.createErpConnection(connectionData);
      }
      
      reset();
      onOpenChange(false);
      onSuccess?.();
    });
    setIsSubmitting(false);
  };

  const handleOAuthConnect = async () => {
    // Trigger OAuth flow
    setOauthStep('oauth');
    // Implementation would redirect to OAuth provider
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit ERP Connection' : 'New ERP Connection'}
          </DialogTitle>
          <DialogDescription>
            Connect to {selectedProvider ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1) : 'ERP'}
          </DialogDescription>
        </DialogHeader>

        {oauthStep === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">ERP Provider</Label>
              <Select
                value={watch('provider')}
                onValueChange={(value) => setValue('provider', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quickbooks">QuickBooks</SelectItem>
                  <SelectItem value="xero">Xero</SelectItem>
                  <SelectItem value="netsuite">NetSuite</SelectItem>
                </SelectContent>
              </Select>
              {errors.provider && (
                <p className="text-sm text-red-500">{errors.provider.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="My QuickBooks Connection"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                OAuth authentication is recommended for secure access. Click "Connect via OAuth" to use OAuth flow.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={watch('environment')}
                onValueChange={(value) => setValue('environment', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID (Optional)</Label>
                <Input
                  id="client_id"
                  {...register('client_id')}
                  type="password"
                  placeholder="Client ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_secret">Client Secret (Optional)</Label>
                <Input
                  id="client_secret"
                  {...register('client_secret')}
                  type="password"
                  placeholder="Client Secret"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sync_frequency">Auto Sync Frequency</Label>
              <Select
                value={watch('sync_frequency')}
                onValueChange={(value) => setValue('sync_frequency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleOAuthConnect}
              >
                Connect via OAuth
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {oauthStep === 'oauth' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Redirecting to {selectedProvider} for authentication...
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOauthStep('form')}
              >
                Back
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


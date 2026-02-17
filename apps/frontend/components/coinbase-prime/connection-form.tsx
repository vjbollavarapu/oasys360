/**
 * Coinbase Prime Connection Form
 * Create connection to Coinbase Prime
 */

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { coinbasePrimeService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { AlertCircle } from 'lucide-react';

const coinbaseConnectionSchema = z.object({
  api_key: z.string().min(1, 'API Key is required'),
  api_secret: z.string().min(1, 'API Secret is required'),
  passphrase: z.string().min(1, 'Passphrase is required'),
  sandbox: z.boolean().default(true),
});

type CoinbaseConnectionFormData = z.infer<typeof coinbaseConnectionSchema>;

interface CoinbaseConnectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Partial<CoinbaseConnectionFormData> & { id?: string };
}

export function CoinbaseConnectionForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  initialData 
}: CoinbaseConnectionFormProps) {
  const { withErrorHandling } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CoinbaseConnectionFormData>({
    resolver: zodResolver(coinbaseConnectionSchema),
    defaultValues: {
      api_key: initialData?.api_key || '',
      api_secret: initialData?.api_secret || '',
      passphrase: initialData?.passphrase || '',
      sandbox: initialData?.sandbox ?? true,
    },
  });

  const onSubmit = async (data: CoinbaseConnectionFormData) => {
    await withErrorHandling(async () => {
      setIsSubmitting(true);
      
      const connectionData = {
        apiKey: data.api_key,
        apiSecret: data.api_secret,
        passphrase: data.passphrase,
        sandbox: data.sandbox,
      };

      if (initialData?.id) {
        await coinbasePrimeService.updateConnection(initialData.id, connectionData);
      } else {
        await coinbasePrimeService.createConnection(connectionData);
      }
      
      reset();
      onOpenChange(false);
      onSuccess?.();
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Coinbase Prime Connection' : 'New Coinbase Prime Connection'}
          </DialogTitle>
          <DialogDescription>
            Connect to Coinbase Prime for institutional trading
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Store API credentials securely. They will be encrypted and stored in our secure vault.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              {...register('api_key')}
              type="password"
              placeholder="Your Coinbase Prime API Key"
            />
            {errors.api_key && (
              <p className="text-sm text-red-500">{errors.api_key.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_secret">API Secret</Label>
            <Input
              id="api_secret"
              {...register('api_secret')}
              type="password"
              placeholder="Your Coinbase Prime API Secret"
            />
            {errors.api_secret && (
              <p className="text-sm text-red-500">{errors.api_secret.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              {...register('passphrase')}
              type="password"
              placeholder="Your Coinbase Prime Passphrase"
            />
            {errors.passphrase && (
              <p className="text-sm text-red-500">{errors.passphrase.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sandbox">Sandbox Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use sandbox environment for testing
              </p>
            </div>
            <Switch
              id="sandbox"
              checked={watch('sandbox')}
              onCheckedChange={(checked) => setValue('sandbox', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Connect'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


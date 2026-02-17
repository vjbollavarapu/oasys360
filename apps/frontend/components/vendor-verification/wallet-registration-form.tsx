/**
 * Vendor Wallet Registration Form
 * Register and verify vendor wallet addresses
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
import { vendorVerificationService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { AlertCircle, CheckCircle } from 'lucide-react';

const walletRegistrationSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  wallet_address: z.string().min(1, 'Wallet address is required').regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),
  network: z.enum(['ethereum', 'polygon', 'bsc', 'solana', 'arbitrum', 'optimism', 'base']),
  notes: z.string().optional(),
});

type WalletRegistrationFormData = z.infer<typeof walletRegistrationSchema>;

interface WalletRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  supplierId?: string;
}

export function WalletRegistrationForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  supplierId 
}: WalletRegistrationFormProps) {
  const { withErrorHandling } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WalletRegistrationFormData>({
    resolver: zodResolver(walletRegistrationSchema),
    defaultValues: {
      supplier_id: supplierId || '',
      wallet_address: '',
      network: 'ethereum',
      notes: '',
    },
  });

  const onSubmit = async (data: WalletRegistrationFormData) => {
    await withErrorHandling(async () => {
      setIsSubmitting(true);
      
      await vendorVerificationService.registerWallet(data.supplier_id, {
        walletAddress: data.wallet_address,
        network: data.network,
      });
      
      reset();
      onOpenChange(false);
      onSuccess?.();
    });
    setIsSubmitting(false);
  };

  const handleVerify = async () => {
    const walletAddress = watch('wallet_address');
    const network = watch('network');
    const supplierId = watch('supplier_id');

    if (!walletAddress || !network || !supplierId) {
      return;
    }

    await withErrorHandling(async () => {
      setIsVerifying(true);
      await vendorVerificationService.verifyWallet(supplierId, {
        walletAddress,
        network,
      });
      setIsVerifying(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register Vendor Wallet</DialogTitle>
          <DialogDescription>
            Register and verify a wallet address for vendor payments
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_id">Supplier</Label>
            <Input
              id="supplier_id"
              {...register('supplier_id')}
              placeholder="Supplier ID"
              disabled={!!supplierId}
            />
            {errors.supplier_id && (
              <p className="text-sm text-red-500">{errors.supplier_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet_address">Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                id="wallet_address"
                {...register('wallet_address')}
                placeholder="0x..."
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVerify}
                disabled={isVerifying || !watch('wallet_address')}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            {errors.wallet_address && (
              <p className="text-sm text-red-500">{errors.wallet_address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select
              value={watch('network')}
              onValueChange={(value) => setValue('network', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                <SelectItem value="optimism">Optimism</SelectItem>
                <SelectItem value="base">Base</SelectItem>
              </SelectContent>
            </Select>
            {errors.network && (
              <p className="text-sm text-red-500">{errors.network.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this wallet"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Wallet addresses are verified on-chain. Ensure the address is correct before registration.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Wallet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


/**
 * Gnosis Safe Creation Form
 * Create a new Gnosis Safe multi-sig wallet
 */

"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { gnosisSafeService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Plus, X, AlertCircle } from 'lucide-react';

const safeCreationSchema = z.object({
  name: z.string().min(1, 'Safe name is required'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid safe address'),
  network: z.enum(['ethereum', 'polygon', 'arbitrum', 'optimism', 'base']),
  threshold: z.number().min(1, 'Threshold must be at least 1'),
  owners: z.array(z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid owner address'),
  })).min(1, 'At least one owner is required'),
});

type SafeCreationFormData = z.infer<typeof safeCreationSchema>;

interface CreateSafeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSafeForm({ 
  open, 
  onOpenChange, 
  onSuccess,
}: CreateSafeFormProps) {
  const { withErrorHandling } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SafeCreationFormData>({
    resolver: zodResolver(safeCreationSchema),
    defaultValues: {
      name: '',
      address: '',
      network: 'ethereum',
      threshold: 1,
      owners: [{ address: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'owners',
  });

  const owners = watch('owners');
  const threshold = watch('threshold');

  const onSubmit = async (data: SafeCreationFormData) => {
    if (data.threshold > data.owners.length) {
      return;
    }

    await withErrorHandling(async () => {
      setIsSubmitting(true);
      
      await gnosisSafeService.createSafe({
        address: data.address,
        network: data.network,
        threshold: data.threshold,
        owners: data.owners.map(o => o.address),
      });
      
      reset();
      onOpenChange(false);
      onSuccess?.();
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Gnosis Safe</DialogTitle>
          <DialogDescription>
            Create a new multi-signature wallet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Safe Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Safe Wallet"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Safe Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="0x..."
              className="font-mono"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
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
            <Label htmlFor="threshold">Threshold</Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              max={owners.length}
              {...register('threshold', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Number of confirmations required: {threshold} of {owners.length}
            </p>
            {errors.threshold && (
              <p className="text-sm text-red-500">{errors.threshold.message}</p>
            )}
            {threshold > owners.length && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Threshold cannot be greater than number of owners
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Owners</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ address: '' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Owner
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`owners.${index}.address`)}
                  placeholder={`Owner ${index + 1} address (0x...)`}
                  className="font-mono"
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.owners && (
              <p className="text-sm text-red-500">{errors.owners.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || threshold > owners.length}>
              {isSubmitting ? 'Creating...' : 'Create Safe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


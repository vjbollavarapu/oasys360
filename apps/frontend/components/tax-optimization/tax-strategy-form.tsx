/**
 * Tax Strategy Form Component
 * Create and edit tax optimization strategies
 */

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { taxOptimizationService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

const taxStrategySchema = z.object({
  strategy_type: z.enum([
    'loss_harvesting',
    'gain_realization',
    'year_end_planning',
    'offset_opportunity',
    'tax_deferral',
    'deduction_maximization',
  ]),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['high', 'medium', 'low']),
  potential_savings: z.number().min(0).optional(),
  recommended_actions: z.string().optional(),
  tax_year: z.number().min(2000).max(2100),
});

type TaxStrategyFormData = z.infer<typeof taxStrategySchema>;

interface TaxStrategyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Partial<TaxStrategyFormData>;
}

export function TaxStrategyForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  initialData 
}: TaxStrategyFormProps) {
  const { withErrorHandling } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaxStrategyFormData>({
    resolver: zodResolver(taxStrategySchema),
    defaultValues: {
      strategy_type: initialData?.strategy_type || 'loss_harvesting',
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      potential_savings: initialData?.potential_savings,
      recommended_actions: initialData?.recommended_actions || '',
      tax_year: initialData?.tax_year || new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: TaxStrategyFormData) => {
    await withErrorHandling(async () => {
      setIsSubmitting(true);
      
      if (initialData) {
        // Update existing strategy
        // await taxOptimizationService.updateTaxStrategy(initialData.id!, data);
      } else {
        // Create new strategy
        await taxOptimizationService.createTaxStrategy(data);
      }
      
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
          <DialogTitle>
            {initialData ? 'Edit Tax Strategy' : 'Create Tax Strategy'}
          </DialogTitle>
          <DialogDescription>
            Create a new tax optimization strategy
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy_type">Strategy Type</Label>
              <Select
                value={watch('strategy_type')}
                onValueChange={(value) => setValue('strategy_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loss_harvesting">Loss Harvesting</SelectItem>
                  <SelectItem value="gain_realization">Gain Realization</SelectItem>
                  <SelectItem value="year_end_planning">Year-End Planning</SelectItem>
                  <SelectItem value="offset_opportunity">Offset Opportunity</SelectItem>
                  <SelectItem value="tax_deferral">Tax Deferral</SelectItem>
                  <SelectItem value="deduction_maximization">Deduction Maximization</SelectItem>
                </SelectContent>
              </Select>
              {errors.strategy_type && (
                <p className="text-sm text-red-500">{errors.strategy_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Strategy title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Strategy description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_year">Tax Year</Label>
              <Input
                id="tax_year"
                type="number"
                {...register('tax_year', { valueAsNumber: true })}
              />
              {errors.tax_year && (
                <p className="text-sm text-red-500">{errors.tax_year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="potential_savings">Potential Savings ($)</Label>
              <Input
                id="potential_savings"
                type="number"
                step="0.01"
                {...register('potential_savings', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.potential_savings && (
                <p className="text-sm text-red-500">{errors.potential_savings.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommended_actions">Recommended Actions</Label>
            <Textarea
              id="recommended_actions"
              {...register('recommended_actions')}
              placeholder="Recommended actions to take"
              rows={3}
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


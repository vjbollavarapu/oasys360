/**
 * Bank Reconciliation Component
 * Manages bank reconciliation process
 */

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Target,
  Zap,
  BookOpen,
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { bankingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const reconciliationSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  statementDate: z.string().min(1, 'Statement date is required'),
  statementBalance: z.number().min(0, 'Statement balance must be positive'),
  notes: z.string().optional(),
});

type ReconciliationFormData = z.infer<typeof reconciliationSchema>;

interface Reconciliation {
  id: string;
  account: {
    id: string;
    name: string;
    bankName: string;
    accountType: string;
  };
  statementDate: string;
  statementBalance: number;
  bookBalance: number;
  reconciledBalance: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  items: ReconciliationItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ReconciliationItem {
  id: string;
  type: 'deposit' | 'withdrawal' | 'adjustment';
  description: string;
  amount: number;
  date: string;
  reference?: string;
  isReconciled: boolean;
  transactionId?: string;
  bankTransactionId?: string;
}

interface Account {
  id: string;
  name: string;
  bankName: string;
  accountType: string;
  balance: number;
}

interface BankReconciliationProps {
  className?: string;
}

export function BankReconciliation({ className = '' }: BankReconciliationProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: {
      accountId: '',
      statementDate: new Date().toISOString().split('T')[0],
      statementBalance: 0,
      notes: '',
    },
  });

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load reconciliations
      const reconciliationsResponse = await bankingService.getReconciliations();
      if (reconciliationsResponse.success && reconciliationsResponse.data) {
        // Handle paginated response
        const reconciliationsData = reconciliationsResponse.data.results || reconciliationsResponse.data || [];
        setReconciliations(Array.isArray(reconciliationsData) ? reconciliationsData : []);
      }
      
      // Load accounts
      const accountsResponse = await bankingService.getBankConnections();
      if (accountsResponse.success && accountsResponse.data) {
        // Handle paginated response
        const accountsData = accountsResponse.data.results || accountsResponse.data || [];
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle reconciliation creation
  const handleCreateReconciliation = async (data: ReconciliationFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await bankingService.createReconciliation(data);
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create reconciliation'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankReconciliation',
        action: 'createReconciliation',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reconciliation update
  const handleUpdateReconciliation = async (data: ReconciliationFormData) => {
    if (!selectedReconciliation) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await bankingService.updateReconciliation(selectedReconciliation.id, data);
      
      if (response.success) {
        await loadData();
        setShowEditDialog(false);
        setSelectedReconciliation(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update reconciliation'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankReconciliation',
        action: 'updateReconciliation',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reconciliation completion
  const handleCompleteReconciliation = async (reconciliation: Reconciliation) => {
    try {
      const response = await bankingService.completeReconciliation(reconciliation.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to complete reconciliation'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankReconciliation',
        action: 'completeReconciliation',
      });
    }
  };

  // Handle reconciliation cancellation
  const handleCancelReconciliation = async (reconciliation: Reconciliation) => {
    if (!confirm(`Are you sure you want to cancel this reconciliation?`)) {
      return;
    }
    
    try {
      const response = await bankingService.cancelReconciliation(reconciliation.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to cancel reconciliation'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankReconciliation',
        action: 'cancelReconciliation',
      });
    }
  };

  // Handle item reconciliation
  const handleReconcileItems = async (itemIds: string[]) => {
    if (!selectedReconciliation) return;
    
    try {
      const response = await bankingService.reconcileItems(selectedReconciliation.id, itemIds);
      
      if (response.success) {
        await loadData();
        setSelectedItems([]);
      } else {
        handleError(new Error(response.message || 'Failed to reconcile items'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankReconciliation',
        action: 'reconcileItems',
      });
    }
  };

  // Handle edit reconciliation
  const handleEditReconciliation = (reconciliation: Reconciliation) => {
    setSelectedReconciliation(reconciliation);
    setValue('accountId', reconciliation.account.id);
    setValue('statementDate', reconciliation.statementDate);
    setValue('statementBalance', reconciliation.statementBalance);
    setValue('notes', reconciliation.notes || '');
    setShowEditDialog(true);
  };

  // Handle reconcile reconciliation
  const handleReconcileReconciliation = (reconciliation: Reconciliation) => {
    setSelectedReconciliation(reconciliation);
    setShowReconcileDialog(true);
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all items
  const handleSelectAllItems = () => {
    if (!selectedReconciliation) return;
    
    const unreconciledItems = selectedReconciliation.items.filter(item => !item.isReconciled);
    
    if (selectedItems.length === unreconciledItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(unreconciledItems.map(item => item.id));
    }
  };

  // Filter reconciliations
  const filteredReconciliations = reconciliations.filter(reconciliation => {
    const matchesSearch = !searchTerm || 
      reconciliation.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reconciliation.account.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reconciliation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get item type icon
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return TrendingUp;
      case 'withdrawal':
        return TrendingDown;
      case 'adjustment':
        return Calculator;
      default:
        return FileText;
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate reconciliation totals
  const calculateTotals = (reconciliation: Reconciliation) => {
    const unreconciledItems = reconciliation.items.filter(item => !item.isReconciled);
    const totalDeposits = unreconciledItems
      .filter(item => item.type === 'deposit')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalWithdrawals = unreconciledItems
      .filter(item => item.type === 'withdrawal')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalAdjustments = unreconciledItems
      .filter(item => item.type === 'adjustment')
      .reduce((sum, item) => sum + item.amount, 0);
    
    return {
      totalDeposits,
      totalWithdrawals,
      totalAdjustments,
      netDifference: totalDeposits - totalWithdrawals + totalAdjustments,
    };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Bank Reconciliation</h2>
          <p className="text-muted-foreground">
            Reconcile your bank statements with your records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_RECONCILIATION">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Reconciliation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Reconciliation</DialogTitle>
                  <DialogDescription>
                    Start a new bank reconciliation process
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateReconciliation)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountId">Account *</Label>
                    <Select onValueChange={(value) => setValue('accountId', value)}>
                      <SelectTrigger className={errors.accountId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} - {account.bankName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.accountId && (
                      <p className="text-sm text-destructive">{errors.accountId.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="statementDate">Statement Date *</Label>
                      <Input
                        id="statementDate"
                        type="date"
                        {...register('statementDate')}
                        className={errors.statementDate ? 'border-destructive' : ''}
                      />
                      {errors.statementDate && (
                        <p className="text-sm text-destructive">{errors.statementDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="statementBalance">Statement Balance *</Label>
                      <Input
                        id="statementBalance"
                        type="number"
                        step="0.01"
                        {...register('statementBalance', { valueAsNumber: true })}
                        className={errors.statementBalance ? 'border-destructive' : ''}
                      />
                      {errors.statementBalance && (
                        <p className="text-sm text-destructive">{errors.statementBalance.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Reconciliation notes"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Reconciliation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search reconciliations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Statement Date</TableHead>
                <TableHead>Statement Balance</TableHead>
                <TableHead>Book Balance</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReconciliations.map((reconciliation) => {
                const totals = calculateTotals(reconciliation);
                const isBalanced = Math.abs(totals.netDifference) < 0.01;
                
                return (
                  <TableRow key={reconciliation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reconciliation.account.name}</div>
                        <div className="text-sm text-muted-foreground">{reconciliation.account.bankName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(reconciliation.statementDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono">
                        {formatCurrency(reconciliation.statementBalance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono">
                        {formatCurrency(reconciliation.bookBalance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totals.netDifference)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(reconciliation.status)}>
                        {reconciliation.status.charAt(0).toUpperCase() + reconciliation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{reconciliation.createdBy.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <PermissionGate permission="READ_RECONCILIATION">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReconcileReconciliation(reconciliation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="UPDATE_RECONCILIATION">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditReconciliation(reconciliation)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                        {reconciliation.status === 'in_progress' && (
                          <PermissionGate permission="COMPLETE_RECONCILIATION">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCompleteReconciliation(reconciliation)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </PermissionGate>
                        )}
                        <PermissionGate permission="DELETE_RECONCILIATION">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelReconciliation(reconciliation)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reconciliation Dialog */}
      {selectedReconciliation && (
        <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reconcile: {selectedReconciliation.account.name}</DialogTitle>
              <DialogDescription>
                Statement Date: {formatDate(selectedReconciliation.statementDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reconciliation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedReconciliation.statementBalance)}
                      </div>
                      <div className="text-sm text-muted-foreground">Statement Balance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedReconciliation.bookBalance)}
                      </div>
                      <div className="text-sm text-muted-foreground">Book Balance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${Math.abs(selectedReconciliation.statementBalance - selectedReconciliation.bookBalance) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(selectedReconciliation.statementBalance - selectedReconciliation.bookBalance)}
                      </div>
                      <div className="text-sm text-muted-foreground">Difference</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unreconciled Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Unreconciled Items</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllItems}
                      >
                        {selectedItems.length === selectedReconciliation.items.filter(item => !item.isReconciled).length ? (
                          <CheckSquare className="w-4 h-4 mr-2" />
                        ) : (
                          <Square className="w-4 h-4 mr-2" />
                        )}
                        Select All
                      </Button>
                      {selectedItems.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleReconcileItems(selectedItems)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reconcile Selected ({selectedItems.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReconciliation.items
                        .filter(item => !item.isReconciled)
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemSelect(item.id)}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{formatDate(item.date)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{item.description}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {React.createElement(getItemTypeIcon(item.type), { className: "w-4 h-4" })}
                                <span className="capitalize">{item.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`font-mono ${item.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'deposit' ? '+' : '-'}{formatCurrency(item.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.reference ? (
                                <span className="text-sm font-mono">{item.reference}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default BankReconciliation;

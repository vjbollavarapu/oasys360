/**
 * Chart of Accounts Component
 * Manages the chart of accounts for accounting
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { accountingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const accountSchema = z.object({
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  parentAccount: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  normalBalance: z.enum(['debit', 'credit']),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface Account {
  id: string;
  code: string;
  name: string;
  accountType: string;
  parentAccount?: {
    id: string;
    name: string;
  };
  description?: string;
  isActive: boolean;
  normalBalance: 'debit' | 'credit';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface ChartOfAccountsProps {
  className?: string;
}

export function ChartOfAccounts({ className = '' }: ChartOfAccountsProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      isActive: true,
      normalBalance: 'debit',
    },
  });

  // Account types
  const accountTypes = [
    { value: 'asset', label: 'Assets', normalBalance: 'debit' },
    { value: 'liability', label: 'Liabilities', normalBalance: 'credit' },
    { value: 'equity', label: 'Equity', normalBalance: 'credit' },
    { value: 'revenue', label: 'Revenue', normalBalance: 'credit' },
    { value: 'expense', label: 'Expenses', normalBalance: 'debit' },
    { value: 'cost_of_sales', label: 'Cost of Sales', normalBalance: 'debit' },
    { value: 'other_income', label: 'Other Income', normalBalance: 'credit' },
    { value: 'other_expense', label: 'Other Expenses', normalBalance: 'debit' },
  ];

  // Load accounts
  const loadAccounts = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await accountingService.getChartOfAccounts();
      
      if (response.success && response.data) {
        setAccounts(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Handle account creation
  const handleCreateAccount = async (data: AccountFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await accountingService.createAccount(data);
      
      if (response.success) {
        await loadAccounts();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create account'));
      }
    } catch (error) {
      handleError(error, {
        component: 'ChartOfAccounts',
        action: 'createAccount',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle account update
  const handleUpdateAccount = async (data: AccountFormData) => {
    if (!selectedAccount) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await accountingService.updateAccount(selectedAccount.id, data);
      
      if (response.success) {
        await loadAccounts();
        setShowEditDialog(false);
        setSelectedAccount(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update account'));
      }
    } catch (error) {
      handleError(error, {
        component: 'ChartOfAccounts',
        action: 'updateAccount',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (account: Account) => {
    if (!confirm(`Are you sure you want to delete account ${account.name}?`)) {
      return;
    }
    
    try {
      const response = await accountingService.deleteAccount(account.id);
      
      if (response.success) {
        await loadAccounts();
      } else {
        handleError(new Error(response.message || 'Failed to delete account'));
      }
    } catch (error) {
      handleError(error, {
        component: 'ChartOfAccounts',
        action: 'deleteAccount',
      });
    }
  };

  // Handle edit account
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setValue('code', account.code);
    setValue('name', account.name);
    setValue('accountType', account.accountType);
    setValue('parentAccount', account.parentAccount?.id || '');
    setValue('description', account.description || '');
    setValue('isActive', account.isActive);
    setValue('normalBalance', account.normalBalance);
    setShowEditDialog(true);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchTerm || 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Get account type label
  const getAccountTypeLabel = (type: string) => {
    return accountTypes.find(t => t.value === type)?.label || type;
  };

  // Get account type color
  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      liability: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      equity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      revenue: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      cost_of_sales: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      other_income: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      other_expense: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get balance icon
  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <DollarSign className="w-4 h-4 text-gray-500" />;
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
          <h2 className="text-2xl font-bold">Chart of Accounts</h2>
          <p className="text-muted-foreground">
            Manage your chart of accounts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadAccounts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_ACCOUNT">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                  <DialogDescription>
                    Add a new account to your chart of accounts
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateAccount)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Account Code *</Label>
                      <Input
                        id="code"
                        {...register('code')}
                        placeholder="e.g., 1000"
                        className={errors.code ? 'border-destructive' : ''}
                      />
                      {errors.code && (
                        <p className="text-sm text-destructive">{errors.code.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Account Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., Cash"
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Account Type *</Label>
                      <Select onValueChange={(value) => setValue('accountType', value)}>
                        <SelectTrigger className={errors.accountType ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.accountType && (
                        <p className="text-sm text-destructive">{errors.accountType.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="parentAccount">Parent Account</Label>
                      <Select onValueChange={(value) => setValue('parentAccount', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No parent account</SelectItem>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Account description"
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
                          Create Account
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
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge className={getAccountTypeColor(account.accountType)}>
                      {getAccountTypeLabel(account.accountType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.parentAccount ? (
                      <span className="text-sm text-muted-foreground">
                        {account.parentAccount.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getBalanceIcon(account.balance)}
                      <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? 'default' : 'secondary'}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <PermissionGate permission="UPDATE_ACCOUNT">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="DELETE_ACCOUNT">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAccount(account)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedAccount && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>
                Update account information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleUpdateAccount)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Account Code *</Label>
                  <Input
                    id="edit-code"
                    {...register('code')}
                    className={errors.code ? 'border-destructive' : ''}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Account Name *</Label>
                  <Input
                    id="edit-name"
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-accountType">Account Type *</Label>
                  <Select 
                    value={watch('accountType')} 
                    onValueChange={(value) => setValue('accountType', value)}
                  >
                    <SelectTrigger className={errors.accountType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.accountType && (
                    <p className="text-sm text-destructive">{errors.accountType.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-parentAccount">Parent Account</Label>
                  <Select 
                    value={watch('parentAccount') || ''} 
                    onValueChange={(value) => setValue('parentAccount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent account</SelectItem>
                      {accounts.filter(a => a.id !== selectedAccount.id).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  {...register('description')}
                />
              </div>
              
              <div className="flex items-center justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ChartOfAccounts;

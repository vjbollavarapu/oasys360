/**
 * Transaction Management Component
 * Manages bank transactions and categorization
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
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Tag,
  Building2,
  CreditCard,
  Receipt,
  Upload,
  Eye,
  EyeOff,
  Filter as FilterIcon,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { bankingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const transactionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['debit', 'credit']),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  account: z.string().min(1, 'Account is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  subcategory?: string;
  account: {
    id: string;
    name: string;
    bankName: string;
  };
  reference?: string;
  notes?: string;
  tags: string[];
  status: 'pending' | 'cleared' | 'reconciled';
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface Account {
  id: string;
  name: string;
  bankName: string;
  accountType: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  color: string;
}

interface TransactionManagementProps {
  className?: string;
}

export function TransactionManagement({ className = '' }: TransactionManagementProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'debit',
      category: '',
      subcategory: '',
      account: '',
      reference: '',
      notes: '',
      tags: [],
    },
  });

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load transactions
      const transactionsResponse = await bankingService.getTransactions();
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
      
      // Load accounts
      const accountsResponse = await bankingService.getBankConnections();
      if (accountsResponse.success && accountsResponse.data) {
        setAccounts(accountsResponse.data);
      }
      
      // Load categories
      // Note: Backend doesn't have a categories endpoint - categories are stored as strings in transactions
      const categoriesResponse = await bankingService.getTransactionCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        // Handle paginated response
        const categoriesData = categoriesResponse.data.results || categoriesResponse.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle transaction creation
  const handleCreateTransaction = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await bankingService.createTransaction(data);
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create transaction'));
      }
    } catch (error) {
      handleError(error, {
        component: 'TransactionManagement',
        action: 'createTransaction',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transaction update
  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!selectedTransaction) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await bankingService.updateTransaction(selectedTransaction.id, data);
      
      if (response.success) {
        await loadData();
        setShowEditDialog(false);
        setSelectedTransaction(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update transaction'));
      }
    } catch (error) {
      handleError(error, {
        component: 'TransactionManagement',
        action: 'updateTransaction',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!confirm(`Are you sure you want to delete this transaction?`)) {
      return;
    }
    
    try {
      const response = await bankingService.deleteTransaction(transaction.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to delete transaction'));
      }
    } catch (error) {
      handleError(error, {
        component: 'TransactionManagement',
        action: 'deleteTransaction',
      });
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = async (data: Partial<TransactionFormData>) => {
    if (selectedTransactions.length === 0) return;
    
    try {
      const response = await bankingService.bulkUpdateTransactions(selectedTransactions, data);
      
      if (response.success) {
        await loadData();
        setSelectedTransactions([]);
        setShowBulkEditDialog(false);
      } else {
        handleError(new Error(response.message || 'Failed to update transactions'));
      }
    } catch (error) {
      handleError(error, {
        component: 'TransactionManagement',
        action: 'bulkUpdateTransactions',
      });
    }
  };

  // Handle transaction selection
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setValue('date', transaction.date);
    setValue('description', transaction.description);
    setValue('amount', transaction.amount);
    setValue('type', transaction.type);
    setValue('category', transaction.category);
    setValue('subcategory', transaction.subcategory || '');
    setValue('account', transaction.account.id);
    setValue('reference', transaction.reference || '');
    setValue('notes', transaction.notes || '');
    setValue('tags', transaction.tags);
    setShowEditDialog(true);
  };

  // Handle import transactions
  const handleImportTransactions = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await bankingService.importTransactions(formData);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to import transactions'));
      }
    } catch (error) {
      handleError(error, {
        component: 'TransactionManagement',
        action: 'importTransactions',
      });
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = !searchTerm || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesAccount = accountFilter === 'all' || transaction.account.id === accountFilter;
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesAccount;
    })
    .sort((a, b) => {
      let aValue = a[sortField as keyof Transaction];
      let bValue = b[sortField as keyof Transaction];
      
      if (sortField === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'cleared':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'reconciled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#64748b';
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
          <h2 className="text-2xl font-bold">Transaction Management</h2>
          <p className="text-muted-foreground">
            Manage and categorize your bank transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_TRANSACTION">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <DialogDescription>
                    Create a new transaction manually
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateTransaction)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        {...register('date')}
                        className={errors.date ? 'border-destructive' : ''}
                      />
                      {errors.date && (
                        <p className="text-sm text-destructive">{errors.date.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...register('amount', { valueAsNumber: true })}
                        className={errors.amount ? 'border-destructive' : ''}
                      />
                      {errors.amount && (
                        <p className="text-sm text-destructive">{errors.amount.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Transaction description"
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select onValueChange={(value) => setValue('type', value as 'debit' | 'credit')}>
                        <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-destructive">{errors.type.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="account">Account *</Label>
                      <Select onValueChange={(value) => setValue('account', value)}>
                        <SelectTrigger className={errors.account ? 'border-destructive' : ''}>
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
                      {errors.account && (
                        <p className="text-sm text-destructive">{errors.account.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setValue('category', value)}>
                        <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select onValueChange={(value) => setValue('subcategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .find(c => c.name === watch('category'))
                            ?.subcategories.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      {...register('reference')}
                      placeholder="Transaction reference"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Additional notes"
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
                          Create Transaction
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

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedTransactions.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm">
                {selectedTransactions.length} transaction(s) selected
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkEditDialog(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTransactions([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleTransactionSelect(transaction.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.reference && (
                        <div className="text-sm text-muted-foreground">
                          Ref: {transaction.reference}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.account.name}</div>
                      <div className="text-sm text-muted-foreground">{transaction.account.bankName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(transaction.category) }}
                      />
                      <span className="text-sm">{transaction.category}</span>
                      {transaction.subcategory && (
                        <span className="text-xs text-muted-foreground">
                          - {transaction.subcategory}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <PermissionGate permission="UPDATE_TRANSACTION">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="DELETE_TRANSACTION">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction)}
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
    </div>
  );
}

export default TransactionManagement;

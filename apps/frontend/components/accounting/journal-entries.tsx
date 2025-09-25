/**
 * Journal Entries Component
 * Manages journal entries for accounting
 */

"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calculator,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { accountingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const journalEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  reference: z.string().min(1, 'Reference is required'),
  description: z.string().min(1, 'Description is required'),
  entries: z.array(z.object({
    account: z.string().min(1, 'Account is required'),
    debit: z.number().min(0, 'Debit must be positive'),
    credit: z.number().min(0, 'Credit must be positive'),
    description: z.string().optional(),
  })).min(2, 'At least 2 entries are required'),
}).refine((data) => {
  const totalDebit = data.entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = data.entries.reduce((sum, entry) => sum + entry.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01; // Allow for small rounding differences
}, {
  message: "Total debits must equal total credits",
  path: ["entries"],
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  entries: {
    id: string;
    account: {
      id: string;
      code: string;
      name: string;
    };
    debit: number;
    credit: number;
    description?: string;
  }[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
  accountType: string;
}

interface JournalEntriesProps {
  className?: string;
}

export function JournalEntries({ className = '' }: JournalEntriesProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
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
    control,
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      entries: [
        { account: '', debit: 0, credit: 0, description: '' },
        { account: '', debit: 0, credit: 0, description: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries',
  });

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load journal entries
      const entriesResponse = await accountingService.getJournalEntries();
      if (entriesResponse.success && entriesResponse.data) {
        setJournalEntries(entriesResponse.data);
      }
      
      // Load accounts
      const accountsResponse = await accountingService.getChartOfAccounts();
      if (accountsResponse.success && accountsResponse.data) {
        setAccounts(accountsResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle journal entry creation
  const handleCreateEntry = async (data: JournalEntryFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await accountingService.createJournalEntry(data);
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create journal entry'));
      }
    } catch (error) {
      handleError(error, {
        component: 'JournalEntries',
        action: 'createJournalEntry',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle journal entry update
  const handleUpdateEntry = async (data: JournalEntryFormData) => {
    if (!selectedEntry) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await accountingService.updateJournalEntry(selectedEntry.id, data);
      
      if (response.success) {
        await loadData();
        setShowEditDialog(false);
        setSelectedEntry(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update journal entry'));
      }
    } catch (error) {
      handleError(error, {
        component: 'JournalEntries',
        action: 'updateJournalEntry',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle journal entry posting
  const handlePostEntry = async (entry: JournalEntry) => {
    try {
      const response = await accountingService.postJournalEntry(entry.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to post journal entry'));
      }
    } catch (error) {
      handleError(error, {
        component: 'JournalEntries',
        action: 'postJournalEntry',
      });
    }
  };

  // Handle journal entry deletion
  const handleDeleteEntry = async (entry: JournalEntry) => {
    if (!confirm(`Are you sure you want to delete journal entry ${entry.reference}?`)) {
      return;
    }
    
    try {
      const response = await accountingService.deleteJournalEntry(entry.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to delete journal entry'));
      }
    } catch (error) {
      handleError(error, {
        component: 'JournalEntries',
        action: 'deleteJournalEntry',
      });
    }
  };

  // Handle edit entry
  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setValue('date', entry.date);
    setValue('reference', entry.reference);
    setValue('description', entry.description);
    setValue('entries', entry.entries.map(e => ({
      account: e.account.id,
      debit: e.debit,
      credit: e.credit,
      description: e.description || '',
    })));
    setShowEditDialog(true);
  };

  // Add new entry line
  const addEntryLine = () => {
    append({ account: '', debit: 0, credit: 0, description: '' });
  };

  // Remove entry line
  const removeEntryLine = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const entries = watch('entries') || [];
    const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  // Filter entries
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'posted':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'reversed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Journal Entries</h2>
          <p className="text-muted-foreground">
            Manage journal entries for accounting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_ACCOUNT">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Journal Entry</DialogTitle>
                  <DialogDescription>
                    Create a new journal entry
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateEntry)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label htmlFor="reference">Reference *</Label>
                      <Input
                        id="reference"
                        {...register('reference')}
                        placeholder="e.g., JE-001"
                        className={errors.reference ? 'border-destructive' : ''}
                      />
                      {errors.reference && (
                        <p className="text-sm text-destructive">{errors.reference.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        {...register('description')}
                        placeholder="Entry description"
                        className={errors.description ? 'border-destructive' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Journal Entry Lines</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addEntryLine}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Line
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Select
                                  value={watch(`entries.${index}.account`)}
                                  onValueChange={(value) => setValue(`entries.${index}.account`, value)}
                                >
                                  <SelectTrigger className={errors.entries?.[index]?.account ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select account" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {accounts.map((account) => (
                                      <SelectItem key={account.id} value={account.id}>
                                        {account.code} - {account.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  {...register(`entries.${index}.description`)}
                                  placeholder="Line description"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`entries.${index}.debit`, { valueAsNumber: true })}
                                  className="text-right"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`entries.${index}.credit`, { valueAsNumber: true })}
                                  className="text-right"
                                />
                              </TableCell>
                              <TableCell>
                                {fields.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEntryLine(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <strong>Total Debit:</strong> {formatCurrency(totalDebit)}
                        </div>
                        <div className="text-sm">
                          <strong>Total Credit:</strong> {formatCurrency(totalCredit)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isBalanced ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                          {isBalanced ? 'Balanced' : 'Not Balanced'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isBalanced}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Entry
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
                  placeholder="Search entries..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{entry.reference}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.totalDebit)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(entry.status)}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{entry.createdBy.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <PermissionGate permission="UPDATE_ACCOUNT">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      {entry.status === 'draft' && (
                        <PermissionGate permission="POST_JOURNAL_ENTRY">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePostEntry(entry)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      )}
                      <PermissionGate permission="DELETE_ACCOUNT">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry)}
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

export default JournalEntries;

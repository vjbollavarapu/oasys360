/**
 * Invoice Management Component
 * Manages invoices with full CRUD operations
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
  Send,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  FileText,
  Calendar,
  User,
  DollarSign,
  Clock
} from 'lucide-react';
import { invoicingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    taxRate: z.number().min(0).max(100).default(0),
  })).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
}

interface InvoiceManagementProps {
  className?: string;
}

export function InvoiceManagement({ className = '' }: InvoiceManagementProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: '',
      customerId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      notes: '',
      terms: '',
      items: [
        { description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load invoices
      const invoicesResponse = await invoicingService.getInvoices();
      if (invoicesResponse.success && invoicesResponse.data) {
        setInvoices(invoicesResponse.data);
      }
      
      // Load customers
      const customersResponse = await invoicingService.getCustomers();
      if (customersResponse.success && customersResponse.data) {
        setCustomers(customersResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle invoice creation
  const handleCreateInvoice = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await invoicingService.createInvoice(data);
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create invoice'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceManagement',
        action: 'createInvoice',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle invoice update
  const handleUpdateInvoice = async (data: InvoiceFormData) => {
    if (!selectedInvoice) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await invoicingService.updateInvoice(selectedInvoice.id, data);
      
      if (response.success) {
        await loadData();
        setShowEditDialog(false);
        setSelectedInvoice(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update invoice'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceManagement',
        action: 'updateInvoice',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }
    
    try {
      const response = await invoicingService.deleteInvoice(invoice.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to delete invoice'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceManagement',
        action: 'deleteInvoice',
      });
    }
  };

  // Handle send invoice
  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const response = await invoicingService.sendInvoice(invoice.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to send invoice'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceManagement',
        action: 'sendInvoice',
      });
    }
  };

  // Handle edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setValue('invoiceNumber', invoice.invoiceNumber);
    setValue('customerId', invoice.customer.id);
    setValue('issueDate', invoice.issueDate);
    setValue('dueDate', invoice.dueDate);
    setValue('currency', invoice.currency);
    setValue('notes', invoice.notes || '');
    setValue('terms', invoice.terms || '');
    setValue('items', invoice.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })));
    setShowEditDialog(true);
  };

  // Add new item
  const addItem = () => {
    append({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 });
  };

  // Remove item
  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const items = watch('items') || [];
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * item.taxRate / 100);
    }, 0);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
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

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-muted-foreground">
            Manage your invoices and billing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_INVOICE">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Create a new invoice for your customer
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateInvoice)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                      <Input
                        id="invoiceNumber"
                        {...register('invoiceNumber')}
                        placeholder="e.g., INV-001"
                        className={errors.invoiceNumber ? 'border-destructive' : ''}
                      />
                      {errors.invoiceNumber && (
                        <p className="text-sm text-destructive">{errors.invoiceNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerId">Customer *</Label>
                      <Select onValueChange={(value) => setValue('customerId', value)}>
                        <SelectTrigger className={errors.customerId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.customerId && (
                        <p className="text-sm text-destructive">{errors.customerId.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={watch('currency')} onValueChange={(value) => setValue('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date *</Label>
                      <Input
                        id="issueDate"
                        type="date"
                        {...register('issueDate')}
                        className={errors.issueDate ? 'border-destructive' : ''}
                      />
                      {errors.issueDate && (
                        <p className="text-sm text-destructive">{errors.issueDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        {...register('dueDate')}
                        className={errors.dueDate ? 'border-destructive' : ''}
                      />
                      {errors.dueDate && (
                        <p className="text-sm text-destructive">{errors.dueDate.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Invoice Items</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24">Quantity</TableHead>
                            <TableHead className="w-32">Unit Price</TableHead>
                            <TableHead className="w-24">Tax %</TableHead>
                            <TableHead className="w-32">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Input
                                  {...register(`items.${index}.description`)}
                                  placeholder="Item description"
                                  className={errors.items?.[index]?.description ? 'border-destructive' : ''}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                  className="text-right"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                  className="text-right"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                                  className="text-right"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  (watch(`items.${index}.quantity`) || 0) * (watch(`items.${index}.unitPrice`) || 0)
                                )}
                              </TableCell>
                              <TableCell>
                                {fields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
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
                    
                    <div className="flex items-center justify-end space-x-4 p-4 bg-muted rounded-lg">
                      <div className="text-sm">
                        <strong>Subtotal:</strong> {formatCurrency(subtotal, watch('currency'))}
                      </div>
                      <div className="text-sm">
                        <strong>Tax:</strong> {formatCurrency(taxAmount, watch('currency'))}
                      </div>
                      <div className="text-lg font-bold">
                        <strong>Total:</strong> {formatCurrency(total, watch('currency'))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        placeholder="Additional notes"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        {...register('terms')}
                        placeholder="Payment terms and conditions"
                        rows={3}
                      />
                    </div>
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
                          Create Invoice
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
                  placeholder="Search invoices..."
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
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(invoice.issueDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(invoice.dueDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</div>
                      {invoice.balance > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Balance: {formatCurrency(invoice.balance, invoice.currency)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{invoice.createdBy.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <PermissionGate permission="READ_INVOICE">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="UPDATE_INVOICE">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      {invoice.status === 'draft' && (
                        <PermissionGate permission="SEND_INVOICE">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendInvoice(invoice)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      )}
                      <PermissionGate permission="DELETE_INVOICE">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInvoice(invoice)}
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

export default InvoiceManagement;

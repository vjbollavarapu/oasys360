/**
 * Payment Tracking Component
 * Manages invoice payments and payment history
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
  CreditCard,
  Banknote,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  FileText,
  Calendar,
  User,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Receipt,
  Send
} from 'lucide-react';
import { invoicingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('completed'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Payment {
  id: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    customer: {
      name: string;
      email: string;
    };
    total: number;
    balance: number;
  };
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  balance: number;
  status: string;
  dueDate: string;
}

interface PaymentTrackingProps {
  className?: string;
}

export function PaymentTracking({ className = '' }: PaymentTrackingProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
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
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      notes: '',
      status: 'completed',
    },
  });

  // Payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: TrendingUp },
    { value: 'check', label: 'Check', icon: FileText },
    { value: 'paypal', label: 'PayPal', icon: CreditCard },
    { value: 'stripe', label: 'Stripe', icon: CreditCard },
    { value: 'other', label: 'Other', icon: Receipt },
  ];

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load payments
      const paymentsResponse = await invoicingService.getPayments();
      if (paymentsResponse.success && paymentsResponse.data) {
        setPayments(paymentsResponse.data);
      }
      
      // Load invoices
      const invoicesResponse = await invoicingService.getInvoices();
      if (invoicesResponse.success && invoicesResponse.data) {
        setInvoices(invoicesResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle payment creation
  const handleCreatePayment = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await invoicingService.createPayment(data);
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create payment'));
      }
    } catch (error) {
      handleError(error, {
        component: 'PaymentTracking',
        action: 'createPayment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment update
  const handleUpdatePayment = async (data: PaymentFormData) => {
    if (!selectedPayment) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await invoicingService.updatePayment(selectedPayment.id, data);
      
      if (response.success) {
        await loadData();
        setShowEditDialog(false);
        setSelectedPayment(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update payment'));
      }
    } catch (error) {
      handleError(error, {
        component: 'PaymentTracking',
        action: 'updatePayment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment deletion
  const handleDeletePayment = async (payment: Payment) => {
    if (!confirm(`Are you sure you want to delete this payment?`)) {
      return;
    }
    
    try {
      const response = await invoicingService.deletePayment(payment.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to delete payment'));
      }
    } catch (error) {
      handleError(error, {
        component: 'PaymentTracking',
        action: 'deletePayment',
      });
    }
  };

  // Handle edit payment
  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setValue('invoiceId', payment.invoice.id);
    setValue('amount', payment.amount);
    setValue('paymentDate', payment.paymentDate);
    setValue('paymentMethod', payment.paymentMethod);
    setValue('reference', payment.reference || '');
    setValue('notes', payment.notes || '');
    setValue('status', payment.status);
    setShowEditDialog(true);
  };

  // Handle send payment reminder
  const handleSendReminder = async (invoice: Invoice) => {
    try {
      const response = await invoicingService.sendPaymentReminder(invoice.id);
      
      if (response.success) {
        // Show success message
      } else {
        handleError(new Error(response.message || 'Failed to send payment reminder'));
      }
    } catch (error) {
      handleError(error, {
        component: 'PaymentTracking',
        action: 'sendPaymentReminder',
      });
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    const methodConfig = paymentMethods.find(m => m.value === method);
    return methodConfig?.icon || Receipt;
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

  // Check if invoice is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
          <h2 className="text-2xl font-bold">Payment Tracking</h2>
          <p className="text-muted-foreground">
            Track invoice payments and manage payment history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_PAYMENT">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                  <DialogDescription>
                    Record a payment for an invoice
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreatePayment)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoiceId">Invoice *</Label>
                    <Select onValueChange={(value) => setValue('invoiceId', value)}>
                      <SelectTrigger className={errors.invoiceId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.filter(invoice => invoice.balance > 0).map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {invoice.customer.name} 
                            (Balance: {formatCurrency(invoice.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.invoiceId && (
                      <p className="text-sm text-destructive">{errors.invoiceId.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...register('amount', { valueAsNumber: true })}
                        placeholder="0.00"
                        className={errors.amount ? 'border-destructive' : ''}
                      />
                      {errors.amount && (
                        <p className="text-sm text-destructive">{errors.amount.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Payment Date *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        {...register('paymentDate')}
                        className={errors.paymentDate ? 'border-destructive' : ''}
                      />
                      {errors.paymentDate && (
                        <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                        <SelectTrigger className={errors.paymentMethod ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center space-x-2">
                                <method.icon className="w-4 h-4" />
                                <span>{method.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.paymentMethod && (
                        <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        {...register('reference')}
                        placeholder="Payment reference"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Payment notes"
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
                          Recording...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Record Payment
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
                  placeholder="Search payments..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Payments Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono">{payment.invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.invoice.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{payment.invoice.customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {React.createElement(getPaymentMethodIcon(payment.paymentMethod), { className: "w-4 h-4" })}
                          <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(payment.paymentDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.reference ? (
                          <span className="text-sm font-mono">{payment.reference}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <PermissionGate permission="UPDATE_PAYMENT">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPayment(payment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate permission="DELETE_PAYMENT">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePayment(payment)}
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
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-6">
          {/* Outstanding Invoices */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.filter(invoice => invoice.balance > 0).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-red-600">
                          {formatCurrency(invoice.balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className={isOverdue(invoice.dueDate) ? 'text-red-600' : ''}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isOverdue(invoice.dueDate) ? 'destructive' : 'secondary'}>
                          {isOverdue(invoice.dueDate) ? 'Overdue' : 'Outstanding'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <PermissionGate permission="SEND_INVOICE">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendReminder(invoice)}
                            >
                              <Send className="w-4 h-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PaymentTracking;

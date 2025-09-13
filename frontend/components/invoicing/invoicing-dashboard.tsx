/**
 * Invoicing Dashboard Component
 * Overview of invoicing activities and key metrics
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  CreditCard,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Plus,
  Send,
  Receipt,
  Users,
  Target
} from 'lucide-react';
import { invoicingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

interface InvoicingDashboardProps {
  className?: string;
}

export function InvoicingDashboard({ className = '' }: InvoicingDashboardProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load various invoicing data
      const [
        invoicesResponse,
        paymentsResponse,
        customersResponse,
        recentActivityResponse
      ] = await Promise.all([
        invoicingService.getInvoices(),
        invoicingService.getPayments(),
        invoicingService.getCustomers(),
        invoicingService.getRecentActivity({ limit: 5 }),
      ]);
      
      if (invoicesResponse.success && paymentsResponse.success && customersResponse.success) {
        setDashboardData({
          invoices: invoicesResponse.data,
          payments: paymentsResponse.data,
          customers: customersResponse.data,
          recentActivity: recentActivityResponse.success ? recentActivityResponse.data : [],
        });
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  // Calculate metrics
  const calculateMetrics = () => {
    if (!dashboardData) return {};
    
    const invoices = dashboardData.invoices || [];
    const payments = dashboardData.payments || [];
    
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum: number, invoice: any) => sum + invoice.total, 0);
    const totalPaid = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    const totalOutstanding = invoices.reduce((sum: number, invoice: any) => sum + invoice.balance, 0);
    
    const overdueInvoices = invoices.filter((invoice: any) => {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today && invoice.balance > 0;
    });
    
    const paidInvoices = invoices.filter((invoice: any) => invoice.status === 'paid');
    const draftInvoices = invoices.filter((invoice: any) => invoice.status === 'draft');
    const sentInvoices = invoices.filter((invoice: any) => invoice.status === 'sent');
    
    return {
      totalInvoices,
      totalRevenue,
      totalPaid,
      totalOutstanding,
      overdueInvoices: overdueInvoices.length,
      paidInvoices: paidInvoices.length,
      draftInvoices: draftInvoices.length,
      sentInvoices: sentInvoices.length,
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

  if (!dashboardData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load dashboard data
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Invoicing Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your invoicing activities
          </p>
        </div>
        <Button variant="outline" onClick={loadDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Received payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              Unpaid invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Invoice Status
                </CardTitle>
                <CardDescription>
                  Distribution of invoices by status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Paid</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.paidInvoices}</span>
                    <span className="text-xs text-muted-foreground">
                      ({metrics.totalInvoices > 0 ? ((metrics.paidInvoices / metrics.totalInvoices) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Sent</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.sentInvoices}</span>
                    <span className="text-xs text-muted-foreground">
                      ({metrics.totalInvoices > 0 ? ((metrics.sentInvoices / metrics.totalInvoices) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.draftInvoices}</span>
                    <span className="text-xs text-muted-foreground">
                      ({metrics.totalInvoices > 0 ? ((metrics.draftInvoices / metrics.totalInvoices) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.overdueInvoices}</span>
                    <span className="text-xs text-muted-foreground">
                      ({metrics.totalInvoices > 0 ? ((metrics.overdueInvoices / metrics.totalInvoices) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Distribution of payments by method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['credit_card', 'bank_transfer', 'cash', 'check', 'paypal'].map((method) => {
                    const count = dashboardData.payments?.filter((payment: any) => payment.paymentMethod === method).length || 0;
                    const percentage = dashboardData.payments?.length > 0 ? (count / dashboardData.payments.length) * 100 : 0;
                    
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="capitalize text-sm">{method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Latest invoices created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.invoices?.slice(0, 10).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm">{invoice.invoiceNumber}</div>
                      <div>
                        <div className="font-medium">{invoice.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(invoice.issueDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-mono">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.invoices?.length > 10 && (
                  <div className="text-center text-muted-foreground">
                    And {dashboardData.invoices.length - 10} more invoices...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Latest payments received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.payments?.slice(0, 10).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm">{payment.invoice.invoiceNumber}</div>
                      <div>
                        <div className="font-medium">{payment.invoice.customer.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(payment.paymentDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
                      </Badge>
                      <span className="text-sm font-mono text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.payments?.length > 10 && (
                  <div className="text-center text-muted-foreground">
                    And {dashboardData.payments.length - 10} more payments...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest invoicing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(activity.createdAt)}</span>
                        <span>by {activity.user?.name || 'System'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {dashboardData.recentActivity?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InvoicingDashboard;

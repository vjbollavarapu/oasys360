/**
 * Root Dashboard Component
 * Comprehensive overview dashboard showing metrics from all modules
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  FileText, 
  Building2, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  Wallet,
  ShoppingCart,
  Receipt,
  Package,
  Users,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { accountingService, bankingService, invoicingService, salesService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface DashboardMetrics {
  accounting: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    accountCount: number;
    pendingReconciliations: number;
  };
  banking: {
    totalBalance: number;
    accountCount: number;
    pendingTransactions: number;
    lastSyncDate: string | null;
  };
  invoicing: {
    totalInvoices: number;
    unpaidInvoices: number;
    totalOutstanding: number;
    thisMonthRevenue: number;
  };
  sales: {
    totalCustomers: number;
    activeOrders: number;
    totalRevenue: number;
    conversionRate: number;
  };
}

interface RootDashboardProps {
  className?: string;
}

export function RootDashboard({ className }: RootDashboardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load metrics from all modules in parallel
      const [accountsData, bankAccountsData, invoicesData, customersData] = await Promise.allSettled([
        accountingService.getChartOfAccounts().catch(() => ({ results: [], count: 0 })),
        bankingService.getBankAccounts().catch(() => ({ results: [], count: 0 })),
        invoicingService.getInvoices().catch(() => ({ results: [] })),
        (invoicingService.getCustomers ? invoicingService.getCustomers().catch(() => ({ results: [], count: 0 })) : Promise.resolve({ results: [], count: 0 })),
      ]);

      // Extract data with fallbacks
      const accounts = accountsData.status === 'fulfilled' ? (accountsData.value.results || accountsData.value || []) : [];
      const bankAccounts = bankAccountsData.status === 'fulfilled' ? (bankAccountsData.value.results || bankAccountsData.value || []) : [];
      const invoices = invoicesData.status === 'fulfilled' 
        ? (Array.isArray(invoicesData.value.results) ? invoicesData.value.results : (Array.isArray(invoicesData.value) ? invoicesData.value : []))
        : [];
      const customers = customersData.status === 'fulfilled' ? (customersData.value.results || customersData.value || []) : [];

      // Calculate metrics
      const totalRevenue = invoices
        .filter((inv: any) => inv.status === 'paid' || inv.status === 'posted')
        .reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount || inv.total || 0)), 0);

      const unpaidInvoices = invoices.filter((inv: any) => 
        inv.status === 'draft' || inv.status === 'sent' || inv.status === 'pending'
      );
      const totalOutstanding = unpaidInvoices.reduce((sum: number, inv: any) => 
        sum + (parseFloat(inv.total_amount || inv.total || 0)), 0);

      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const thisMonthRevenue = invoices
        .filter((inv: any) => {
          const invDate = new Date(inv.invoice_date || inv.issueDate || inv.created_at);
          return invDate.getMonth() === thisMonth && 
                 invDate.getFullYear() === thisYear &&
                 (inv.status === 'paid' || inv.status === 'posted');
        })
        .reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount || inv.total || 0)), 0);

      const totalBalance = bankAccounts.reduce((sum: number, acc: any) => 
        sum + (parseFloat(acc.current_balance || acc.balance || 0)), 0);

      setMetrics({
        accounting: {
          totalRevenue,
          totalExpenses: 0, // TODO: Calculate from expenses/journals
          netIncome: totalRevenue,
          accountCount: accounts.length || 0,
          pendingReconciliations: 0, // TODO: Get from banking reconciliation
        },
        banking: {
          totalBalance,
          accountCount: bankAccounts.length || 0,
          pendingTransactions: 0, // TODO: Get from transactions
          lastSyncDate: null, // TODO: Get from integrations
        },
        invoicing: {
          totalInvoices: invoices.length || 0,
          unpaidInvoices: unpaidInvoices.length || 0,
          totalOutstanding,
          thisMonthRevenue,
        },
        sales: {
          totalCustomers: customers.length || 0,
          activeOrders: 0, // TODO: Get from sales orders
          totalRevenue,
          conversionRate: 0, // TODO: Calculate from sales data
        },
      });
    } catch (error) {
      handleError(error, 'Failed to load dashboard data');
      // Set default metrics on error
      setMetrics({
        accounting: { totalRevenue: 0, totalExpenses: 0, netIncome: 0, accountCount: 0, pendingReconciliations: 0 },
        banking: { totalBalance: 0, accountCount: 0, pendingTransactions: 0, lastSyncDate: null },
        invoicing: { totalInvoices: 0, unpaidInvoices: 0, totalOutstanding: 0, thisMonthRevenue: 0 },
        sales: { totalCustomers: 0, activeOrders: 0, totalRevenue: 0, conversionRate: 0 },
      });
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen
  }

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.name || user.email}! Here's your business overview.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="lg" className="rounded-full" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">
              ${metrics?.accounting.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </div>
        </Card>

        {/* Bank Balance */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics?.banking.accountCount || 0} accounts
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Bank Balance</p>
            <p className="text-2xl font-bold">
              ${metrics?.banking.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total across all accounts</p>
          </div>
        </Card>

        {/* Outstanding Invoices */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950">
              {metrics?.invoicing.unpaidInvoices || 0} unpaid
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding</p>
            <p className="text-2xl font-bold">
              ${metrics?.invoicing.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Invoices pending payment</p>
          </div>
        </Card>

        {/* This Month Revenue */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold">
              ${metrics?.invoicing.thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Revenue this month</p>
          </div>
        </Card>
      </div>

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Accounting Module */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/accounting')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Accounting</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>Financial management & reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{metrics?.accounting.accountCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Income</span>
                <span className="font-medium text-green-600">
                  ${metrics?.accounting.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Module */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/banking')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Banking</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>Bank accounts & transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-medium">{metrics?.banking.accountCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">
                  ${metrics?.banking.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoicing Module */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/invoicing')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg">Invoicing</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>Invoice & payment management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Invoices</span>
                <span className="font-medium">{metrics?.invoicing.totalInvoices || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unpaid</span>
                <span className="font-medium text-orange-600">{metrics?.invoicing.unpaidInvoices || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Module */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/sales')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Sales</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>Customers & sales orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customers</span>
                <span className="font-medium">{metrics?.sales.totalCustomers || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Orders</span>
                <span className="font-medium">{metrics?.sales.activeOrders || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Module */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/inventory')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-lg">Inventory</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>Stock & inventory management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Web3 Module */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/web3')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-lg">Web3</CardTitle>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardDescription>Blockchain & crypto assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="rounded-full h-auto py-4 flex-col" onClick={() => router.push('/invoicing/create')}>
              <Plus className="w-5 h-5 mb-2" />
              <span className="text-xs">New Invoice</span>
            </Button>
            <Button variant="outline" className="rounded-full h-auto py-4 flex-col" onClick={() => router.push('/accounting/journal-entries')}>
              <Receipt className="w-5 h-5 mb-2" />
              <span className="text-xs">Journal Entry</span>
            </Button>
            <Button variant="outline" className="rounded-full h-auto py-4 flex-col" onClick={() => router.push('/banking/accounts')}>
              <CreditCard className="w-5 h-5 mb-2" />
              <span className="text-xs">Bank Account</span>
            </Button>
            <Button variant="outline" className="rounded-full h-auto py-4 flex-col" onClick={() => router.push('/sales/customers')}>
              <Users className="w-5 h-5 mb-2" />
              <span className="text-xs">New Customer</span>
            </Button>
            <Button variant="outline" className="rounded-full h-auto py-4 flex-col" onClick={() => router.push('/reports')}>
              <BarChart3 className="w-5 h-5 mb-2" />
              <span className="text-xs">Reports</span>
            </Button>
            <Button variant="outline" className="rounded-full h-auto py-4 flex-col" onClick={() => router.push('/documents')}>
              <FileCheck className="w-5 h-5 mb-2" />
              <span className="text-xs">Documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


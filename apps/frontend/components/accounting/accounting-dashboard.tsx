/**
 * Accounting Dashboard Component
 * Overview of accounting activities and key metrics
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
  Calculator,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { accountingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

interface AccountingDashboardProps {
  className?: string;
}

export function AccountingDashboard({ className = '' }: AccountingDashboardProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load various accounting data
      const [
        accountsResponse,
        journalEntriesResponse,
        trialBalanceResponse,
      ] = await Promise.all([
        accountingService.getAccounts({ limit: 100 }),
        accountingService.getJournalEntries({ limit: 10 }),
        accountingService.getTrialBalance({
          date: new Date().toISOString().split('T')[0],
        }),
      ]);
      
      if (accountsResponse.success && journalEntriesResponse.success && trialBalanceResponse.success) {
        setDashboardData({
          accounts: accountsResponse.data?.results || accountsResponse.data || [],
          journalEntries: journalEntriesResponse.data?.results || journalEntriesResponse.data || [],
          trialBalance: trialBalanceResponse.data || [],
          recentActivity: journalEntriesResponse.data?.results?.slice(0, 5) || [],
        });
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  // Get account type color
  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      liability: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      equity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      revenue: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

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

  // Mock data fallback for development/demo
  const mockDashboardData = {
    accounts: [
      { id: '1', code: '1000', name: 'Cash and Cash Equivalents', accountType: 'asset', balance: 75000 },
      { id: '2', code: '1100', name: 'Accounts Receivable', accountType: 'asset', balance: 45000 },
      { id: '3', code: '1200', name: 'Inventory', accountType: 'asset', balance: 125000 },
      { id: '4', code: '2000', name: 'Accounts Payable', accountType: 'liability', balance: 32000 },
      { id: '5', code: '4000', name: 'Sales Revenue', accountType: 'revenue', balance: 250000 },
      { id: '6', code: '5000', name: 'Cost of Goods Sold', accountType: 'expense', balance: 125000 },
    ],
    journalEntries: [
      { id: '1', reference: 'JE-2024-001', description: 'Monthly closing entry', date: new Date().toISOString(), status: 'posted', totalDebit: 125000, totalCredit: 125000 },
      { id: '2', reference: 'JE-2024-002', description: 'Depreciation expense', date: new Date(Date.now() - 86400000).toISOString(), status: 'posted', totalDebit: 5000, totalCredit: 5000 },
      { id: '3', reference: 'JE-2024-003', description: 'Accrued expenses', date: new Date(Date.now() - 172800000).toISOString(), status: 'posted', totalDebit: 8000, totalCredit: 8000 },
    ],
    trialBalance: {
      totalDebits: 285000,
      totalCredits: 285000,
      difference: 0,
    },
    recentActivity: [
      { id: '1', description: 'Journal entry JE-2024-001 posted', createdAt: new Date().toISOString(), user: { name: 'System' } },
      { id: '2', description: 'Account 1000 balance updated', createdAt: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Admin' } },
    ],
  };

  // Use mock data if loading fails or returns empty
  const displayData = dashboardData && dashboardData.accounts?.length > 0 ? dashboardData : mockDashboardData;

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
          <h2 className="text-2xl font-bold">Accounting Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your accounting activities
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
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.accounts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.journalEntries?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(displayData.trialBalance?.totalDebits || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(displayData.trialBalance?.totalCredits || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trial Balance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Trial Balance Summary
                </CardTitle>
                <CardDescription>
                  Current period trial balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Debits</span>
                  <span className="text-sm font-mono text-green-600">
                    {formatCurrency(displayData.trialBalance?.totalDebits || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Credits</span>
                  <span className="text-sm font-mono text-blue-600">
                    {formatCurrency(displayData.trialBalance?.totalCredits || 0)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Difference</span>
                    <span className={`text-sm font-mono ${(displayData.trialBalance?.difference || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(displayData.trialBalance?.difference || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {(displayData.trialBalance?.difference || 0) === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Account Types
                </CardTitle>
                <CardDescription>
                  Distribution of accounts by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => {
                    const count = displayData.accounts?.filter((account: any) => account.accountType === type).length || 0;
                    const percentage = displayData.accounts?.length > 0 ? (count / displayData.accounts.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getAccountTypeColor(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Badge>
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

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>
                Your chart of accounts overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData.accounts?.slice(0, 10).map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm">{account.code}</div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getAccountTypeColor(account.accountType)}>
                        {account.accountType}
                      </Badge>
                      <span className="text-sm font-mono">
                        {formatCurrency(account.balance || 0)}
                      </span>
                    </div>
                  </div>
                ))}
                {displayData.accounts?.length > 10 && (
                  <div className="text-center text-muted-foreground">
                    And {displayData.accounts.length - 10} more accounts...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>
                Latest journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData.journalEntries?.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm">{entry.reference}</div>
                      <div>
                        <div className="font-medium">{entry.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(entry.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-mono">
                        {formatCurrency(entry.totalDebit || 0)}
                      </span>
                    </div>
                  </div>
                ))}
                {displayData.journalEntries?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No journal entries found
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
                Latest accounting activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData.recentActivity?.map((activity: any, index: number) => (
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
                {displayData.recentActivity?.length === 0 && (
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

export default AccountingDashboard;

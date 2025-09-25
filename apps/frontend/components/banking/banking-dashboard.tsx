/**
 * Banking Dashboard Component
 * Overview of banking activities and key metrics
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
  Building2, 
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
  Link,
  Unlink,
  Activity,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import { bankingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

interface BankingDashboardProps {
  className?: string;
}

export function BankingDashboard({ className = '' }: BankingDashboardProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load various banking data
      const [
        connectionsResponse,
        transactionsResponse,
        reconciliationsResponse,
        recentActivityResponse
      ] = await Promise.all([
        bankingService.getBankConnections(),
        bankingService.getTransactions({ limit: 10 }),
        bankingService.getReconciliations({ limit: 5 }),
        bankingService.getRecentActivity({ limit: 5 }),
      ]);
      
      if (connectionsResponse.success && transactionsResponse.success && reconciliationsResponse.success) {
        setDashboardData({
          connections: connectionsResponse.data,
          transactions: transactionsResponse.data,
          reconciliations: reconciliationsResponse.data,
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
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'debit':
        return TrendingDown;
      case 'credit':
        return TrendingUp;
      default:
        return Activity;
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    if (!dashboardData) return {};
    
    const connections = dashboardData.connections || [];
    const transactions = dashboardData.transactions || [];
    const reconciliations = dashboardData.reconciliations || [];
    
    const totalConnections = connections.length;
    const connectedAccounts = connections.filter((conn: any) => conn.status === 'connected').length;
    const totalBalance = connections.reduce((sum: number, conn: any) => sum + conn.balance, 0);
    
    const totalTransactions = transactions.length;
    const totalDebits = transactions.filter((t: any) => t.type === 'debit').reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalCredits = transactions.filter((t: any) => t.type === 'credit').reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const pendingReconciliations = reconciliations.filter((r: any) => r.status === 'in_progress').length;
    const completedReconciliations = reconciliations.filter((r: any) => r.status === 'completed').length;
    
    return {
      totalConnections,
      connectedAccounts,
      totalBalance,
      totalTransactions,
      totalDebits,
      totalCredits,
      pendingReconciliations,
      completedReconciliations,
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
          <h2 className="text-2xl font-bold">Banking Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your banking activities
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
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.connectedAccounts}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.totalConnections} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reconciliations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pendingReconciliations}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reconciliations">Reconciliations</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Account Status
                </CardTitle>
                <CardDescription>
                  Status of your bank connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.connectedAccounts}</span>
                    <span className="text-xs text-muted-foreground">
                      ({metrics.totalConnections > 0 ? ((metrics.connectedAccounts / metrics.totalConnections) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Disconnected</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.totalConnections - metrics.connectedAccounts}</span>
                    <span className="text-xs text-muted-foreground">
                      ({metrics.totalConnections > 0 ? (((metrics.totalConnections - metrics.connectedAccounts) / metrics.totalConnections) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Transaction Summary
                </CardTitle>
                <CardDescription>
                  Recent transaction activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Credits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(metrics.totalCredits)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Debits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(metrics.totalDebits)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Net Flow</span>
                    <span className={`text-sm font-medium ${metrics.totalCredits - metrics.totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.totalCredits - metrics.totalDebits)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>
                Your connected bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.connections?.map((connection: any) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{connection.bankName}</div>
                        <div className="text-sm text-muted-foreground">
                          {connection.accountType.charAt(0).toUpperCase() + connection.accountType.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(connection.status)}>
                        {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-mono">
                        {formatCurrency(connection.balance, connection.currency)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.connections?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No bank accounts connected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest banking transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.transactions?.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {React.createElement(getTransactionTypeIcon(transaction.type), { className: "w-4 h-4 text-muted-foreground" })}
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(transaction.date)}</span>
                          <span>•</span>
                          <span>{transaction.account.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {transaction.category}
                      </Badge>
                      <span className={`text-sm font-mono ${transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.transactions?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reconciliations</CardTitle>
              <CardDescription>
                Latest bank reconciliation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.reconciliations?.map((reconciliation: any) => (
                  <div key={reconciliation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{reconciliation.account.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(reconciliation.statementDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(reconciliation.status)}>
                        {reconciliation.status.charAt(0).toUpperCase() + reconciliation.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-mono">
                        {formatCurrency(reconciliation.statementBalance)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.reconciliations?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No reconciliations found
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
                Latest banking activities
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

export default BankingDashboard;

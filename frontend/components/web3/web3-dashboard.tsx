/**
 * Web3 Dashboard Component
 * Comprehensive overview of Web3 activities and metrics
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Send, 
  ArrowUpDown, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Network,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Clock,
  Hash,
  Gas,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { web3Service } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

interface Web3Metrics {
  totalWallets: number;
  connectedWallets: number;
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  averageGasPrice: number;
  networkDistribution: {
    network: string;
    count: number;
    volume: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }[];
  portfolioValue: {
    currency: string;
    amount: number;
    value: number;
    change24h: number;
  }[];
  gasTrends: {
    date: string;
    gasPrice: number;
    gasUsed: number;
  }[];
}

interface Web3DashboardProps {
  className?: string;
}

export function Web3Dashboard({ className = '' }: Web3DashboardProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [metrics, setMetrics] = useState<Web3Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load metrics
  const loadMetrics = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await web3Service.getDashboardMetrics();
      
      if (response.success && response.data) {
        setMetrics(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get change color
  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
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
          <h2 className="text-2xl font-bold">Web3 Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive overview of your Web3 activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="EXPORT_WEB3_DATA">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Wallets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.connectedWallets || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {metrics?.totalWallets || 0} total wallets
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalTransactions.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.totalVolume || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all networks
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                <Gas className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.totalFees || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Gas fees paid
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Network Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Network Distribution
                </CardTitle>
                <CardDescription>
                  Transaction volume by network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.networkDistribution.map((network, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium">{network.network}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{network.count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatCurrency(network.volume)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest Web3 activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                          <span className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common Web3 operations
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PermissionGate permission="CONNECT_WALLET">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Wallet className="w-6 h-6" />
                    <span className="text-sm">Connect Wallet</span>
                  </div>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="SEND_TRANSACTION">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Send className="w-6 h-6" />
                    <span className="text-sm">Send Transaction</span>
                  </div>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="CREATE_LEDGER_ENTRY">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <BookOpen className="w-6 h-6" />
                    <span className="text-sm">Create Ledger Entry</span>
                  </div>
                </Button>
              </PermissionGate>
              
              <PermissionGate permission="VIEW_WEB3_ANALYTICS">
                <Button variant="outline" className="h-auto p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">View Analytics</span>
                  </div>
                </Button>
              </PermissionGate>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.portfolioValue.reduce((sum, asset) => sum + asset.value, 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  24h change
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assets</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.portfolioValue.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Different currencies
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(metrics?.portfolioValue.reduce((sum, asset) => sum + asset.change24h, 0) / (metrics?.portfolioValue.length || 1) || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average change
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Portfolio Assets
              </CardTitle>
              <CardDescription>
                Your cryptocurrency holdings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {metrics?.portfolioValue.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{asset.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          {asset.amount.toFixed(4)} {asset.currency}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(asset.value)}</div>
                      <div className={`text-sm ${getChangeColor(asset.change24h)}`}>
                        {formatPercentage(asset.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +3 from yesterday
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gas Spent Today</CardTitle>
                <Gas className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(0.0234, 'ETH')}</div>
                <p className="text-xs text-muted-foreground">
                  Average: 0.0019 ETH
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Networks</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Ethereum, Polygon, Arbitrum
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Recent Web3 activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {activity.type === 'transaction' && <Send className="w-4 h-4" />}
                      {activity.type === 'wallet' && <Wallet className="w-4 h-4" />}
                      {activity.type === 'ledger' && <BookOpen className="w-4 h-4" />}
                      {activity.type === 'network' && <Network className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Transaction Trends
                </CardTitle>
                <CardDescription>
                  Transaction volume over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Transaction trends chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Network Distribution
                </CardTitle>
                <CardDescription>
                  Usage across different networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Network distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gas Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gas className="w-5 h-5" />
                Gas Analytics
              </CardTitle>
              <CardDescription>
                Gas usage and pricing trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(metrics?.totalFees || 0, 'ETH')}</div>
                  <div className="text-sm text-muted-foreground">Total Gas Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.averageGasPrice || 0} Gwei</div>
                  <div className="text-sm text-muted-foreground">Average Gas Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {metrics?.gasTrends.reduce((sum, trend) => sum + trend.gasUsed, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Gas Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Web3 system performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2.3s</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">15ms</div>
                  <div className="text-sm text-muted-foreground">Block Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Web3Dashboard;

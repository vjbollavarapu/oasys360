/**
 * Tax Optimization Dashboard Component
 * Overview of tax events, strategies, alerts, and year-end summaries
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Target,
  Zap,
  RefreshCw,
  Eye,
  FileText,
  BarChart3,
  PieChart,
  Bell,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { taxOptimizationService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

interface TaxDashboardProps {
  className?: string;
}

export function TaxDashboard({ className = '' }: TaxDashboardProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaxYear, setSelectedTaxYear] = useState(new Date().getFullYear());

  // Load dashboard data
  const loadDashboardData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      const [
        statsResponse,
        eventsResponse,
        strategiesResponse,
        alertsResponse,
        yearSummaryResponse
      ] = await Promise.all([
        taxOptimizationService.getTaxStats(),
        taxOptimizationService.getTaxEvents({ limit: 10, taxYear: selectedTaxYear }),
        taxOptimizationService.getTaxStrategies({ limit: 5, taxYear: selectedTaxYear }),
        taxOptimizationService.getTaxAlerts({ limit: 5, isRead: false }),
        taxOptimizationService.getYearSummaries(),
      ]);
      
      if (statsResponse.success) {
        setDashboardData({
          stats: statsResponse.data,
          events: eventsResponse.success ? eventsResponse.data : [],
          strategies: strategiesResponse.success ? strategiesResponse.data : [],
          alerts: alertsResponse.success ? alertsResponse.data : [],
          yearSummaries: yearSummaryResponse.success ? yearSummaryResponse.data : [],
        });
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedTaxYear]);

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

  // Get event type color
  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      profit: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      loss: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      capital_gain: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      capital_loss: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      crypto_gain: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      crypto_loss: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  // Get strategy priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              Failed to load tax optimization data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = dashboardData.stats || {};

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Optimization</h1>
          <p className="text-muted-foreground">
            Manage tax events, strategies, and year-end planning
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => loadDashboardData()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission={PERMISSIONS.TAX_OPTIMIZATION.CREATE}>
            <Button className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              New Strategy
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_events || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedTaxYear} tax year
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Savings</CardTitle>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.potential_savings || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From active strategies
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Strategies</CardTitle>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.active_strategies || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Approved strategies
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread Alerts</CardTitle>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.unread_alerts || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Tax Events</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="year-summary">Year Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Tax Events */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Tax Events
                </CardTitle>
                <CardDescription>
                  Latest tax events for {selectedTaxYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.events?.results?.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Badge className={`rounded-full ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{event.description || 'Tax Event'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.event_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${event.event_type.includes('loss') ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(event.amount)}
                        </p>
                        {event.realized && (
                          <Badge variant="outline" className="rounded-full text-xs">Realized</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!dashboardData.events?.results || dashboardData.events.results.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No tax events found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Strategies */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Strategies
                </CardTitle>
                <CardDescription>
                  Current tax optimization strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.strategies?.results?.slice(0, 5).map((strategy: any) => (
                    <div key={strategy.id} className="p-4 border rounded-2xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(strategy.priority)} className="rounded-full">
                            {strategy.priority}
                          </Badge>
                          <h4 className="text-sm font-medium">{strategy.title}</h4>
                        </div>
                        {strategy.potential_savings && (
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(strategy.potential_savings)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {strategy.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="rounded-full">{strategy.strategy_type.replace('_', ' ')}</Badge>
                        {strategy.status === 'approved' && (
                          <Badge variant="default" className="rounded-full">Approved</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!dashboardData.strategies?.results || dashboardData.strategies.results.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No active strategies
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax Alerts */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Tax optimization alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.alerts?.results?.map((alert: any) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">{alert.alert_type}</Badge>
                      </TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(alert.priority)} className="rounded-full">
                          {alert.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(alert.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={() => taxOptimizationService.markAlertAsRead(alert.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={() => taxOptimizationService.dismissAlert(alert.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!dashboardData.alerts?.results || dashboardData.alerts.results.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No alerts
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Tax Events</CardTitle>
              <CardDescription>
                All tax events for {selectedTaxYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Realized</TableHead>
                    <TableHead>Offset Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.events?.results?.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>{formatDate(event.event_date)}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.source_type}</TableCell>
                      <TableCell className={event.event_type.includes('loss') ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(event.amount)}
                      </TableCell>
                      <TableCell>
                        {event.realized ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        {event.offset_applied ? (
                          <span className="text-sm">{formatCurrency(event.offset_amount)}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Tax Optimization Strategies</CardTitle>
              <CardDescription>
                Approved and pending tax optimization strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.strategies?.results?.map((strategy: any) => (
                  <Card key={strategy.id} className="rounded-2xl shadow-soft dark:shadow-soft-dark border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {strategy.title}
                            <Badge variant={getPriorityColor(strategy.priority)} className="rounded-full">
                              {strategy.priority}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{strategy.strategy_type.replace('_', ' ')}</CardDescription>
                        </div>
                        {strategy.potential_savings && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(strategy.potential_savings)}
                            </p>
                            <p className="text-xs text-muted-foreground">Potential Savings</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{strategy.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={strategy.status === 'approved' ? 'default' : 'secondary'} className="rounded-full">
                          {strategy.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {strategy.status === 'pending' && (
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={() => taxOptimizationService.approveTaxStrategy(strategy.id)}
                            >
                              Approve
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Tax Alerts</CardTitle>
              <CardDescription>
                All tax optimization alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.alerts?.results?.map((alert: any) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">{alert.alert_type}</Badge>
                      </TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(alert.priority)} className="rounded-full">
                          {alert.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(alert.created_at)}</TableCell>
                      <TableCell>
                        {alert.is_read ? (
                          <Badge variant="secondary" className="rounded-full">Read</Badge>
                        ) : (
                          <Badge variant="default" className="rounded-full">Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full"
                              onClick={async () => {
                                await taxOptimizationService.markAlertAsRead(alert.id);
                                loadDashboardData();
                              }}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            onClick={async () => {
                              await taxOptimizationService.dismissAlert(alert.id);
                              loadDashboardData();
                            }}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year-summary">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Tax Year Summaries</CardTitle>
              <CardDescription>
                Year-end tax summaries and calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.yearSummaries?.results?.map((summary: any) => (
                  <Card key={summary.id} className="rounded-2xl shadow-soft dark:shadow-soft-dark border">
                    <CardHeader>
                      <CardTitle>Tax Year {summary.tax_year}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Income</p>
                          <p className="text-lg font-bold">{formatCurrency(summary.total_income || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Deductions</p>
                          <p className="text-lg font-bold">{formatCurrency(summary.total_deductions || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Taxable Income</p>
                          <p className="text-lg font-bold">{formatCurrency(summary.taxable_income || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Tax</p>
                          <p className="text-lg font-bold">{formatCurrency(summary.estimated_tax || 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


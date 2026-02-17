/**
 * Sales Dashboard Component
 * Comprehensive sales overview with customers, orders, quotes, and analytics
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { invoicingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface SalesMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  totalQuotes: number;
  openQuotes: number;
}

interface RecentCustomer {
  id: string;
  name: string;
  email: string;
  status: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: string;
  total: number;
}

interface SalesDashboardProps {
  className?: string;
}

export function SalesDashboard({ className }: SalesDashboardProps) {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [customers, setCustomers] = useState<RecentCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load customers from sales API
      const customersResponse = await invoicingService.getCustomers({ limit: 10 }).catch(() => ({ 
        results: [], 
        count: 0 
      }));
      
      const customersData = customersResponse.results || customersResponse || [];
      
      // Calculate metrics from customers
      const totalCustomers = customersData.length;
      const activeCustomers = customersData.filter((c: any) => 
        c.status === 'active' || c.is_active !== false
      ).length;

      // Calculate revenue from customer data (if available)
      // Note: Orders/quotes would come from separate API calls
      const totalRevenue = customersData.reduce((sum: number, customer: any) => {
        return sum + (parseFloat(customer.total_revenue || customer.totalRevenue || 0));
      }, 0);

      // Prepare recent customers list
      const recentCustomers: RecentCustomer[] = customersData.slice(0, 5).map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        status: customer.status || (customer.is_active !== false ? 'active' : 'inactive'),
        totalOrders: customer.total_orders || customer.totalOrders || 0,
        totalRevenue: parseFloat(customer.total_revenue || customer.totalRevenue || 0),
        lastOrderDate: customer.last_order_date || customer.lastOrderDate || 'N/A',
      }));

      setMetrics({
        totalCustomers,
        activeCustomers,
        totalOrders: 0, // TODO: Load from orders API
        pendingOrders: 0, // TODO: Load from orders API
        totalRevenue,
        thisMonthRevenue: 0, // TODO: Calculate from orders
        averageOrderValue: totalRevenue > 0 && activeCustomers > 0 ? totalRevenue / activeCustomers : 0,
        conversionRate: 0, // TODO: Calculate from quotes/orders
        totalQuotes: 0, // TODO: Load from quotes API
        openQuotes: 0, // TODO: Load from quotes API
      });

      setCustomers(recentCustomers);
    } catch (error) {
      handleError(error, 'Failed to load sales data');
      // Set default metrics on error
      setMetrics({
        totalCustomers: 0,
        activeCustomers: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        totalQuotes: 0,
        openQuotes: 0,
      });
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Overview</h2>
          <p className="text-muted-foreground mt-1">
            Monitor your sales performance and customer activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-xs">
            Updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="lg" className="rounded-full" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
              ${metrics?.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics?.activeCustomers || 0} active
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Customers</p>
            <p className="text-2xl font-bold">{metrics?.totalCustomers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Customer base</p>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950">
              {metrics?.pendingOrders || 0} pending
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
            <p className="text-2xl font-bold">{metrics?.totalOrders || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Sales orders</p>
          </div>
        </Card>

        {/* Average Order Value */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Activity className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold">
              ${metrics?.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per customer</p>
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Customers</CardTitle>
                <CardDescription>Latest customer activity</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full"
                onClick={() => router.push('/sales/customers')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No customers found</p>
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full"
                  onClick={() => router.push('/sales/customers')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div 
                    key={customer.id}
                    className="flex items-center justify-between p-4 rounded-2xl border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sales/customers/${customer.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${customer.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                      </div>
                      <Badge 
                        variant={customer.status === 'active' ? 'default' : 'outline'}
                        className="rounded-full"
                      >
                        {customer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common sales tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col rounded-2xl"
                onClick={() => router.push('/sales/customers')}
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="font-medium">Customers</span>
                <span className="text-xs text-muted-foreground mt-1">Manage customers</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col rounded-2xl"
                onClick={() => router.push('/sales/orders')}
              >
                <ShoppingCart className="w-6 h-6 mb-2" />
                <span className="font-medium">Orders</span>
                <span className="text-xs text-muted-foreground mt-1">View orders</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col rounded-2xl"
                onClick={() => router.push('/sales/quotes')}
              >
                <FileText className="w-6 h-6 mb-2" />
                <span className="font-medium">Quotes</span>
                <span className="text-xs text-muted-foreground mt-1">Manage quotes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col rounded-2xl"
                onClick={() => router.push('/sales/analytics')}
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="font-medium">Analytics</span>
                <span className="text-xs text-muted-foreground mt-1">View reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


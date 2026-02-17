/**
 * Coinbase Prime Dashboard
 * Institutional trading and account management
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, 
  DollarSign, 
  RefreshCw,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { coinbasePrimeService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface CoinbasePrimeDashboardProps {
  className?: string;
}

export function CoinbasePrimeDashboard({ className = '' }: CoinbasePrimeDashboardProps) {
  const { withErrorHandling } = useErrorHandler();
  const [connections, setConnections] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const [connectionsResponse, accountsResponse, ordersResponse] = await Promise.all([
        coinbasePrimeService.getConnections(),
        coinbasePrimeService.getAccounts(),
        coinbasePrimeService.getOrders({ limit: 10 }),
      ]);

      if (connectionsResponse.success) {
        setConnections(connectionsResponse.data.results || []);
      }
      if (accountsResponse.success) {
        setAccounts(accountsResponse.data.results || []);
      }
      if (ordersResponse.success) {
        setOrders(ordersResponse.data.results || []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coinbase Prime</h2>
          <p className="text-muted-foreground">
            Institutional trading and account management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                accounts.reduce((sum, acc) => sum + (acc.balance_usd || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Coinbase Prime accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account ID</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>USD Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.account_id}</TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell>{account.balance}</TableCell>
                  <TableCell>{formatCurrency(account.balance_usd || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Order history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.product_id}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' ? 'default' : 'secondary'}>
                      {order.side}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.order_type}</TableCell>
                  <TableCell>{order.size}</TableCell>
                  <TableCell>{order.price ? formatCurrency(order.price) : '--'}</TableCell>
                  <TableCell>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
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


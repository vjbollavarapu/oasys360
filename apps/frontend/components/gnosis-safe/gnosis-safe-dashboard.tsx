/**
 * Gnosis Safe Dashboard
 * Multi-sig wallet management and transaction approval
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  Clock,
  RefreshCw,
  ArrowRight,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { gnosisSafeService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface GnosisSafeDashboardProps {
  className?: string;
}

export function GnosisSafeDashboard({ className = '' }: GnosisSafeDashboardProps) {
  const { withErrorHandling } = useErrorHandler();
  const [safes, setSafes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const [safesResponse] = await Promise.all([
        gnosisSafeService.getSafes(),
      ]);

      if (safesResponse.success) {
        setSafes(safesResponse.data.results || []);
        // Load transactions for first safe
        if (safesResponse.data.results?.length > 0) {
          const txResponse = await gnosisSafeService.getTransactions(
            safesResponse.data.results[0].id,
            { limit: 10 }
          );
          if (txResponse.success) {
            setTransactions(txResponse.data.results || []);
          }
        }
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirm = async (txId: string) => {
    await withErrorHandling(async () => {
      await gnosisSafeService.confirmTransaction(txId);
      loadData();
    });
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gnosis Safe</h2>
          <p className="text-muted-foreground">
            Multi-sig wallet management and transaction approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Safe
          </Button>
        </div>
      </div>

      {/* Safes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {safes.map((safe) => (
          <Card key={safe.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {safe.name || 'Unnamed Safe'}
                </CardTitle>
                <Badge variant="outline">{safe.network}</Badge>
              </div>
              <CardDescription>
                {safe.address?.slice(0, 10)}...{safe.address?.slice(-8)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-medium">
                    {safe.threshold} of {safe.owners?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Owners</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{safe.owners?.length || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">
                    {safe.balance ? `${safe.balance} ETH` : '--'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {safes.length === 0 && (
          <div className="col-span-3 text-center text-muted-foreground py-8">
            No Gnosis Safes configured. Create a new Safe to get started.
          </div>
        )}
      </div>

      {/* Pending Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>Transactions awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Safe</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Confirmations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.filter((tx) => tx.status === 'pending').map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    {tx.safe_name || 'Safe'}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{tx.to?.slice(0, 10)}...</code>
                  </TableCell>
                  <TableCell>{tx.value} ETH</TableCell>
                  <TableCell>
                    {tx.confirmations || 0} / {tx.required_confirmations || 0}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTransactionStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.confirmations < tx.required_confirmations && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(tx.id)}
                      >
                        Confirm
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.filter((tx) => tx.status === 'pending').length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No pending transactions
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


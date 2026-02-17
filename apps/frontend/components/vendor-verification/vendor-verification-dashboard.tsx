/**
 * Vendor Verification Dashboard
 * Wallet verification and payment blocking management
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  Wallet,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { vendorVerificationService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface VendorVerificationDashboardProps {
  className?: string;
}

export function VendorVerificationDashboard({ className = '' }: VendorVerificationDashboardProps) {
  const { withErrorHandling } = useErrorHandler();
  const [wallets, setWallets] = useState<any[]>([]);
  const [paymentBlocks, setPaymentBlocks] = useState<any[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const [walletsResponse, blocksResponse, logsResponse] = await Promise.all([
        vendorVerificationService.getVendorWallets(),
        vendorVerificationService.getPaymentBlocks({ status: 'active' }),
        vendorVerificationService.getVerificationLogs({ limit: 10 }),
      ]);

      if (walletsResponse.success) {
        setWallets(walletsResponse.data.results || []);
      }
      if (blocksResponse.success) {
        setPaymentBlocks(blocksResponse.data.results || []);
      }
      if (logsResponse.success) {
        setVerificationLogs(logsResponse.data.results || []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendor Verification</h2>
          <p className="text-muted-foreground">
            Wallet verification and payment blocking
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {wallets.filter((w) => w.status === 'verified').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{paymentBlocks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {wallets.filter((w) => w.risk_score >= 70).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallets */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Wallets</CardTitle>
            <CardDescription>Wallet addresses and verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">{wallet.supplier_name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{wallet.wallet_address?.slice(0, 10)}...</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(wallet.status)}>
                        {wallet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getRiskColor(wallet.risk_score)}>
                        {wallet.risk_score}/100
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await vendorVerificationService.verifyVendorWallet(wallet.id);
                          loadData();
                        }}
                      >
                        {wallet.status === 'verified' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Blocks */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Blocks</CardTitle>
            <CardDescription>Active payment blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentBlocks.map((block) => (
                <div key={block.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{block.supplier_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Amount: ${block.amount} {block.currency}
                      </p>
                    </div>
                    <Badge variant="destructive">Blocked</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{block.reason}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await vendorVerificationService.resolvePaymentBlock(block.id, {
                          action: 'approve',
                        });
                        loadData();
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await vendorVerificationService.resolvePaymentBlock(block.id, {
                          action: 'dismiss',
                        });
                        loadData();
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
              {paymentBlocks.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No active payment blocks
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Logs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Verification Logs</CardTitle>
          <CardDescription>Recent verification activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.supplier_name}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getRiskColor(log.risk_score)}>
                      {log.risk_score}/100
                    </span>
                  </TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


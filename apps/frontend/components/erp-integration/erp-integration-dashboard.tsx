/**
 * ERP Integration Dashboard
 * QuickBooks, Xero, NetSuite connection management
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Link, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Settings,
  Download,
  Upload,
  Calendar,
  Eye,
} from 'lucide-react';
import { erpIntegrationService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface ErpIntegrationDashboardProps {
  className?: string;
}

export function ErpIntegrationDashboard({ className = '' }: ErpIntegrationDashboardProps) {
  const { withErrorHandling } = useErrorHandler();
  const [connections, setConnections] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const [connectionsResponse, logsResponse] = await Promise.all([
        erpIntegrationService.getErpConnections(),
        erpIntegrationService.getSyncLogs({ limit: 10 }),
      ]);

      if (connectionsResponse.success) {
        setConnections(connectionsResponse.data.results || []);
      }
      if (logsResponse.success) {
        setSyncLogs(logsResponse.data.results || []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'quickbooks':
        return '🧾';
      case 'xero':
        return '📊';
      case 'netsuite':
        return '🔗';
      default:
        return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleSync = async (connectionId: string) => {
    await withErrorHandling(async () => {
      await erpIntegrationService.syncErpConnection(connectionId);
      loadData();
    });
  };

  return (
    <div className={`space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ERP Integration</h2>
          <p className="text-muted-foreground">
            Manage QuickBooks, Xero, and NetSuite connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData} className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="rounded-full">
            <Link className="w-4 h-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      {/* Connections */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle>ERP Connections</CardTitle>
          <CardDescription>Connected ERP systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="rounded-2xl shadow-soft dark:shadow-soft-dark border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getProviderIcon(connection.provider)}</span>
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                    </div>
                    <Badge className={`rounded-full ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </Badge>
                  </div>
                  <CardDescription>{connection.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>
                        {connection.last_sync ? new Date(connection.last_sync).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sync Status</span>
                      <span>{connection.sync_status || 'Idle'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(connection.id)}
                      disabled={connection.status !== 'connected'}
                      className="rounded-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {connections.length === 0 && (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                No ERP connections. Create a new connection to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Logs */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent synchronization activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connection</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.connection_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">{log.sync_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {log.records_synced || 0} records
                  </TableCell>
                  <TableCell>
                    {new Date(log.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Eye className="w-4 h-4" />
                    </Button>
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


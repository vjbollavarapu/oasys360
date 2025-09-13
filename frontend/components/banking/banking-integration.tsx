/**
 * Banking Integration Component
 * Manages bank connections and integrations
 */

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  Building2,
  CreditCard,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Key,
  Globe,
  Lock,
  Activity
} from 'lucide-react';
import { bankingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const bankConnectionSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  routingNumber: z.string().min(1, 'Routing number is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  integrationType: z.string().min(1, 'Integration type is required'),
  credentials: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    apiKey: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }).optional(),
  settings: z.object({
    autoSync: z.boolean().default(true),
    syncFrequency: z.string().default('daily'),
    syncTime: z.string().default('06:00'),
    includePending: z.boolean().default(true),
    categorizeTransactions: z.boolean().default(true),
  }),
});

type BankConnectionFormData = z.infer<typeof bankConnectionSchema>;

interface BankConnection {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  integrationType: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string;
  balance: number;
  currency: string;
  settings: {
    autoSync: boolean;
    syncFrequency: string;
    syncTime: string;
    includePending: boolean;
    categorizeTransactions: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface BankingIntegrationProps {
  className?: string;
}

export function BankingIntegration({ className = '' }: BankingIntegrationProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConnection, setSelectedConnection] = useState<BankConnection | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BankConnectionFormData>({
    resolver: zodResolver(bankConnectionSchema),
    defaultValues: {
      bankName: '',
      accountType: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
      integrationType: '',
      credentials: {
        username: '',
        password: '',
        apiKey: '',
        clientId: '',
        clientSecret: '',
      },
      settings: {
        autoSync: true,
        syncFrequency: 'daily',
        syncTime: '06:00',
        includePending: true,
        categorizeTransactions: true,
      },
    },
  });

  // Bank types
  const bankTypes = [
    { value: 'checking', label: 'Checking Account', icon: Building2 },
    { value: 'savings', label: 'Savings Account', icon: Building2 },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'business', label: 'Business Account', icon: Building2 },
    { value: 'investment', label: 'Investment Account', icon: Activity },
  ];

  // Integration types
  const integrationTypes = [
    { value: 'plaid', label: 'Plaid', description: 'Secure bank data aggregation' },
    { value: 'yodlee', label: 'Yodlee', description: 'Financial data platform' },
    { value: 'mx', label: 'MX', description: 'Money experience platform' },
    { value: 'finicity', label: 'Finicity', description: 'Open banking platform' },
    { value: 'manual', label: 'Manual Import', description: 'Manual transaction entry' },
  ];

  // Load connections
  const loadConnections = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await bankingService.getBankConnections();
      
      if (response.success && response.data) {
        setConnections(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // Handle connection creation
  const handleCreateConnection = async (data: BankConnectionFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await bankingService.createBankConnection(data);
      
      if (response.success) {
        await loadConnections();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create bank connection'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankingIntegration',
        action: 'createBankConnection',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle connection update
  const handleUpdateConnection = async (data: BankConnectionFormData) => {
    if (!selectedConnection) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await bankingService.updateBankConnection(selectedConnection.id, data);
      
      if (response.success) {
        await loadConnections();
        setShowEditDialog(false);
        setSelectedConnection(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update bank connection'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankingIntegration',
        action: 'updateBankConnection',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle connection deletion
  const handleDeleteConnection = async (connection: BankConnection) => {
    if (!confirm(`Are you sure you want to delete the connection to ${connection.bankName}?`)) {
      return;
    }
    
    try {
      const response = await bankingService.deleteBankConnection(connection.id);
      
      if (response.success) {
        await loadConnections();
      } else {
        handleError(new Error(response.message || 'Failed to delete bank connection'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankingIntegration',
        action: 'deleteBankConnection',
      });
    }
  };

  // Handle connection sync
  const handleSyncConnection = async (connection: BankConnection) => {
    try {
      const response = await bankingService.syncBankConnection(connection.id);
      
      if (response.success) {
        await loadConnections();
      } else {
        handleError(new Error(response.message || 'Failed to sync bank connection'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankingIntegration',
        action: 'syncBankConnection',
      });
    }
  };

  // Handle connection test
  const handleTestConnection = async (connection: BankConnection) => {
    try {
      const response = await bankingService.testBankConnection(connection.id);
      
      if (response.success) {
        // Show success message
      } else {
        handleError(new Error(response.message || 'Connection test failed'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankingIntegration',
        action: 'testBankConnection',
      });
    }
  };

  // Handle edit connection
  const handleEditConnection = (connection: BankConnection) => {
    setSelectedConnection(connection);
    setValue('bankName', connection.bankName);
    setValue('accountType', connection.accountType);
    setValue('accountNumber', connection.accountNumber);
    setValue('routingNumber', connection.routingNumber);
    setValue('accountHolderName', connection.accountHolderName);
    setValue('integrationType', connection.integrationType);
    setValue('settings', connection.settings);
    setShowEditDialog(true);
  };

  // Handle settings update
  const handleUpdateSettings = async (data: BankConnectionFormData) => {
    if (!selectedConnection) return;
    
    try {
      const response = await bankingService.updateBankConnectionSettings(selectedConnection.id, data.settings);
      
      if (response.success) {
        await loadConnections();
        setShowSettingsDialog(false);
        setSelectedConnection(null);
      } else {
        handleError(new Error(response.message || 'Failed to update settings'));
      }
    } catch (error) {
      handleError(error, {
        component: 'BankingIntegration',
        action: 'updateBankConnectionSettings',
      });
    }
  };

  // Filter connections
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = !searchTerm || 
      connection.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.accountNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || connection.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  // Get account type icon
  const getAccountTypeIcon = (type: string) => {
    const typeConfig = bankTypes.find(t => t.value === type);
    return typeConfig?.icon || Building2;
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mask account number
  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
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
          <h2 className="text-2xl font-bold">Banking Integration</h2>
          <p className="text-muted-foreground">
            Manage your bank connections and integrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadConnections}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_BANK_CONNECTION">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Bank Connection</DialogTitle>
                  <DialogDescription>
                    Connect a new bank account for automatic transaction sync
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateConnection)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        {...register('bankName')}
                        placeholder="e.g., Chase Bank"
                        className={errors.bankName ? 'border-destructive' : ''}
                      />
                      {errors.bankName && (
                        <p className="text-sm text-destructive">{errors.bankName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Account Type *</Label>
                      <Select onValueChange={(value) => setValue('accountType', value)}>
                        <SelectTrigger className={errors.accountType ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.accountType && (
                        <p className="text-sm text-destructive">{errors.accountType.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        {...register('accountNumber')}
                        placeholder="Account number"
                        className={errors.accountNumber ? 'border-destructive' : ''}
                      />
                      {errors.accountNumber && (
                        <p className="text-sm text-destructive">{errors.accountNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number *</Label>
                      <Input
                        id="routingNumber"
                        {...register('routingNumber')}
                        placeholder="Routing number"
                        className={errors.routingNumber ? 'border-destructive' : ''}
                      />
                      {errors.routingNumber && (
                        <p className="text-sm text-destructive">{errors.routingNumber.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      {...register('accountHolderName')}
                      placeholder="Account holder name"
                      className={errors.accountHolderName ? 'border-destructive' : ''}
                    />
                    {errors.accountHolderName && (
                      <p className="text-sm text-destructive">{errors.accountHolderName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="integrationType">Integration Type *</Label>
                    <Select onValueChange={(value) => setValue('integrationType', value)}>
                      <SelectTrigger className={errors.integrationType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select integration type" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.integrationType && (
                      <p className="text-sm text-destructive">{errors.integrationType.message}</p>
                    )}
                  </div>
                  
                  {/* Credentials Section */}
                  {watch('integrationType') && watch('integrationType') !== 'manual' && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <Label className="text-sm font-medium">Integration Credentials</Label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            {...register('credentials.username')}
                            placeholder="Username"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showCredentials ? 'text' : 'password'}
                              {...register('credentials.password')}
                              placeholder="Password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowCredentials(!showCredentials)}
                            >
                              {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input
                            id="apiKey"
                            {...register('credentials.apiKey')}
                            placeholder="API Key"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="clientId">Client ID</Label>
                          <Input
                            id="clientId"
                            {...register('credentials.clientId')}
                            placeholder="Client ID"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input
                          id="clientSecret"
                          type="password"
                          {...register('credentials.clientSecret')}
                          placeholder="Client Secret"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-2" />
                          Connect Bank
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search bank connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bank Connections Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConnections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{connection.bankName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-mono text-sm">{maskAccountNumber(connection.accountNumber)}</div>
                      <div className="text-sm text-muted-foreground">{connection.accountHolderName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {React.createElement(getAccountTypeIcon(connection.accountType), { className: "w-4 h-4" })}
                      <span className="capitalize">{connection.accountType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">
                      {formatCurrency(connection.balance, connection.currency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(connection.status)}>
                      {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(connection.lastSync)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <PermissionGate permission="READ_BANK_CONNECTION">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTestConnection(connection)}
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="UPDATE_BANK_CONNECTION">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditConnection(connection)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="SYNC_BANK_CONNECTION">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSyncConnection(connection)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="DELETE_BANK_CONNECTION">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConnection(connection)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                    </div>
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

export default BankingIntegration;

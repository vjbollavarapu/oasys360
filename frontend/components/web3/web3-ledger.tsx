/**
 * Web3 Ledger System Component
 * Manages blockchain-based immutable ledger entries
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Copy,
  ExternalLink,
  Clock,
  DollarSign,
  Hash,
  Shield,
  Lock,
  Unlock,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Database,
  Network,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Key,
  QrCode,
  Calendar,
  User,
  Building2,
  CreditCard
} from 'lucide-react';
import { web3Service } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const ledgerEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  network: z.string().min(1, 'Network is required'),
  metadata: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

type LedgerEntryFormData = z.infer<typeof ledgerEntrySchema>;

interface LedgerEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  network: string;
  metadata?: any;
  isPublic: boolean;
  tags: string[];
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  blockHash?: string;
  gasUsed?: number;
  gasPrice?: number;
  fee: number;
  createdAt: string;
  confirmedAt?: string;
  createdBy: {
    id: string;
    name: string;
    walletAddress: string;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
    verificationMethod: 'smart_contract' | 'oracle' | 'manual';
  };
}

interface LedgerStats {
  totalEntries: number;
  totalValue: number;
  confirmedEntries: number;
  pendingEntries: number;
  failedEntries: number;
  averageConfirmationTime: number;
  totalGasUsed: number;
  totalFees: number;
  topCategories: {
    category: string;
    count: number;
    value: number;
  }[];
}

interface Web3LedgerProps {
  className?: string;
}

export function Web3Ledger({ className = '' }: Web3LedgerProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LedgerEntryFormData>({
    resolver: zodResolver(ledgerEntrySchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      amount: '',
      currency: '',
      network: '',
      metadata: '',
      isPublic: false,
      tags: [],
    },
  });

  // Available categories
  const categories = [
    'Revenue',
    'Expense',
    'Asset',
    'Liability',
    'Equity',
    'Investment',
    'Loan',
    'Payment',
    'Refund',
    'Transfer',
    'Other',
  ];

  // Available currencies
  const currencies = [
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'DAI', label: 'Dai (DAI)' },
    { value: 'WETH', label: 'Wrapped Ethereum (WETH)' },
  ];

  // Available networks
  const networks = [
    { value: 'ethereum', label: 'Ethereum Mainnet' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'optimism', label: 'Optimism' },
    { value: 'bsc', label: 'Binance Smart Chain' },
  ];

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load ledger entries
      const entriesResponse = await web3Service.getLedgerEntries();
      if (entriesResponse.success && entriesResponse.data) {
        setEntries(entriesResponse.data);
      }
      
      // Load ledger stats
      const statsResponse = await web3Service.getLedgerStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle create ledger entry
  const handleCreateEntry = async (data: LedgerEntryFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await web3Service.createLedgerEntry({
        title: data.title,
        description: data.description,
        category: data.category,
        amount: parseFloat(data.amount),
        currency: data.currency,
        network: data.network,
        metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
        isPublic: data.isPublic,
        tags: data.tags || [],
      });
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create ledger entry'));
      }
    } catch (error) {
      handleError(error, {
        component: 'Web3Ledger',
        action: 'createLedgerEntry',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view entry details
  const handleViewDetails = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  // Handle copy transaction hash
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  // Handle view on explorer
  const handleViewOnExplorer = (hash: string, network: string) => {
    const explorerUrls = {
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
      arbitrum: 'https://arbiscan.io/tx/',
      optimism: 'https://optimistic.etherscan.io/tx/',
      bsc: 'https://bscscan.com/tx/',
    };
    
    const explorerUrl = explorerUrls[network as keyof typeof explorerUrls];
    if (explorerUrl) {
      window.open(`${explorerUrl}${hash}`, '_blank');
    }
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    const matchesNetwork = networkFilter === 'all' || entry.network === networkFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesNetwork;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get verification badge variant
  const getVerificationBadgeVariant = (isVerified: boolean) => {
    return isVerified ? 'default' : 'secondary';
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(4)} ${currency}`;
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

  // Format confirmation time
  const formatConfirmationTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
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
          <h2 className="text-2xl font-bold">Web3 Ledger System</h2>
          <p className="text-muted-foreground">
            Immutable blockchain-based ledger entries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_LEDGER_ENTRY">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Ledger Entry</DialogTitle>
                  <DialogDescription>
                    Create a new immutable ledger entry on the blockchain
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateEntry)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Entry title"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Entry description"
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setValue('category', value)}>
                        <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.0001"
                        {...register('amount')}
                        placeholder="0.0"
                        className={errors.amount ? 'border-destructive' : ''}
                      />
                      {errors.amount && (
                        <p className="text-sm text-destructive">{errors.amount.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency *</Label>
                      <Select onValueChange={(value) => setValue('currency', value)}>
                        <SelectTrigger className={errors.currency ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.currency && (
                        <p className="text-sm text-destructive">{errors.currency.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="network">Network *</Label>
                      <Select onValueChange={(value) => setValue('network', value)}>
                        <SelectTrigger className={errors.network ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          {networks.map((network) => (
                            <SelectItem key={network.value} value={network.value}>
                              {network.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.network && (
                        <p className="text-sm text-destructive">{errors.network.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="metadata">Metadata (JSON)</Label>
                    <Textarea
                      id="metadata"
                      {...register('metadata')}
                      placeholder='{"key": "value"}'
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      {...register('isPublic')}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic">Make this entry public</Label>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Entry
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue, 'ETH')}</div>
              <p className="text-xs text-muted-foreground">
                Across all entries
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmedEntries}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.confirmedEntries / stats.totalEntries) * 100).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confirmation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatConfirmationTime(stats.averageConfirmationTime)}</div>
              <p className="text-xs text-muted-foreground">
                Time to confirm
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search entries..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={networkFilter} onValueChange={setNetworkFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {networks.map((network) => (
                  <SelectItem key={network.value} value={network.value}>
                    {network.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="entries">Ledger Entries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          {/* Entries Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.title}</div>
                          <div className="text-sm text-muted-foreground">{entry.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {formatCurrency(entry.amount, entry.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {networks.find(n => n.value === entry.network)?.label || entry.network}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(entry.status)}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getVerificationBadgeVariant(entry.verification.isVerified)}>
                          {entry.verification.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(entry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {entry.transactionHash && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyHash(entry.transactionHash!)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewOnExplorer(entry.transactionHash!, entry.network)}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Categories
                </CardTitle>
                <CardDescription>
                  Most common ledger entry categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{category.count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatCurrency(category.value, 'ETH')})
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
                  Ledger Performance
                </CardTitle>
                <CardDescription>
                  Blockchain ledger performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Gas Used</span>
                    <span className="text-sm font-bold">{stats?.totalGasUsed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Fees</span>
                    <span className="text-sm font-bold">{formatCurrency(stats?.totalFees || 0, 'ETH')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {stats ? ((stats.confirmedEntries / stats.totalEntries) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Confirmation</span>
                    <span className="text-sm font-bold">
                      {stats ? formatConfirmationTime(stats.averageConfirmationTime) : '0s'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Entry Details Dialog */}
      {selectedEntry && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                Ledger Entry Details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Entry Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(selectedEntry.amount, selectedEntry.currency)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getStatusBadgeVariant(selectedEntry.status)}>
                      {selectedEntry.status.charAt(0).toUpperCase() + selectedEntry.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getVerificationBadgeVariant(selectedEntry.verification.isVerified)}>
                      {selectedEntry.verification.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Entry Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Entry Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Description</div>
                      <div className="text-sm">{selectedEntry.description}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Category</div>
                      <div className="text-sm">{selectedEntry.category}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Network</div>
                      <div className="text-sm">{networks.find(n => n.value === selectedEntry.network)?.label}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Created By</div>
                      <div className="text-sm">{selectedEntry.createdBy.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Created At</div>
                      <div className="text-sm">{formatDate(selectedEntry.createdAt)}</div>
                    </div>
                    {selectedEntry.confirmedAt && (
                      <div>
                        <div className="text-sm font-medium">Confirmed At</div>
                        <div className="text-sm">{formatDate(selectedEntry.confirmedAt)}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Details */}
              {selectedEntry.transactionHash && (
                <Card>
                  <CardHeader>
                    <CardTitle>Blockchain Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Transaction Hash</div>
                        <div className="font-mono text-sm break-all">{selectedEntry.transactionHash}</div>
                      </div>
                      {selectedEntry.blockNumber && (
                        <div>
                          <div className="text-sm font-medium">Block Number</div>
                          <div className="font-mono text-sm">{selectedEntry.blockNumber}</div>
                        </div>
                      )}
                      {selectedEntry.blockHash && (
                        <div>
                          <div className="text-sm font-medium">Block Hash</div>
                          <div className="font-mono text-sm break-all">{selectedEntry.blockHash}</div>
                        </div>
                      )}
                      {selectedEntry.gasUsed && (
                        <div>
                          <div className="text-sm font-medium">Gas Used</div>
                          <div className="font-mono text-sm">{selectedEntry.gasUsed.toLocaleString()}</div>
                        </div>
                      )}
                      {selectedEntry.gasPrice && (
                        <div>
                          <div className="text-sm font-medium">Gas Price</div>
                          <div className="font-mono text-sm">{selectedEntry.gasPrice} Gwei</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium">Transaction Fee</div>
                        <div className="font-mono text-sm">{formatCurrency(selectedEntry.fee, 'ETH')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {selectedEntry.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Web3Ledger;

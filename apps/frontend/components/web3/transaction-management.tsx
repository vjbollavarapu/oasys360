/**
 * Web3 Transaction Management Component
 * Handles Web3 transactions and blockchain operations
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
  Send, 
  ArrowUpDown, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Copy,
  ExternalLink,
  Clock,
  DollarSign,
  Network,
  Hash,
  Gas,
  Activity,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Download,
  Upload,
  Zap,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';
import { web3Service } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const transactionSchema = z.object({
  to: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  network: z.string().min(1, 'Network is required'),
  gasLimit: z.string().optional(),
  gasPrice: z.string().optional(),
  data: z.string().optional(),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Web3Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  gasUsed: number;
  gasPrice: number;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  timestamp: string;
  description?: string;
  type: 'send' | 'receive' | 'contract' | 'swap' | 'stake' | 'unstake';
  fee: number;
}

interface TransactionManagementProps {
  className?: string;
}

export function TransactionManagement({ className = '' }: TransactionManagementProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [transactions, setTransactions] = useState<Web3Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Web3Transaction | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      to: '',
      amount: '',
      currency: '',
      network: '',
      gasLimit: '',
      gasPrice: '',
      data: '',
      description: '',
    },
  });

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

  // Load transactions
  const loadTransactions = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await web3Service.getTransactions();
      
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Handle send transaction
  const handleSendTransaction = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await web3Service.sendTransaction({
        to: data.to,
        amount: parseFloat(data.amount),
        currency: data.currency,
        network: data.network,
        gasLimit: data.gasLimit ? parseInt(data.gasLimit) : undefined,
        gasPrice: data.gasPrice ? parseFloat(data.gasPrice) : undefined,
        data: data.data,
        description: data.description,
      });
      
      if (response.success) {
        await loadTransactions();
        setShowSendDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to send transaction'));
      }
    } catch (error) {
      handleError(error, {
        component: 'TransactionManagement',
        action: 'sendTransaction',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view transaction details
  const handleViewDetails = (transaction: Web3Transaction) => {
    setSelectedTransaction(transaction);
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

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesNetwork = networkFilter === 'all' || transaction.network === networkFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesNetwork;
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
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'send':
        return 'destructive';
      case 'receive':
        return 'default';
      case 'contract':
        return 'secondary';
      case 'swap':
        return 'outline';
      case 'stake':
        return 'outline';
      case 'unstake':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return Send;
      case 'receive':
        return ArrowUpDown;
      case 'contract':
        return Activity;
      case 'swap':
        return ArrowUpDown;
      case 'stake':
        return Lock;
      case 'unstake':
        return Unlock;
      default:
        return Activity;
    }
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
          <h2 className="text-2xl font-bold">Web3 Transaction Management</h2>
          <p className="text-muted-foreground">
            Send, receive, and manage Web3 transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="SEND_TRANSACTION">
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Send Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Web3 Transaction</DialogTitle>
                  <DialogDescription>
                    Send cryptocurrency or interact with smart contracts
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleSendTransaction)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="to">Recipient Address *</Label>
                    <Input
                      id="to"
                      {...register('to')}
                      placeholder="0x..."
                      className={errors.to ? 'border-destructive' : ''}
                    />
                    {errors.to && (
                      <p className="text-sm text-destructive">{errors.to.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gasLimit">Gas Limit</Label>
                      <Input
                        id="gasLimit"
                        type="number"
                        {...register('gasLimit')}
                        placeholder="21000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                      <Input
                        id="gasPrice"
                        type="number"
                        step="0.1"
                        {...register('gasPrice')}
                        placeholder="20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data">Data (Optional)</Label>
                    <Textarea
                      id="data"
                      {...register('data')}
                      placeholder="0x..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Transaction description"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowSendDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Transaction
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
                  placeholder="Search transactions..."
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
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="send">Send</SelectItem>
                <SelectItem value="receive">Receive</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
                <SelectItem value="stake">Stake</SelectItem>
                <SelectItem value="unstake">Unstake</SelectItem>
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

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gas Fee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => {
                const TypeIcon = getTypeIcon(transaction.type);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-mono text-sm">
                            {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-8)}
                          </div>
                          {transaction.description && (
                            <div className="text-sm text-muted-foreground">{transaction.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {networks.find(n => n.value === transaction.network)?.label || transaction.network}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">
                        {formatCurrency(transaction.fee, 'ETH')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyHash(transaction.hash)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOnExplorer(transaction.hash, transaction.network)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete transaction information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gas Fee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(selectedTransaction.fee, 'ETH')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Transaction Hash</div>
                      <div className="font-mono text-sm break-all">{selectedTransaction.hash}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">From</div>
                      <div className="font-mono text-sm break-all">{selectedTransaction.from}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">To</div>
                      <div className="font-mono text-sm break-all">{selectedTransaction.to}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Network</div>
                      <div className="text-sm">{networks.find(n => n.value === selectedTransaction.network)?.label}</div>
                    </div>
                    {selectedTransaction.blockNumber && (
                      <div>
                        <div className="text-sm font-medium">Block Number</div>
                        <div className="font-mono text-sm">{selectedTransaction.blockNumber}</div>
                      </div>
                    )}
                    {selectedTransaction.blockHash && (
                      <div>
                        <div className="text-sm font-medium">Block Hash</div>
                        <div className="font-mono text-sm break-all">{selectedTransaction.blockHash}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">Gas Used</div>
                      <div className="font-mono text-sm">{selectedTransaction.gasUsed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Gas Price</div>
                      <div className="font-mono text-sm">{selectedTransaction.gasPrice} Gwei</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Timestamp</div>
                      <div className="text-sm">{formatDate(selectedTransaction.timestamp)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default TransactionManagement;

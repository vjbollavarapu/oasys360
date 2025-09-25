/**
 * Web3 Wallet Integration Component
 * Handles wallet connections and Web3 authentication
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Link, 
  Unlink, 
  Copy, 
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Network,
  Key,
  QrCode,
  Download,
  Upload
} from 'lucide-react';
import { web3Service } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

interface WalletConnection {
  id: string;
  address: string;
  network: string;
  balance: number;
  currency: string;
  isActive: boolean;
  connectedAt: string;
  lastUsed: string;
  provider: string;
  label?: string;
}

interface NetworkInfo {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
}

interface WalletIntegrationProps {
  className?: string;
}

export function WalletIntegration({ className = '' }: WalletIntegrationProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [wallets, setWallets] = useState<WalletConnection[]>([]);
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Available wallet providers
  const walletProviders = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Browser extension wallet' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Mobile wallet connection' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', description: 'Coinbase browser wallet' },
    { id: 'trust', name: 'Trust Wallet', icon: '🛡️', description: 'Mobile crypto wallet' },
    { id: 'ledger', name: 'Ledger', icon: '🔒', description: 'Hardware wallet' },
  ];

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load connected wallets
      const walletsResponse = await web3Service.getConnectedWallets();
      if (walletsResponse.success && walletsResponse.data) {
        setWallets(walletsResponse.data);
      }
      
      // Load supported networks
      const networksResponse = await web3Service.getSupportedNetworks();
      if (networksResponse.success && networksResponse.data) {
        setNetworks(networksResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle wallet connection
  const handleConnectWallet = async (provider: string) => {
    setConnecting(true);
    
    try {
      const response = await web3Service.connectWallet(provider);
      
      if (response.success) {
        await loadData();
        setShowConnectDialog(false);
      } else {
        handleError(new Error(response.message || 'Failed to connect wallet'));
      }
    } catch (error) {
      handleError(error, {
        component: 'WalletIntegration',
        action: 'connectWallet',
      });
    } finally {
      setConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to disconnect this wallet?')) {
      return;
    }
    
    try {
      const response = await web3Service.disconnectWallet(walletId);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to disconnect wallet'));
      }
    } catch (error) {
      handleError(error, {
        component: 'WalletIntegration',
        action: 'disconnectWallet',
      });
    }
  };

  // Handle copy address
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // You could add a toast notification here
  };

  // Handle view on explorer
  const handleViewOnExplorer = (address: string, network: string) => {
    const networkInfo = networks.find(n => n.id === network);
    if (networkInfo) {
      window.open(`${networkInfo.blockExplorer}/address/${address}`, '_blank');
    }
  };

  // Format balance
  const formatBalance = (balance: number, currency: string) => {
    return `${balance.toFixed(4)} ${currency}`;
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

  // Get network badge variant
  const getNetworkBadgeVariant = (isTestnet: boolean) => {
    return isTestnet ? 'secondary' : 'default';
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
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
          <h2 className="text-2xl font-bold">Web3 Wallet Integration</h2>
          <p className="text-muted-foreground">
            Connect and manage your Web3 wallets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CONNECT_WALLET">
            <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Link className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Connect Web3 Wallet</DialogTitle>
                  <DialogDescription>
                    Choose a wallet provider to connect
                  </DialogDescription>
                </DialogHeader>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walletProviders.map((provider) => (
                    <Card key={provider.id} className="cursor-pointer hover:bg-muted transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{provider.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-muted-foreground">{provider.description}</div>
                          </div>
                          <Button
                            onClick={() => handleConnectWallet(provider.id)}
                            disabled={connecting}
                            size="sm"
                          >
                            {connecting ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Link className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Connected Wallets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connected Wallets
          </CardTitle>
          <CardDescription>
            Manage your connected Web3 wallets
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{wallet.label || wallet.provider}</div>
                        <div className="text-sm text-muted-foreground">{wallet.provider}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyAddress(wallet.address)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOnExplorer(wallet.address, wallet.network)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getNetworkBadgeVariant(networks.find(n => n.id === wallet.network)?.isTestnet || false)}>
                      {networks.find(n => n.id === wallet.network)?.name || wallet.network}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {formatBalance(wallet.balance, wallet.currency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(wallet.isActive)}>
                      {wallet.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(wallet.connectedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDisconnectWallet(wallet.id)}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supported Networks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Supported Networks
          </CardTitle>
          <CardDescription>
            Available blockchain networks for Web3 integration
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Network</TableHead>
                <TableHead>Chain ID</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Explorer</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networks.map((network) => (
                <TableRow key={network.id}>
                  <TableCell>
                    <div className="font-medium">{network.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{network.chainId}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{network.nativeCurrency.symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        ({network.nativeCurrency.name})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getNetworkBadgeVariant(network.isTestnet)}>
                      {network.isTestnet ? 'Testnet' : 'Mainnet'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(network.blockExplorer, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedNetwork(network);
                        setShowNetworkDialog(true);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Network Details Dialog */}
      {selectedNetwork && (
        <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedNetwork.name} Network Details</DialogTitle>
              <DialogDescription>
                Network configuration and information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Network Name</Label>
                  <div className="text-sm">{selectedNetwork.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Chain ID</Label>
                  <div className="text-sm font-mono">{selectedNetwork.chainId}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">RPC URL</Label>
                  <div className="text-sm font-mono break-all">{selectedNetwork.rpcUrl}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Block Explorer</Label>
                  <div className="text-sm">{selectedNetwork.blockExplorer}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Native Currency</Label>
                  <div className="text-sm">
                    {selectedNetwork.nativeCurrency.name} ({selectedNetwork.nativeCurrency.symbol})
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Decimals</Label>
                  <div className="text-sm">{selectedNetwork.nativeCurrency.decimals}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default WalletIntegration;

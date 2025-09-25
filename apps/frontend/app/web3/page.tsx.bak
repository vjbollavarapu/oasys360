/**
 * Web3 Main Page
 * Integrates all Web3 features and components
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Send, 
  BookOpen,
  BarChart3,
  Network,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionGate } from '@/components/rbac/permission-gate';
import Web3Dashboard from '@/components/web3/web3-dashboard';
import WalletIntegration from '@/components/web3/wallet-integration';
import TransactionManagement from '@/components/web3/transaction-management';
import Web3Ledger from '@/components/web3/web3-ledger';

export default function Web3Page() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Web3 Integration</h1>
            <p className="text-muted-foreground">
              Manage your blockchain assets, transactions, and decentralized applications
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Web3 Enabled
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PermissionGate permission="VIEW_WEB3_DASHBOARD">
              <Web3Dashboard />
            </PermissionGate>
          </TabsContent>

          <TabsContent value="wallets">
            <PermissionGate permission="MANAGE_WALLETS">
              <WalletIntegration />
            </PermissionGate>
          </TabsContent>

          <TabsContent value="transactions">
            <PermissionGate permission="MANAGE_TRANSACTIONS">
              <TransactionManagement />
            </PermissionGate>
          </TabsContent>

          <TabsContent value="ledger">
            <PermissionGate permission="MANAGE_LEDGER">
              <Web3Ledger />
            </PermissionGate>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common Web3 operations and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permission="CONNECT_WALLET">
              <button
                onClick={() => setActiveTab('wallets')}
                className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
              >
                <Wallet className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-medium">Connect Wallet</div>
                  <div className="text-sm text-muted-foreground">Link your Web3 wallet</div>
                </div>
              </button>
            </PermissionGate>
            
            <PermissionGate permission="SEND_TRANSACTION">
              <button
                onClick={() => setActiveTab('transactions')}
                className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
              >
                <Send className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-medium">Send Transaction</div>
                  <div className="text-sm text-muted-foreground">Transfer crypto assets</div>
                </div>
              </button>
            </PermissionGate>
            
            <PermissionGate permission="CREATE_LEDGER_ENTRY">
              <button
                onClick={() => setActiveTab('ledger')}
                className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
              >
                <BookOpen className="w-6 h-6 text-purple-500" />
                <div>
                  <div className="font-medium">Create Ledger Entry</div>
                  <div className="text-sm text-muted-foreground">Record on blockchain</div>
                </div>
              </button>
            </PermissionGate>
            
            <PermissionGate permission="VIEW_WEB3_ANALYTICS">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center space-x-3 p-4 text-left border rounded-lg hover:bg-muted transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-orange-500" />
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Track performance</div>
                </div>
              </button>
            </PermissionGate>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
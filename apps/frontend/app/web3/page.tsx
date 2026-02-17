/**
 * Web3 Main Page
 * Integrates all Web3 features and components
 */

"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
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
import { PermissionGate } from '@/components/rbac/permission-gate';
import Web3Dashboard from '@/components/web3/web3-dashboard';
import WalletIntegration from '@/components/web3/wallet-integration';
import TransactionManagement from '@/components/web3/transaction-management';
import Web3Ledger from '@/components/web3/web3-ledger';

export default function Web3Page() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Web3 Integration</h1>
            <p className="text-muted-foreground">
              Manage your blockchain assets, transactions, and decentralized applications
            </p>
          </div>
          <Badge variant="outline" className="rounded-full flex items-center gap-2">
            <Network className="w-4 h-4" />
            Web3 Enabled
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-4">
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
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
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
                className="flex items-center space-x-3 p-4 text-left border rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">Connect Wallet</div>
                  <div className="text-sm text-muted-foreground">Link your Web3 wallet</div>
                </div>
              </button>
            </PermissionGate>
            
            <PermissionGate permission="SEND_TRANSACTION">
              <button
                onClick={() => setActiveTab('transactions')}
                className="flex items-center space-x-3 p-4 text-left border rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium">Send Transaction</div>
                  <div className="text-sm text-muted-foreground">Transfer crypto assets</div>
                </div>
              </button>
            </PermissionGate>
            
            <PermissionGate permission="CREATE_LEDGER_ENTRY">
              <button
                onClick={() => setActiveTab('ledger')}
                className="flex items-center space-x-3 p-4 text-left border rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium">Create Ledger Entry</div>
                  <div className="text-sm text-muted-foreground">Record on blockchain</div>
                </div>
              </button>
            </PermissionGate>
            
            <PermissionGate permission="VIEW_WEB3_ANALYTICS">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center space-x-3 p-4 text-left border rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Track performance</div>
                </div>
              </button>
            </PermissionGate>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


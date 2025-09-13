/**
 * Banking Page
 * Main banking module with dashboard and management tools
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  CreditCard, 
  BarChart3, 
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Link,
  BookOpen,
  Activity
} from 'lucide-react';
import { BankingDashboard } from '@/components/banking/banking-dashboard';
import { BankingIntegration } from '@/components/banking/banking-integration';
import { TransactionManagement } from '@/components/banking/transaction-management';
import { BankReconciliation } from '@/components/banking/bank-reconciliation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

export default function BankingPage() {
  const { hasPermission } = useRBAC();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has banking permissions
  const canViewBanking = hasPermission(PERMISSIONS.READ_BANK_CONNECTION) || 
    hasPermission(PERMISSIONS.CREATE_BANK_CONNECTION);

  if (!canViewBanking) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              You don't have permission to access banking features.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Banking</h1>
            <p className="text-muted-foreground">
              Manage your bank connections, transactions, and reconciliation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <PermissionGate permission="CREATE_BANK_CONNECTION">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Connect Bank
              </Button>
            </PermissionGate>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125,430</div>
              <p className="text-xs text-muted-foreground">
                Across all accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Active connections
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reconciliations</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Integration
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="reconciliation" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reconciliation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <BankingDashboard />
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <BankingIntegration />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionManagement />
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <BankReconciliation />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
/**
 * Banking Page
 * Main banking module with dashboard and management tools
 */

"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
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
  Link as LinkIcon,
  BookOpen,
  Activity,
  RefreshCw
} from 'lucide-react';
import { BankingDashboard } from '@/components/banking/banking-dashboard';
import { BankingIntegration } from '@/components/banking/banking-integration';
import { TransactionManagement } from '@/components/banking/transaction-management';
import { BankReconciliation } from '@/components/banking/bank-reconciliation';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';
import { useRouter } from 'next/navigation';

export default function BankingPage() {
  const { hasPermission, isTenantAdmin, isCFO } = useRBAC();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has banking permissions - allow Tenant Admin and CFO to always view
  // Use READ_TRANSACTION as the primary permission check since banking is transaction-based
  const canViewBanking = isTenantAdmin || isCFO || 
    hasPermission(PERMISSIONS.READ_TRANSACTION) || 
    hasPermission(PERMISSIONS.RECONCILE_TRANSACTION);

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banking Management</h1>
            <p className="text-muted-foreground mt-2">
              Seamless bank integrations with automated transaction sync and reconciliation
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="lg" className="rounded-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => router.push('/banking/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <PermissionGate permission={PERMISSIONS.CREATE_TRANSACTION}>
              <Button size="lg" className="rounded-full" onClick={() => router.push('/banking/integration')}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Bank
              </Button>
            </PermissionGate>
          </div>
        </div>

        {!canViewBanking ? (
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                You don't have permission to access banking features.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-2xl font-bold">$125,430</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
                </div>
              </Card>
              
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                    <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Connected Accounts</p>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground mt-1">Active connections</p>
                </div>
              </Card>
              
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Transactions</p>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
              </Card>
              
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pending Reconciliations</p>
                  <p className="text-2xl font-bold text-orange-600">2</p>
                  <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-card/50 backdrop-blur-sm p-2 rounded-full h-auto border">
                <TabsTrigger value="dashboard" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="integration" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Integration
                </TabsTrigger>
                <TabsTrigger value="transactions" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="reconciliation" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}


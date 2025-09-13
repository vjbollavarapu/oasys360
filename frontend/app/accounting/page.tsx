/**
 * Accounting Page
 * Main accounting module with dashboard and management tools
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { AccountingDashboard } from '@/components/accounting/accounting-dashboard';
import { ChartOfAccounts } from '@/components/accounting/chart-of-accounts';
import { JournalEntries } from '@/components/accounting/journal-entries';
import { FinancialReports } from '@/components/accounting/financial-reports';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

export default function AccountingPage() {
  const { hasPermission } = useRBAC();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has accounting permissions
  const canViewAccounting = hasPermission(PERMISSIONS.READ_ACCOUNT) || 
    hasPermission(PERMISSIONS.VIEW_FINANCIAL_REPORTS);

  if (!canViewAccounting) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              You don't have permission to access accounting features.
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
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-muted-foreground">
              Manage your chart of accounts, journal entries, and financial reports
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <PermissionGate permission="CREATE_ACCOUNT">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Entry
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
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Active accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125,430</div>
              <p className="text-xs text-muted-foreground">
                Current value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$12,450</div>
              <p className="text-xs text-muted-foreground">
                This month
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
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Chart of Accounts
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Journal Entries
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AccountingDashboard />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <ChartOfAccounts />
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <JournalEntries />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
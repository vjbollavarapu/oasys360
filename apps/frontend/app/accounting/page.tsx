/**
 * Accounting Page
 * Main accounting module with dashboard and management tools
 */

"use client";

// Disable SSR and static generation for this page completely
// Note: revalidate and fetchCache are server-only configs, not valid in client components
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { OnboardingGuard } from '@/components/onboarding/onboarding-guard';
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw
} from 'lucide-react';

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [DashboardLayout, setDashboardLayout] = useState<any>(null);
  const [AccountingDashboard, setAccountingDashboard] = useState<any>(null);
  const [ChartOfAccounts, setChartOfAccounts] = useState<any>(null);
  const [JournalEntries, setJournalEntries] = useState<any>(null);
  const [FinancialReports, setFinancialReports] = useState<any>(null);

  // Only load components after mount to avoid SSR issues
  useEffect(() => {
    setMounted(true);
    
    // Dynamically import all components after mount
    Promise.all([
      import('@/components/dashboard-layout').then(mod => mod.DashboardLayout),
      import('@/components/accounting/accounting-dashboard').then(mod => mod.default),
      import('@/components/accounting/chart-of-accounts').then(mod => mod.default),
      import('@/components/accounting/journal-entries').then(mod => mod.default),
      import('@/components/accounting/financial-reports').then(mod => mod.default),
    ]).then(([Layout, Dashboard, Chart, Entries, Reports]) => {
      setDashboardLayout(() => Layout);
      setAccountingDashboard(() => Dashboard);
      setChartOfAccounts(() => Chart);
      setJournalEntries(() => Entries);
      setFinancialReports(() => Reports);
    });
  }, []);

  if (!mounted || !DashboardLayout) {
    return null; // Return nothing during SSR or while loading
  }

  return (
    <OnboardingGuard>
      <DashboardLayout>
        <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered financial management with real-time accounting and reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="lg" className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="lg" className="rounded-full">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="lg" className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Accounts</p>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </div>
        </Card>
        
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Journal Entries</p>
            <p className="text-2xl font-bold">156</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>
        </Card>
        
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Assets</p>
            <p className="text-2xl font-bold">$125,430</p>
            <p className="text-xs text-muted-foreground mt-1">Current value</p>
          </div>
        </Card>
        
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Net Income</p>
            <p className="text-2xl font-bold text-green-600">$12,450</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
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
          <TabsTrigger value="accounts" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger value="entries" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Journal Entries
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {AccountingDashboard && <AccountingDashboard />}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {ChartOfAccounts && <ChartOfAccounts />}
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          {JournalEntries && <JournalEntries />}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {FinancialReports && <FinancialReports />}
        </TabsContent>
      </Tabs>
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  );
}

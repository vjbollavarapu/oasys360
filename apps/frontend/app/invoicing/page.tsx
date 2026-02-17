/**
 * Invoicing Page
 * Main invoicing module with dashboard and management tools
 */

"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CreditCard, 
  BarChart3, 
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { InvoicingDashboard } from '@/components/invoicing/invoicing-dashboard';
import { InvoiceManagement } from '@/components/invoicing/invoice-management';
import { InvoiceTemplates } from '@/components/invoicing/invoice-templates';
import { PaymentTracking } from '@/components/invoicing/payment-tracking';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';
import { useRouter } from 'next/navigation';

export default function InvoicingPage() {
  const { hasPermission, isTenantAdmin, isCFO } = useRBAC();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has invoicing permissions - allow Tenant Admin and CFO to always view
  const canViewInvoicing = isTenantAdmin || isCFO || 
    hasPermission(PERMISSIONS.READ_INVOICE) || 
    hasPermission(PERMISSIONS.CREATE_INVOICE);

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoicing Management</h1>
            <p className="text-muted-foreground mt-2">
              Streamlined invoicing with automated billing and payment tracking
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="lg" className="rounded-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => router.push('/invoicing/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <PermissionGate permission="CREATE_INVOICE">
              <Button size="lg" className="rounded-full" onClick={() => router.push('/invoicing/create')}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </PermissionGate>
          </div>
        </div>

        {!canViewInvoicing ? (
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                You don't have permission to access invoicing features.
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Invoices</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
              </Card>
              
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">$125,430</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
              </Card>
              
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">$12,450</p>
                  <p className="text-xs text-muted-foreground mt-1">Unpaid invoices</p>
                </div>
              </Card>
              
              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                  <p className="text-xs text-muted-foreground mt-1">Overdue invoices</p>
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
                <TabsTrigger value="invoices" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="templates" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="payments" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="customers" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Customers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <InvoicingDashboard />
              </TabsContent>

              <TabsContent value="invoices" className="space-y-6">
                <InvoiceManagement />
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <InvoiceTemplates />
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <PaymentTracking />
              </TabsContent>

              <TabsContent value="customers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>
                      Manage your customers and their information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      Customer management component coming soon...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}


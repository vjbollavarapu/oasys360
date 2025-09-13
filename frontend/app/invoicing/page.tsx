/**
 * Invoicing Page
 * Main invoicing module with dashboard and management tools
 */

"use client";

import { useState } from 'react';
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
  Receipt
} from 'lucide-react';
import { InvoicingDashboard } from '@/components/invoicing/invoicing-dashboard';
import { InvoiceManagement } from '@/components/invoicing/invoice-management';
import { InvoiceTemplates } from '@/components/invoicing/invoice-templates';
import { PaymentTracking } from '@/components/invoicing/payment-tracking';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

export default function InvoicingPage() {
  const { hasPermission } = useRBAC();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user has invoicing permissions
  const canViewInvoicing = hasPermission(PERMISSIONS.READ_INVOICE) || 
    hasPermission(PERMISSIONS.CREATE_INVOICE);

  if (!canViewInvoicing) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              You don't have permission to access invoicing features.
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
            <h1 className="text-3xl font-bold">Invoicing</h1>
            <p className="text-muted-foreground">
              Manage your invoices, payments, and billing
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <PermissionGate permission="CREATE_INVOICE">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
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
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125,430</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">$12,450</div>
              <p className="text-xs text-muted-foreground">
                Unpaid invoices
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground">
                Overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
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
      </div>
    </ProtectedRoute>
  );
}
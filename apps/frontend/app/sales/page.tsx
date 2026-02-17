/**
 * Sales Page
 * Main sales module with dashboard and management tools
 */

"use client";

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart3,
  Plus,
  Settings,
  TrendingUp,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { SalesDashboard } from '@/components/sales/sales-dashboard';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
            <p className="text-muted-foreground mt-2">
              Complete sales workflow from quotes to orders and customer management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="lg" className="rounded-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => router.push('/sales/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="lg" className="rounded-full" onClick={() => router.push('/sales/customers')}>
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm p-2 rounded-full h-auto border">
            <TabsTrigger value="dashboard" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="quotes" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Quotes
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <SalesDashboard />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage your customer base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Customer management coming soon</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 rounded-full"
                    onClick={() => router.push('/sales/customers')}
                  >
                    Go to Customers Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Sales Orders</CardTitle>
                <CardDescription>View and manage sales orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Sales orders coming soon</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 rounded-full"
                    onClick={() => router.push('/sales/orders')}
                  >
                    Go to Orders Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Sales Quotes</CardTitle>
                <CardDescription>Create and manage sales quotes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Sales quotes coming soon</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 rounded-full"
                    onClick={() => router.push('/sales/quotes')}
                  >
                    Go to Quotes Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

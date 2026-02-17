"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Shield,
  Search,
  Plus,
  MoreHorizontal,
  BarChart3,
  Globe,
  Activity,
  Settings
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BillingManagement } from "@/components/admin/billing-management"

export function PlatformAdminOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock platform metrics
  const platformMetrics = {
    totalTenants: 1247,
    activeTenants: 1189,
    totalRevenue: 2847392,
    monthlyRecurringRevenue: 456789,
    churnRate: 2.3,
    averageRevenuePerUser: 127.50,
    supportTickets: 23,
    systemUptime: 99.97
  }

  const recentTenants = [
    {
      id: "1",
      name: "oasys360 Solutions",
      domain: "oasys360",
      type: "business",
      subscriptionPlan: "AI + Full Web3",
      status: "active",
      users: 18,
      maxUsers: 25,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Global Accounting Firm",
      domain: "globalaccounting",
      type: "firm",
      subscriptionPlan: "Firm Enterprise",
      status: "active",
      users: 67,
      maxUsers: 100,
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      name: "StartupCorp",
      domain: "startupcorp",
      type: "business",
      subscriptionPlan: "AI Core",
      status: "trial",
      users: 3,
      maxUsers: 5,
      createdAt: "2024-01-20"
    }
  ]

  const subscriptionPlans = [
    {
      id: "ai_core",
      name: "AI Core",
      price: 99,
      users: 5,
      activeSubscriptions: 456
    },
    {
      id: "ai_basic_web3",
      name: "AI + Basic Web3",
      price: 249,
      users: 15,
      activeSubscriptions: 234
    },
    {
      id: "ai_full_web3",
      name: "AI + Full Web3",
      price: 449,
      users: 25,
      activeSubscriptions: 189
    },
    {
      id: "firm_enterprise",
      name: "Firm Enterprise",
      price: 1299,
      users: 100,
      activeSubscriptions: 67
    }
  ]

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            Platform Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage platform tenants, billing, and system-wide configurations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="lg" className="rounded-full">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="lg" className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="subscriptions">Plans</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.totalTenants.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">+12.5% this month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(platformMetrics.monthlyRecurringRevenue / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground mt-2">+8.3% this month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenants</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.activeTenants.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">{((platformMetrics.activeTenants / platformMetrics.totalTenants) * 100).toFixed(1)}% active rate</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Uptime</CardTitle>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                  <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.systemUptime}%</div>
                <p className="text-xs text-muted-foreground mt-2">Excellent performance</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Recent Tenant Signups</CardTitle>
                <CardDescription>Latest organizations joining the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">{tenant.domain}.oasys360.com</p>
                      </div>
                      <Badge className={`rounded-full ${
                        tenant.status === 'active' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      }`}>
                        {tenant.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Revenue breakdown by plan type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">${plan.price}/month • {plan.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{plan.activeSubscriptions} tenants</p>
                        <p className="text-xs text-muted-foreground">${(plan.price * plan.activeSubscriptions / 1000).toFixed(0)}K MRR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tenant Management</CardTitle>
                  <CardDescription>Manage all tenant organizations and their configurations</CardDescription>
                </div>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">{tenant.domain}.oasys360.com</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full ${
                          tenant.type === 'firm' 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        }`}>
                          {tenant.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tenant.subscriptionPlan}</TableCell>
                      <TableCell>{tenant.users}/{tenant.maxUsers}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-full ${
                          tenant.status === 'active' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                        }`}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Manage Users</DropdownMenuItem>
                            <DropdownMenuItem>Billing Settings</DropdownMenuItem>
                            <DropdownMenuItem>Login as Tenant</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <BillingManagement />
        </TabsContent>

        {/* Subscription Plans Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>${plan.price}/month • {plan.users} users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">${plan.price}</div>
                    <div className="text-sm text-muted-foreground">
                      {plan.activeSubscriptions} active subscriptions
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-full">
                      Edit Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Platform Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Platform User Management</CardTitle>
              <CardDescription>
                Manage platform administrators and support staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Platform user management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


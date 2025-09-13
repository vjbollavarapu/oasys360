"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Loader2, 
  AlertCircle, 
  Shield, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { Tenant, PlatformMetrics, SubscriptionPlan } from '@/types/global'
import { BillingManagementDark } from '@/components/admin/billing-management-dark'

export default function PlatformAdminPage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Platform-level access control
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'platform_admin')) {
      window.location.href = '/auth/login'
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B1D23]">
        <div className="flex items-center gap-2 text-[#F3F4F6]">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading Platform Admin...
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'platform_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#1B1D23]">
        <Card className="w-full max-w-md bg-[#1B1D23]/50 border-[#4B0082]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F3F4F6]">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Platform Access Denied
            </CardTitle>
            <CardDescription className="text-[#F3F4F6]/70">
              You need platform admin privileges to access this section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">
                Sign In as Platform Admin
              </Button>
            </Link>
            <Link href="/accounting">
              <Button variant="outline" className="w-full border-[#4B0082]/30 text-[#F3F4F6]">
                Back to Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock platform data
  const platformMetrics: PlatformMetrics = {
    totalTenants: 1247,
    activeTenants: 1189,
    totalRevenue: 2847392,
    monthlyRecurringRevenue: 456789,
    churnRate: 2.3,
    averageRevenuePerUser: 127.50,
    supportTickets: 23,
    systemUptime: 99.97
  }

  const recentTenants: Tenant[] = [
    {
      id: "1",
      name: "TechFlow Solutions",
      domain: "techflow",
      type: "business",
      subscriptionPlan: {
        id: "ai_full_web3",
        name: "AI + Full Web3",
        type: "ai_full_web3",
        price: 449,
        billingCycle: "monthly",
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 25 },
        supportLevel: "premium"
      },
      status: "active",
      createdAt: "2024-01-15",
      billingEmail: "billing@techflow.com",
      maxUsers: 25,
      currentUsers: 18,
      enabledModules: [],
      settings: {
        timezone: "UTC",
        currency: "USD",
        dateFormat: "YYYY-MM-DD",
        fiscalYearStart: "01-01",
        multiCurrency: true,
        approvalWorkflow: true
      }
    },
    {
      id: "2",
      name: "Global Accounting Firm",
      domain: "globalaccounting",
      type: "firm",
      subscriptionPlan: {
        id: "firm_enterprise",
        name: "Firm Enterprise",
        type: "firm_enterprise",
        price: 1299,
        billingCycle: "monthly",
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 100, maxClients: 500 },
        supportLevel: "enterprise"
      },
      status: "active",
      createdAt: "2024-01-10",
      billingEmail: "admin@globalaccounting.com",
      maxUsers: 100,
      currentUsers: 67,
      enabledModules: [],
      settings: {
        timezone: "EST",
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        fiscalYearStart: "01-01",
        multiCurrency: true,
        approvalWorkflow: true
      }
    },
    {
      id: "3",
      name: "StartupCorp",
      domain: "startupcorp",
      type: "business",
      subscriptionPlan: {
        id: "ai_core",
        name: "AI Core",
        type: "ai_core",
        price: 99,
        billingCycle: "monthly",
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 5 },
        supportLevel: "basic"
      },
      status: "trial",
      createdAt: "2024-01-20",
      trialEndsAt: "2024-02-19",
      billingEmail: "founder@startupcorp.io",
      maxUsers: 5,
      currentUsers: 3,
      enabledModules: [],
      settings: {
        timezone: "PST",
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        fiscalYearStart: "01-01",
        multiCurrency: false,
        approvalWorkflow: false
      }
    }
  ]

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "ai_core",
      name: "AI Core",
      type: "ai_core",
      price: 99,
      billingCycle: "monthly",
      features: [],
      moduleAccess: [
        { module: "accounting", enabled: true, features: ["basic_entries", "reports"] },
        { module: "banking", enabled: true, features: ["reconciliation"] },
        { module: "reports", enabled: true, features: ["standard_reports"] }
      ],
      userLimits: { maxUsers: 5 },
      supportLevel: "basic"
    },
    {
      id: "ai_basic_web3",
      name: "AI + Basic Web3",
      type: "ai_basic_web3",
      price: 249,
      billingCycle: "monthly",
      features: [],
      moduleAccess: [
        { module: "accounting", enabled: true, features: ["advanced_entries", "approval_workflow"] },
        { module: "banking", enabled: true, features: ["multi_currency"] },
        { module: "web3", enabled: true, features: ["basic_wallet"] },
        { module: "inventory", enabled: true, features: ["basic_tracking"] }
      ],
      userLimits: { maxUsers: 15 },
      supportLevel: "premium"
    },
    {
      id: "firm_enterprise",
      name: "Firm Enterprise",
      type: "firm_enterprise",
      price: 1299,
      billingCycle: "monthly",
      features: [],
      moduleAccess: [
        { module: "multi_client", enabled: true, features: ["client_management", "consolidated_reporting"] },
        { module: "accounting", enabled: true, features: ["full_suite", "audit_trail"] },
        { module: "web3", enabled: true, features: ["enterprise_blockchain"] }
      ],
      userLimits: { maxUsers: 100, maxClients: 500 },
      supportLevel: "enterprise"
    }
  ]

  return (
    <div className="min-h-screen bg-[#1B1D23] text-[#F3F4F6]">
      <div className="border-b border-[#4B0082]/30 bg-[#1B1D23]/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#00FFC6]" />
              <div>
                <h1 className="text-xl font-bold">OASYS Platform Admin</h1>
                <p className="text-sm text-[#F3F4F6]/60">System Administration Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30">
                Platform Admin
              </Badge>
              <Button variant="outline" size="sm" className="border-[#4B0082]/30 text-[#F3F4F6]">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1B1D23] border border-[#4B0082]/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Platform Overview
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Tenant Management
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Billing & Revenue
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription Plans
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Platform Users
            </TabsTrigger>
          </TabsList>

          {/* Platform Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F3F4F6]/80">Total Tenants</p>
                      <p className="text-2xl font-bold text-[#00FFC6]">{platformMetrics.totalTenants}</p>
                      <p className="text-xs text-green-400 mt-1">+12.5% this month</p>
                    </div>
                    <Building2 className="h-8 w-8 text-[#4B0082]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F3F4F6]/80">Monthly Recurring Revenue</p>
                      <p className="text-2xl font-bold text-[#00FFC6]">${platformMetrics.monthlyRecurringRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-400 mt-1">+8.3% this month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-[#4B0082]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F3F4F6]/80">Active Tenants</p>
                      <p className="text-2xl font-bold text-[#00FFC6]">{platformMetrics.activeTenants}</p>
                      <p className="text-xs text-[#F3F4F6]/60 mt-1">{((platformMetrics.activeTenants / platformMetrics.totalTenants) * 100).toFixed(1)}% active</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[#4B0082]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#F3F4F6]/80">System Uptime</p>
                      <p className="text-2xl font-bold text-[#00FFC6]">{platformMetrics.systemUptime}%</p>
                      <p className="text-xs text-green-400 mt-1">Excellent performance</p>
                    </div>
                    <Globe className="h-8 w-8 text-[#4B0082]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                <CardHeader>
                  <CardTitle className="text-[#F3F4F6]">Recent Tenant Signups</CardTitle>
                  <CardDescription className="text-[#F3F4F6]/70">
                    Latest organizations joining the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTenants.slice(0, 5).map((tenant) => (
                      <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1B1D23] border border-[#4B0082]/20">
                        <div>
                          <p className="font-medium text-[#F3F4F6]">{tenant.name}</p>
                          <p className="text-sm text-[#F3F4F6]/60">{tenant.domain}.oasys.com</p>
                        </div>
                        <Badge className={
                          tenant.status === 'active' 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : tenant.status === 'trial'
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }>
                          {tenant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                <CardHeader>
                  <CardTitle className="text-[#F3F4F6]">Subscription Distribution</CardTitle>
                  <CardDescription className="text-[#F3F4F6]/70">
                    Revenue breakdown by plan type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1B1D23] border border-[#4B0082]/20">
                        <div>
                          <p className="font-medium text-[#F3F4F6]">{plan.name}</p>
                          <p className="text-sm text-[#F3F4F6]/60">${plan.price}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#00FFC6]">156 tenants</p>
                          <p className="text-xs text-[#F3F4F6]/60">$70,044 MRR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenant Management */}
          <TabsContent value="tenants" className="space-y-6">
            <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#F3F4F6]">Tenant Management</CardTitle>
                    <CardDescription className="text-[#F3F4F6]/70">
                      Manage all tenant organizations and their configurations
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tenant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#1B1D23] border-[#4B0082]/30">
                      <DialogHeader>
                        <DialogTitle className="text-[#F3F4F6]">Create New Tenant</DialogTitle>
                        <DialogDescription className="text-[#F3F4F6]/70">
                          Set up a new organization on the OASYS platform
                        </DialogDescription>
                      </DialogHeader>
                      {/* Add tenant creation form here */}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F3F4F6]/40" />
                    <Input
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6]"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-[#4B0082]/30">
                      <TableHead className="text-[#F3F4F6]/80">Organization</TableHead>
                      <TableHead className="text-[#F3F4F6]/80">Type</TableHead>
                      <TableHead className="text-[#F3F4F6]/80">Plan</TableHead>
                      <TableHead className="text-[#F3F4F6]/80">Users</TableHead>
                      <TableHead className="text-[#F3F4F6]/80">Status</TableHead>
                      <TableHead className="text-[#F3F4F6]/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTenants.map((tenant) => (
                      <TableRow key={tenant.id} className="border-[#4B0082]/20">
                        <TableCell className="text-[#F3F4F6]">
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-sm text-[#F3F4F6]/60">{tenant.domain}.oasys.com</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            tenant.type === 'firm' 
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }>
                            {tenant.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#F3F4F6]">{tenant.subscriptionPlan.name}</TableCell>
                        <TableCell className="text-[#F3F4F6]">
                          {tenant.currentUsers}/{tenant.maxUsers}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            tenant.status === 'active' 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : tenant.status === 'trial'
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }>
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-[#F3F4F6]">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1B1D23] border-[#4B0082]/30" align="end">
                              <DropdownMenuLabel className="text-[#F3F4F6]">Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="text-[#F3F4F6] hover:bg-[#4B0082]/20">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[#F3F4F6] hover:bg-[#4B0082]/20">
                                Manage Users
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[#F3F4F6] hover:bg-[#4B0082]/20">
                                Billing Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[#F3F4F6] hover:bg-[#4B0082]/20">
                                Login as Tenant
                              </DropdownMenuItem>
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

          {/* Billing & Revenue Management */}
          <TabsContent value="billing" className="space-y-6">
            <div className="bg-[#1B1D23]/50 border border-[#4B0082]/30 rounded-lg p-6">
              <BillingManagementDark />
            </div>
          </TabsContent>

          {/* Subscription Plans */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="bg-[#1B1D23]/50 border-[#4B0082]/30">
                  <CardHeader>
                    <CardTitle className="text-[#F3F4F6]">{plan.name}</CardTitle>
                    <CardDescription className="text-[#F3F4F6]/70">
                      ${plan.price}/month • {plan.userLimits.maxUsers} users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-[#00FFC6]">${plan.price}</div>
                      <div className="space-y-2">
                        {plan.moduleAccess.slice(0, 3).map((module) => (
                          <div key={module.module} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#00FFC6] rounded-full"></div>
                            <span className="text-sm text-[#F3F4F6]/80 capitalize">{module.module.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full border-[#4B0082]/30 text-[#F3F4F6]">
                        Edit Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Platform Users */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
              <CardHeader>
                <CardTitle className="text-[#F3F4F6]">Platform User Management</CardTitle>
                <CardDescription className="text-[#F3F4F6]/70">
                  Manage platform administrators and support staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#F3F4F6]/60">Platform user management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Building2,
  CreditCard,
  Key,
  Palette,
  Search,
  Plus,
  MoreHorizontal,
  Crown,
  Shield,
  Globe,
  TrendingUp,
  Settings,
  Users,
  RefreshCw,
  Zap,
  BarChart3,
  DollarSign,
  Activity,
  Database,
  Server,
  Monitor,
  CheckCircle,
  AlertTriangle,
  Save,
  Eye,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SuperAdminOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Modal states
  const [showAddTenantModal, setShowAddTenantModal] = useState(false)
  const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false)
  const [showManageRolesModal, setShowManageRolesModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  
  // Form states
  const [newTenant, setNewTenant] = useState({
    name: "",
    domain: "",
    plan: "starter",
    adminEmail: ""
  })
  
  const { toast } = useToast()
  const router = useRouter()

  const handleSyncData = async () => {
    setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Success",
        description: "Platform data synced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync platform data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAddTenant = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Tenant Added",
        description: `${newTenant.name} has been successfully added to the platform.`,
      })
      setShowAddTenantModal(false)
      setNewTenant({ name: "", domain: "", plan: "starter", adminEmail: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tenant. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateApiKey = () => {
    setActiveTab("api-keys")
    setShowGenerateKeyModal(false)
    toast({
      title: "API Key Generation",
      description: "Navigated to API key management section",
    })
  }

  const handleManageRoles = () => {
    setActiveTab("roles")
    setShowManageRolesModal(false)
    toast({
      title: "Role Management",
      description: "Navigated to role management section",
    })
  }

  const handleViewAnalytics = () => {
    setShowAnalyticsModal(false)
    toast({
      title: "Analytics Dashboard",
      description: "Advanced analytics features coming soon",
    })
  }

  const kpiData = [
    {
      title: "Total Tenants",
      value: "2,847",
      change: "+12.5%",
      icon: Building2,
      color: "blue",
    },
    {
      title: "Active Subscriptions",
      value: "2,394",
      change: "+8.3%",
      icon: CreditCard,
      color: "green",
    },
    {
      title: "Monthly Revenue",
      value: "$847K",
      change: "+15.2%",
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "API Requests",
      value: "12.4M",
      change: "+23.1%",
      icon: Activity,
      color: "orange",
    },
  ]

  const tenants = [
    {
      id: "tenant-1",
      name: "TechFlow Solutions",
      domain: "techflow.oasys.com",
      status: "Active",
      users: 45,
      lastActivity: "2024-01-15",
      plan: "Enterprise"
    },
    {
      id: "tenant-2",
      name: "Global Dynamics",
      domain: "globaldynamics.oasys.com",
      status: "Active",
      users: 128,
      lastActivity: "2024-01-14",
      plan: "Professional"
    },
    {
      id: "tenant-3",
      name: "Startup Inc",
      domain: "startup.oasys.com",
      status: "Trial",
      users: 12,
      lastActivity: "2024-01-13",
      plan: "Trial"
    },
    {
      id: "tenant-4",
      name: "MegaCorp",
      domain: "megacorp.oasys.com",
      status: "Active",
      users: 256,
      lastActivity: "2024-01-12",
      plan: "Enterprise"
    }
  ]

  const apiKeys = [
    {
      id: "1",
      name: "Production API",
      tenant: "TechFlow Solutions",
      lastUsed: "2 hours ago",
      requests: "45.2K",
      status: "Active",
      scope: "Full Access",
    },
    {
      id: "2",
      name: "Integration Key",
      tenant: "Global Dynamics",
      lastUsed: "5 minutes ago",
      requests: "123.7K",
      status: "Active",
      scope: "Read Only",
    },
    {
      id: "3",
      name: "Development API",
      tenant: "StartupCorp",
      lastUsed: "1 day ago",
      requests: "2.1K",
      status: "Limited",
      scope: "Sandbox",
    },
  ]

  const roles = [
    {
      id: "1",
      name: "Super Admin",
      description: "Full system access and tenant management",
      permissions: 47,
      users: 3,
      system: true,
    },
    {
      id: "2",
      name: "Tenant Admin",
      description: "Full access within tenant scope",
      permissions: 35,
      users: 156,
      system: true,
    },
    {
      id: "3",
      name: "Finance Manager",
      description: "Financial data and reporting access",
      permissions: 18,
      users: 234,
      system: false,
    },
    {
      id: "4",
      name: "Auditor",
      description: "Read-only access to audit trails",
      permissions: 8,
      users: 89,
      system: false,
    },
  ]

  const systemMetrics = [
    {
      title: "System Uptime",
      value: "99.9%",
      description: "Last 30 days",
      icon: Monitor,
      status: "healthy"
    },
    {
      title: "Database Performance",
      value: "1.2ms",
      description: "Average query time",
      icon: Database,
      status: "healthy"
    },
    {
      title: "Storage Usage",
      value: "67%",
      description: "782GB / 1.2TB used",
      icon: Server,
      status: "warning"
    },
    {
      title: "Error Rate",
      value: "0.01%",
      description: "Last 24 hours",
      icon: AlertTriangle,
      status: "healthy"
    }
  ]

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-600" />
            Super Admin Portal
          </h1>
          <p className="text-muted-foreground mt-2">Manage platform tenants, subscriptions, and system-wide configurations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full" 
            onClick={handleSyncData}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Platform'}
          </Button>
          <Dialog open={showAddTenantModal} onOpenChange={setShowAddTenantModal}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Tenant</DialogTitle>
                <DialogDescription>
                  Create a new tenant organization on the platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenant-name" className="text-right">
                    Organization Name
                  </Label>
                  <Input
                    id="tenant-name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter organization name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenant-domain" className="text-right">
                    Domain
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="tenant-domain"
                      value={newTenant.domain}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="company-name"
                    />
                    <span className="text-sm text-gray-500">.oasys.com</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenant-plan" className="text-right">
                    Subscription Plan
                  </Label>
                  <Select value={newTenant.plan} onValueChange={(value) => setNewTenant(prev => ({ ...prev, plan: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial - Free (14 days)</SelectItem>
                      <SelectItem value="starter">Starter - $19/month</SelectItem>
                      <SelectItem value="professional">Professional - $59/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - $119/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="admin-email" className="text-right">
                    Admin Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={newTenant.adminEmail}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="col-span-3"
                    placeholder="admin@company.com"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddTenantModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTenant} disabled={!newTenant.name || !newTenant.domain || !newTenant.adminEmail}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Tenant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 p-1 bg-blue-50 rounded-2xl min-w-max">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tenants" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <Building2 className="w-4 h-4 mr-2" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <Server className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => {
              const gradientClasses = {
                blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
                green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
                purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
                orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
              }
              const textClasses = {
                blue: "text-blue-600",
                green: "text-green-600", 
                purple: "text-purple-600",
                orange: "text-orange-600"
              }
              const valueClasses = {
                blue: "text-blue-900",
                green: "text-green-900",
                purple: "text-purple-900", 
                orange: "text-orange-900"
              }

              return (
                <Card
                  key={kpi.title}
                  className={gradientClasses[kpi.color as keyof typeof gradientClasses]}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${textClasses[kpi.color as keyof typeof textClasses]}`}>
                          {kpi.title}
                        </p>
                        <p className={`text-2xl font-bold ${valueClasses[kpi.color as keyof typeof valueClasses]}`}>
                          {kpi.value}
                        </p>
                        <p className={`text-xs mt-1 ${textClasses[kpi.color as keyof typeof textClasses]}`}>
                          {kpi.change} from last month
                        </p>
                      </div>
                      <kpi.icon className={`h-8 w-8 ${textClasses[kpi.color as keyof typeof textClasses]}`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions with Modals */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-blue-600">
                Common platform administration tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Dialog open={showAddTenantModal} onOpenChange={setShowAddTenantModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Add Tenant</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Dialog open={showGenerateKeyModal} onOpenChange={setShowGenerateKeyModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <Key className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Generate API Key</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate API Key</DialogTitle>
                      <DialogDescription>
                        Create and manage API keys for tenant integrations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 mb-4">
                        This will navigate you to the API key management section where you can:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>Generate new API keys for tenants</li>
                        <li>Set key permissions and scopes</li>
                        <li>Monitor API usage and rate limits</li>
                        <li>Revoke or regenerate existing keys</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowGenerateKeyModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateApiKey}>
                        Go to API Management
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showManageRolesModal} onOpenChange={setShowManageRolesModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <Shield className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Manage Roles</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Role Management</DialogTitle>
                      <DialogDescription>
                        Manage system roles and permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Access the role management section to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>Create custom roles and permissions</li>
                        <li>Assign roles to users across tenants</li>
                        <li>Modify system-wide access controls</li>
                        <li>Audit role assignments and changes</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowManageRolesModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleManageRoles}>
                        Go to Role Management
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">View Analytics</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Platform Analytics</DialogTitle>
                      <DialogDescription>
                        Advanced analytics and reporting features
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Coming soon - Advanced analytics dashboard with:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>Tenant usage and performance metrics</li>
                        <li>Revenue and subscription analytics</li>
                        <li>API usage patterns and trends</li>
                        <li>System health and performance data</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAnalyticsModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleViewAnalytics}>
                        Coming Soon
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Recent Platform Activity</CardTitle>
              <CardDescription className="text-blue-600">
                Latest tenant activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">New tenant "StartupCorp" registered</p>
                    <p className="text-xs text-blue-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">API key renewed for TechFlow Solutions</p>
                    <p className="text-xs text-blue-600">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">System maintenance completed</p>
                    <p className="text-xs text-blue-600">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div>
                <CardTitle className="text-blue-900">Tenant Management</CardTitle>
                <CardDescription className="text-blue-600">
                  Manage platform tenants and their configurations
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    placeholder="Search tenants..."
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-200">
                      <TableHead className="text-blue-900">Tenant</TableHead>
                      <TableHead className="text-blue-900">Domain</TableHead>
                      <TableHead className="text-blue-900">Plan</TableHead>
                      <TableHead className="text-blue-900">Users</TableHead>
                      <TableHead className="text-blue-900">Status</TableHead>
                      <TableHead className="text-blue-900">Last Activity</TableHead>
                      <TableHead className="text-blue-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id} className="border-blue-100">
                        <TableCell>
                          <div className="font-medium text-blue-900">{tenant.name}</div>
                        </TableCell>
                        <TableCell className="text-blue-700">{tenant.domain}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              tenant.plan === "Enterprise"
                                ? "border-purple-200 text-purple-700 bg-purple-50"
                                : tenant.plan === "Professional"
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : "border-yellow-200 text-yellow-700 bg-yellow-50"
                            }
                          >
                            {tenant.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-800">{tenant.users}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              tenant.status === "Active" 
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-700">{tenant.lastActivity}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast({ title: "Tenant Details", description: `Viewing details for ${tenant.name}` })}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Tenant Settings", description: `Opening settings for ${tenant.name}` })}>
                                Edit Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => toast({ title: "Suspend Tenant", description: `Suspending tenant ${tenant.name}`, variant: "destructive" })}
                              >
                                Suspend Tenant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">API Key Management</CardTitle>
              <CardDescription className="text-blue-600">
                Monitor and manage all API keys across tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-200">
                      <TableHead className="text-blue-900">Key Name</TableHead>
                      <TableHead className="text-blue-900">Tenant</TableHead>
                      <TableHead className="text-blue-900">Last Used</TableHead>
                      <TableHead className="text-blue-900">Requests</TableHead>
                      <TableHead className="text-blue-900">Status</TableHead>
                      <TableHead className="text-blue-900">Scope</TableHead>
                      <TableHead className="text-blue-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id} className="border-blue-100">
                        <TableCell className="font-medium text-blue-900">{key.name}</TableCell>
                        <TableCell className="text-blue-700">{key.tenant}</TableCell>
                        <TableCell className="text-blue-700">{key.lastUsed}</TableCell>
                        <TableCell className="text-blue-900 font-mono">{key.requests}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              key.status === "Active" 
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-600">{key.scope}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast({ title: "API Key Details", description: `Viewing details for ${key.name}` })}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Regenerate Key", description: `Regenerating ${key.name}` })}>
                                Regenerate Key
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => toast({ title: "Revoke Key", description: `Revoking ${key.name}`, variant: "destructive" })}
                              >
                                Revoke Key
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Role & Permission Management</CardTitle>
                  <CardDescription className="text-blue-600">
                    Create and manage system-wide roles and permissions
                  </CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-200">
                      <TableHead className="text-blue-900">Role Name</TableHead>
                      <TableHead className="text-blue-900">Description</TableHead>
                      <TableHead className="text-blue-900">Permissions</TableHead>
                      <TableHead className="text-blue-900">Users</TableHead>
                      <TableHead className="text-blue-900">Type</TableHead>
                      <TableHead className="text-blue-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id} className="border-blue-100">
                        <TableCell className="font-medium text-blue-900">{role.name}</TableCell>
                        <TableCell className="text-blue-700">{role.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                            {role.permissions} permissions
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-800">{role.users}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              role.system
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-green-100 text-green-700 border-green-200"
                            }
                          >
                            {role.system ? "System" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast({ title: "Edit Permissions", description: `Editing permissions for ${role.name}` })}>
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "View Users", description: `Viewing users with ${role.name} role` })}>
                                View Users
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Duplicate Role", description: `Duplicating ${role.name} role` })}>
                                Duplicate Role
                              </DropdownMenuItem>
                              {!role.system && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => toast({ title: "Delete Role", description: `Deleting ${role.name} role`, variant: "destructive" })}
                                  >
                                    Delete Role
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Health Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric, index) => (
              <Card
                key={index}
                className={`
                  ${metric.status === 'healthy' 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                    : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                  }
                `}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        metric.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {metric.title}
                      </p>
                      <p className={`text-2xl font-bold ${
                        metric.status === 'healthy' ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {metric.value}
                      </p>
                      <p className={`text-xs mt-1 ${
                        metric.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {metric.description}
                      </p>
                    </div>
                    <metric.icon className={`h-8 w-8 ${
                      metric.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">System Configuration</CardTitle>
                <CardDescription className="text-blue-600">
                  Platform-wide settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <div className="font-medium text-blue-900">Maintenance Mode</div>
                    <div className="text-sm text-blue-600">System maintenance status</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <div className="font-medium text-blue-900">Auto Backup</div>
                    <div className="text-sm text-blue-600">Daily at 2:00 AM UTC</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <div className="font-medium text-blue-900">Rate Limiting</div>
                    <div className="text-sm text-blue-600">API request throttling</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">Security Status</CardTitle>
                <CardDescription className="text-purple-600">
                  Security monitoring and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <div>
                    <div className="font-medium text-purple-900">SSL Certificate</div>
                    <div className="text-sm text-purple-600">Valid until Dec 2024</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <div>
                    <div className="font-medium text-purple-900">Security Scan</div>
                    <div className="text-sm text-purple-600">Last scan: 2 hours ago</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <div>
                    <div className="font-medium text-purple-900">Failed Login Attempts</div>
                    <div className="text-sm text-purple-600">Last 24 hours: 12</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Low</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

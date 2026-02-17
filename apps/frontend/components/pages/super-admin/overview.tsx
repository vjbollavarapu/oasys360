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
      name: "oasys360 Solutions",
      domain: "oasys360.oasys360.com",
      status: "Active",
      users: 45,
      lastActivity: "2024-01-15",
      plan: "Enterprise"
    },
    {
      id: "tenant-2",
      name: "Global Dynamics",
      domain: "globaldynamics.oasys360.com",
      status: "Active",
      users: 128,
      lastActivity: "2024-01-14",
      plan: "Professional"
    },
    {
      id: "tenant-3",
      name: "Startup Inc",
      domain: "startup.oasys360.com",
      status: "Trial",
      users: 12,
      lastActivity: "2024-01-13",
      plan: "Trial"
    },
    {
      id: "tenant-4",
      name: "MegaCorp",
      domain: "megacorp.oasys360.com",
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
      tenant: "oasys360 Solutions",
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
            <DialogContent className="sm:max-w-[600px] rounded-4xl">
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
                    <span className="text-sm text-gray-500">.oasys360.com</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tenant-plan" className="text-right">
                    Subscription Plan
                  </Label>
                  <Select value={newTenant.plan} onValueChange={(value) => setNewTenant(prev => ({ ...prev, plan: value }))}>
                    <SelectTrigger className="col-span-3 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                <Button variant="outline" onClick={() => setShowAddTenantModal(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button onClick={handleAddTenant} disabled={!newTenant.name || !newTenant.domain || !newTenant.adminEmail} className="rounded-full">
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
          <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-2 lg:grid-cols-5 min-w-max">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tenants">
              <Building2 className="w-4 h-4 mr-2" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="w-4 h-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="system">
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

              const iconBgColors = {
                blue: "bg-blue-100 dark:bg-blue-900/20",
                green: "bg-green-100 dark:bg-green-900/20",
                purple: "bg-purple-100 dark:bg-purple-900/20",
                orange: "bg-orange-100 dark:bg-orange-900/20"
              }
              const iconTextColors = {
                blue: "text-blue-600 dark:text-blue-400",
                green: "text-green-600 dark:text-green-400",
                purple: "text-purple-600 dark:text-purple-400",
                orange: "text-orange-600 dark:text-orange-400"
              }

              return (
                <Card
                  key={kpi.title}
                  className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                    <div className={`p-3 ${iconBgColors[kpi.color as keyof typeof iconBgColors]} rounded-2xl`}>
                      <kpi.icon className={`h-5 w-5 ${iconTextColors[kpi.color as keyof typeof iconTextColors]}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground mt-2">{kpi.change} from last month</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions with Modals */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common platform administration tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Dialog open={showAddTenantModal} onOpenChange={setShowAddTenantModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 rounded-full"
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
                      className="h-20 flex-col gap-2 rounded-full"
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
                      <Button variant="outline" onClick={() => setShowGenerateKeyModal(false)} className="rounded-full">
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateApiKey} className="rounded-full">
                        Go to API Management
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showManageRolesModal} onOpenChange={setShowManageRolesModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 rounded-full"
                    >
                      <Shield className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Manage Roles</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-4xl">
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
                      <Button variant="outline" onClick={() => setShowManageRolesModal(false)} className="rounded-full">
                        Cancel
                      </Button>
                      <Button onClick={handleManageRoles} className="rounded-full">
                        Go to Role Management
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 rounded-full"
                    >
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">View Analytics</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-4xl">
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
                      <Button variant="outline" onClick={() => setShowAnalyticsModal(false)} className="rounded-full">
                        Cancel
                      </Button>
                      <Button onClick={handleViewAnalytics} className="rounded-full">
                        Coming Soon
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
              <CardDescription>
                Latest tenant activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-2xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New tenant "StartupCorp" registered</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-2xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">API key renewed for oasys360 Solutions</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-2xl">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">System maintenance completed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div>
                <CardTitle>Tenant Management</CardTitle>
                <CardDescription>
                  Manage platform tenants and their configurations
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tenants..."
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tenant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="font-medium">{tenant.name}</div>
                        </TableCell>
                        <TableCell>{tenant.domain}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`rounded-full ${
                              tenant.plan === "Enterprise"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                                : tenant.plan === "Professional"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            }`}
                          >
                            {tenant.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{tenant.users}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`rounded-full ${
                              tenant.status === "Active" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            }`}
                          >
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{tenant.lastActivity}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="rounded-full"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
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
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Monitor and manage all API keys across tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key Name</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>{key.tenant}</TableCell>
                        <TableCell>{key.lastUsed}</TableCell>
                        <TableCell className="font-mono">{key.requests}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`rounded-full ${
                              key.status === "Active" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            }`}
                          >
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.scope}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="rounded-full"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
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
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Role & Permission Management</CardTitle>
                  <CardDescription>
                    Create and manage system-wide roles and permissions
                  </CardDescription>
                </div>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                            {role.permissions} permissions
                          </Badge>
                        </TableCell>
                        <TableCell>{role.users}</TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-full ${
                              role.system
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            }`}
                          >
                            {role.system ? "System" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="rounded-full"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
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
            {systemMetrics.map((metric, index) => {
              const iconBgColors = {
                healthy: "bg-green-100 dark:bg-green-900/20",
                warning: "bg-yellow-100 dark:bg-yellow-900/20"
              }
              const iconTextColors = {
                healthy: "text-green-600 dark:text-green-400",
                warning: "text-yellow-600 dark:text-yellow-400"
              }
              return (
                <Card
                  key={index}
                  className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                    <div className={`p-3 ${iconBgColors[metric.status as keyof typeof iconBgColors]} rounded-2xl`}>
                      <metric.icon className={`h-5 w-5 ${iconTextColors[metric.status as keyof typeof iconTextColors]}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* System Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Platform-wide settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">System maintenance status</div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <div className="font-medium">Auto Backup</div>
                    <div className="text-sm text-muted-foreground">Daily at 2:00 AM UTC</div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <div className="font-medium">Rate Limiting</div>
                    <div className="text-sm text-muted-foreground">API request throttling</div>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>
                  Security monitoring and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <div className="font-medium">SSL Certificate</div>
                    <div className="text-sm text-muted-foreground">Valid until Dec 2024</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <div className="font-medium">Security Scan</div>
                    <div className="text-sm text-muted-foreground">Last scan: 2 hours ago</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <div className="font-medium">Failed Login Attempts</div>
                    <div className="text-sm text-muted-foreground">Last 24 hours: 12</div>
                  </div>
                  <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Low</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

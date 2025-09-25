"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from "lucide-react"

interface Tenant {
  id: string
  name: string
  domain: string
  type: "business" | "firm" | "enterprise"
  status: "active" | "suspended" | "pending"
  subscriptionPlan: string
  userCount: number
  maxUsers: number
  createdAt: string
  lastActive: string
  billingEmail: string
}

export function TenantManagementOverview() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Mock data
  useEffect(() => {
    setTenants([
      {
        id: "1",
        name: "TechFlow Solutions",
        domain: "techflow",
        type: "business",
        status: "active",
        subscriptionPlan: "AI + Full Web3",
        userCount: 18,
        maxUsers: 25,
        createdAt: "2024-01-15",
        lastActive: "2024-01-15T10:30:00Z",
        billingEmail: "billing@techflow.com"
      },
      {
        id: "2",
        name: "Demo Corporation",
        domain: "democorp",
        type: "business",
        status: "active",
        subscriptionPlan: "AI Core",
        userCount: 3,
        maxUsers: 5,
        createdAt: "2024-01-20",
        lastActive: "2024-01-15T09:15:00Z",
        billingEmail: "demo@company.com"
      },
      {
        id: "3",
        name: "Global Accounting Firm",
        domain: "globalaccounting",
        type: "firm",
        status: "active",
        subscriptionPlan: "Firm Enterprise",
        userCount: 67,
        maxUsers: 100,
        createdAt: "2024-01-10",
        lastActive: "2024-01-15T11:45:00Z",
        billingEmail: "admin@globalaccounting.com"
      },
      {
        id: "4",
        name: "Startup Inc",
        domain: "startup",
        type: "business",
        status: "pending",
        subscriptionPlan: "AI Core",
        userCount: 0,
        maxUsers: 5,
        createdAt: "2024-01-16",
        lastActive: "2024-01-16T08:00:00Z",
        billingEmail: "admin@startup.com"
      }
    ])
  }, [])

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.billingEmail.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSuspendTenant = (tenantId: string) => {
    setTenants(prev => prev.map(tenant => 
      tenant.id === tenantId 
        ? { ...tenant, status: "suspended" as const }
        : tenant
    ))
  }

  const handleActivateTenant = (tenantId: string) => {
    setTenants(prev => prev.map(tenant => 
      tenant.id === tenantId 
        ? { ...tenant, status: "active" as const }
        : tenant
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "enterprise": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "firm": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "business": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
          <p className="text-muted-foreground">
            Manage multi-tenant organizations and subscriptions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tenants">All Tenants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tenants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Tenants List */}
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{tenant.name}</h3>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                        <Badge className={getTypeColor(tenant.type)}>
                          {tenant.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">@{tenant.domain}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="ml-2 font-medium">{tenant.subscriptionPlan}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Users:</span>
                          <span className="ml-2 font-medium">{tenant.userCount}/{tenant.maxUsers}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-medium">{formatDate(tenant.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Active:</span>
                          <span className="ml-2 font-medium">{formatDate(tenant.lastActive)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Billing: {tenant.billingEmail}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {tenant.status === "active" ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSuspendTenant(tenant.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleActivateTenant(tenant.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.length}</div>
                <p className="text-xs text-muted-foreground">Active organizations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenants.filter(t => t.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenants.reduce((sum, tenant) => sum + tenant.userCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Across all tenants</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tenants.filter(t => t.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting activation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Overview</CardTitle>
              <CardDescription>
                Tenant billing and subscription management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Billing management interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

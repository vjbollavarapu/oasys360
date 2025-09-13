"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Building2, 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Search,
  Plus,
  Eye,
  Settings,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { FirmClient } from "@/types/global"

export function MultiClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock firm metrics
  const firmMetrics = {
    totalClients: 45,
    activeClients: 42,
    totalRevenue: "$2,847,392",
    monthlyRevenue: "$456,789",
    pendingTasks: 23,
    overdueItems: 5,
    teamMembers: 12,
    avgResponseTime: "2.3 hours"
  }

  // Mock client data
  const clients: FirmClient[] = [
    {
      id: "client-1",
      firmId: "globalaccounting",
      name: "TechFlow Solutions",
      email: "contact@techflow.com",
      company: "TechFlow Solutions Inc.",
      subscriptionPlan: {
        id: "ai_full_web3",
        name: "AI + Full Web3",
        type: "ai_full_web3",
        price: 449,
        billingCycle: "monthly",
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 25 },
        supportLevel: "priority"
      },
      status: "active",
      assignedUsers: ["firm-1", "firm-2"],
      enabledModules: [],
      createdAt: "2024-01-15",
      lastActivity: "2024-01-22"
    },
    {
      id: "client-2",
      firmId: "globalaccounting",
      name: "StartupCorp",
      email: "finance@startupcorp.io",
      company: "StartupCorp LLC",
      subscriptionPlan: {
        id: "ai_core",
        name: "AI Core",
        type: "ai_core",
        price: 99,
        billingCycle: "monthly",
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 5 },
        supportLevel: "email"
      },
      status: "active",
      assignedUsers: ["firm-2"],
      enabledModules: [],
      createdAt: "2024-01-20",
      lastActivity: "2024-01-22"
    },
    {
      id: "client-3",
      firmId: "globalaccounting",
      name: "RetailPlus",
      email: "accounting@retailplus.com",
      company: "RetailPlus Corporation",
      subscriptionPlan: {
        id: "ai_basic_web3",
        name: "AI + Basic Web3",
        type: "ai_basic_web3",
        price: 249,
        billingCycle: "monthly",
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 15 },
        supportLevel: "chat"
      },
      status: "pending",
      assignedUsers: ["firm-1"],
      enabledModules: [],
      createdAt: "2024-01-18",
      lastActivity: "2024-01-21"
    }
  ]

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Client Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage all your clients from one unified interface</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Set up a new client account and assign team members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">Client creation form would go here...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="clients" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Client Management
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Consolidated Reports
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Team Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Firm Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Clients</p>
                    <p className="text-2xl font-bold text-blue-900">{firmMetrics.totalClients}</p>
                    <p className="text-xs text-blue-600 mt-1">{firmMetrics.activeClients} active</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-900">{firmMetrics.monthlyRevenue}</p>
                    <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Pending Tasks</p>
                    <p className="text-2xl font-bold text-orange-900">{firmMetrics.pendingTasks}</p>
                    <p className="text-xs text-orange-600 mt-1">{firmMetrics.overdueItems} overdue</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Team Members</p>
                    <p className="text-2xl font-bold text-purple-900">{firmMetrics.teamMembers}</p>
                    <p className="text-xs text-purple-600 mt-1">{firmMetrics.avgResponseTime} avg response</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Client Activity */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Client Activity
              </CardTitle>
              <CardDescription className="text-blue-600">
                Latest updates from your client accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{client.name}</p>
                        <p className="text-sm text-blue-600">{client.subscriptionPlan.name} • Last active: {client.lastActivity}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        client.status === 'active' 
                          ? "bg-green-500/20 text-green-700 border-green-500/30"
                          : "bg-orange-500/20 text-orange-700 border-orange-500/30"
                      }
                    >
                      {client.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Client Management</CardTitle>
                  <CardDescription className="text-blue-600">
                    Manage all your client accounts and their subscriptions
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white border-blue-200"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-200">
                    <TableHead className="text-blue-700">Client</TableHead>
                    <TableHead className="text-blue-700">Plan</TableHead>
                    <TableHead className="text-blue-700">Status</TableHead>
                    <TableHead className="text-blue-700">Assigned Team</TableHead>
                    <TableHead className="text-blue-700">Last Activity</TableHead>
                    <TableHead className="text-blue-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-blue-100">
                      <TableCell>
                        <div>
                          <p className="font-medium text-blue-900">{client.name}</p>
                          <p className="text-sm text-blue-600">{client.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {client.subscriptionPlan.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            client.status === 'active' 
                              ? "bg-green-500/20 text-green-700 border-green-500/30"
                              : "bg-orange-500/20 text-orange-700 border-orange-500/30"
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {client.assignedUsers.slice(0, 3).map((userId, index) => (
                            <div 
                              key={userId}
                              className="w-8 h-8 bg-blue-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-blue-700"
                            >
                              {index + 1}
                            </div>
                          ))}
                          {client.assignedUsers.length > 3 && (
                            <div className="w-8 h-8 bg-blue-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                              +{client.assignedUsers.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-700">{client.lastActivity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Consolidated Reports
              </CardTitle>
              <CardDescription className="text-blue-600">
                View consolidated financial data across all clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Revenue by Client</h3>
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <span className="font-medium text-blue-900">{client.name}</span>
                        <span className="text-blue-700">${client.subscriptionPlan.price}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Plan Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-900">AI Core</span>
                      <span className="text-blue-700">1 client</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-900">AI + Basic Web3</span>
                      <span className="text-blue-700">1 client</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-900">AI + Full Web3</span>
                      <span className="text-blue-700">1 client</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription className="text-blue-600">
                Manage your firm's team members and their client assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">Team management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
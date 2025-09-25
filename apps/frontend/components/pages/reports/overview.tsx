"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Brain,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  Users,
  Shield,
  Activity,
  Target,
  Zap,
  Plus,
  Share,
  Calculator,
  Warehouse,
  Bell,
  UserCheck,
} from "lucide-react"

export function ReportsOverview() {
  const [selectedRole, setSelectedRole] = useState("accountant")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("this-month")
  const [selectedLedger, setSelectedLedger] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [aiSummaryEnabled, setAiSummaryEnabled] = useState(true)

  // Mock data for different report types
  const reportTemplates = [
    {
      id: "balance-sheet",
      name: "Balance Sheet",
      category: "Financial",
      description: "Assets, liabilities, and equity statement",
      frequency: "Monthly",
      lastRun: "2024-01-15",
      roles: ["accountant", "cfo"],
    },
    {
      id: "profit-loss",
      name: "Profit & Loss",
      category: "Financial",
      description: "Revenue and expense analysis",
      frequency: "Monthly",
      lastRun: "2024-01-15",
      roles: ["accountant", "cfo"],
    },
    {
      id: "cash-flow",
      name: "Cash Flow Statement",
      category: "Financial",
      description: "Cash inflows and outflows",
      frequency: "Weekly",
      lastRun: "2024-01-14",
      roles: ["cfo"],
    },
    {
      id: "inventory-valuation",
      name: "Inventory Valuation",
      category: "Inventory",
      description: "Stock levels and valuation by location",
      frequency: "Daily",
      lastRun: "2024-01-15",
      roles: ["inventory-manager"],
    },
    {
      id: "audit-trail",
      name: "Audit Trail Report",
      category: "Compliance",
      description: "Complete transaction audit log",
      frequency: "On-demand",
      lastRun: "2024-01-15",
      roles: ["admin"],
    },
    {
      id: "user-activity",
      name: "User Activity Report",
      category: "Security",
      description: "User login and action tracking",
      frequency: "Weekly",
      lastRun: "2024-01-14",
      roles: ["admin"],
    },
  ]

  // Role-based dashboard configurations
  const roleDashboards = {
    accountant: {
      title: "Accountant Dashboard",
      icon: Calculator,
      color: "text-blue-600",
      widgets: [
        {
          title: "Account Balances",
          type: "balance-summary",
          data: {
            totalAssets: 2847392,
            totalLiabilities: 534892,
            equity: 2312500,
            change: "+5.2%",
          },
        },
        {
          title: "Pending Tasks",
          type: "task-list",
          data: [
            { task: "Month-end journal entries", due: "2024-01-31", priority: "High" },
            { task: "Bank reconciliation - Chase", due: "2024-01-25", priority: "Medium" },
            { task: "Expense report review", due: "2024-01-28", priority: "Low" },
          ],
        },
        {
          title: "Financial Alerts",
          type: "alert-list",
          data: [
            { message: "Unusual expense pattern detected", type: "warning", date: "2024-01-15" },
            { message: "Bank reconciliation variance", type: "error", date: "2024-01-14" },
            { message: "Monthly close reminder", type: "info", date: "2024-01-13" },
          ],
        },
      ],
    },
    cfo: {
      title: "CFO Executive Dashboard",
      icon: TrendingUp,
      color: "text-green-600",
      widgets: [
        {
          title: "Key Performance Indicators",
          type: "kpi-grid",
          data: {
            revenue: { value: 1247392, change: "+15.2%", trend: "up" },
            netIncome: { value: 457936, change: "+8.7%", trend: "up" },
            cashFlow: { value: 234567, change: "-2.1%", trend: "down" },
            roi: { value: 18.5, change: "+1.2%", trend: "up" },
          },
        },
        {
          title: "Cash Flow Trends",
          type: "cash-flow-chart",
          data: [
            { month: "Oct", inflow: 450000, outflow: 380000 },
            { month: "Nov", inflow: 520000, outflow: 420000 },
            { month: "Dec", inflow: 480000, outflow: 390000 },
            { month: "Jan", inflow: 580000, outflow: 450000 },
          ],
        },
        {
          title: "AI Risk Analysis",
          type: "risk-alerts",
          data: [
            {
              risk: "Cash flow volatility increasing",
              severity: "Medium",
              confidence: 87,
              recommendation: "Consider establishing credit line",
            },
            {
              risk: "Foreign exchange exposure",
              severity: "High",
              confidence: 94,
              recommendation: "Hedge EUR/USD position",
            },
            {
              risk: "Seasonal revenue decline expected",
              severity: "Low",
              confidence: 76,
              recommendation: "Prepare Q2 marketing budget",
            },
          ],
        },
      ],
    },
    "inventory-manager": {
      title: "Inventory Manager Dashboard",
      icon: Package,
      color: "text-purple-600",
      widgets: [
        {
          title: "Stock Movement Summary",
          type: "stock-movement",
          data: {
            stockIn: 1250,
            stockOut: 980,
            transfers: 45,
            adjustments: 12,
          },
        },
        {
          title: "Reorder Alerts",
          type: "reorder-alerts",
          data: [
            { product: "MacBook Pro 16", currentStock: 12, reorderPoint: 15, priority: "High" },
            { product: "Office Chair Pro", currentStock: 0, reorderPoint: 10, priority: "Critical" },
            { product: "Dell XPS 13", currentStock: 8, reorderPoint: 10, priority: "Medium" },
          ],
        },
        {
          title: "Warehouse Utilization",
          type: "warehouse-chart",
          data: [
            { warehouse: "Main", utilization: 75, capacity: 10000 },
            { warehouse: "East Coast", utilization: 65, capacity: 8000 },
            { warehouse: "West Coast", utilization: 63, capacity: 6000 },
          ],
        },
      ],
    },
    admin: {
      title: "System Administrator Dashboard",
      icon: Shield,
      color: "text-red-600",
      widgets: [
        {
          title: "System Audit Logs",
          type: "audit-logs",
          data: [
            { action: "User login", user: "john.doe@company.com", timestamp: "2024-01-15 14:30", status: "Success" },
            {
              action: "Report generated",
              user: "jane.smith@company.com",
              timestamp: "2024-01-15 14:25",
              status: "Success",
            },
            {
              action: "Failed login attempt",
              user: "unknown@domain.com",
              timestamp: "2024-01-15 14:20",
              status: "Failed",
            },
          ],
        },
        {
          title: "User Activity Overview",
          type: "user-activity",
          data: {
            activeUsers: 45,
            totalSessions: 127,
            avgSessionTime: "2h 15m",
            failedLogins: 3,
          },
        },
        {
          title: "System Health",
          type: "system-health",
          data: {
            uptime: "99.9%",
            responseTime: "120ms",
            errorRate: "0.02%",
            lastBackup: "2024-01-15 02:00",
          },
        },
      ],
    },
  }

  const currentDashboard = roleDashboards[selectedRole as keyof typeof roleDashboards]

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case "balance-summary":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold">${widget.data.totalAssets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Liabilities</p>
                  <p className="text-2xl font-bold">${widget.data.totalLiabilities.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Equity</p>
                  <div className="text-right">
                    <p className="text-xl font-bold">${widget.data.equity.toLocaleString()}</p>
                    <p className="text-sm text-green-600">{widget.data.change}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "task-list":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.map((task: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-muted-foreground">Due: {task.due}</p>
                    </div>
                    <Badge
                      variant={
                        task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "alert-list":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.map((alert: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div
                      className={`p-1 rounded-full ${
                        alert.type === "error"
                          ? "bg-red-100 text-red-600"
                          : alert.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {alert.type === "error" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : alert.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "kpi-grid":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(widget.data).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-2xl font-bold">
                      {key === "roi" ? `${value.value}%` : `$${value.value.toLocaleString()}`}
                    </p>
                    <div
                      className={`flex items-center justify-center gap-1 text-sm ${
                        value.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {value.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {value.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "cash-flow-chart":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widget.data.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="font-medium">{item.month}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-green-600">
                        <span className="text-sm">In: </span>
                        <span className="font-medium">${item.inflow.toLocaleString()}</span>
                      </div>
                      <div className="text-red-600">
                        <span className="text-sm">Out: </span>
                        <span className="font-medium">${item.outflow.toLocaleString()}</span>
                      </div>
                      <div className="font-bold">Net: ${(item.inflow - item.outflow).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "risk-alerts":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widget.data.map((risk: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{risk.risk}</p>
                      <Badge
                        variant={
                          risk.severity === "High"
                            ? "destructive"
                            : risk.severity === "Medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{risk.recommendation}</p>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">AI Confidence: {risk.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "stock-movement":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Stock In</p>
                  <p className="text-2xl font-bold text-green-600">{widget.data.stockIn}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Stock Out</p>
                  <p className="text-2xl font-bold text-red-600">{widget.data.stockOut}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Transfers</p>
                  <p className="text-2xl font-bold text-blue-600">{widget.data.transfers}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Adjustments</p>
                  <p className="text-2xl font-bold text-purple-600">{widget.data.adjustments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "reorder-alerts":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.map((alert: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{alert.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {alert.currentStock} / Reorder: {alert.reorderPoint}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.priority === "Critical"
                          ? "destructive"
                          : alert.priority === "High"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "warehouse-chart":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widget.data.map((warehouse: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{warehouse.warehouse}</span>
                      <span className="text-sm text-muted-foreground">{warehouse.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${warehouse.utilization}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((warehouse.capacity * warehouse.utilization) / 100).toLocaleString()} used</span>
                      <span>{warehouse.capacity.toLocaleString()} capacity</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "audit-logs":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.data.map((log: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">{log.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{log.timestamp}</p>
                      <Badge variant={log.status === "Success" ? "default" : "destructive"}>{log.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case "user-activity":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{widget.data.activeUsers}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{widget.data.totalSessions}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Session</p>
                  <p className="text-2xl font-bold">{widget.data.avgSessionTime}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Failed Logins</p>
                  <p className="text-2xl font-bold text-red-600">{widget.data.failedLogins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "system-health":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold text-green-600">{widget.data.uptime}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{widget.data.responseTime}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold text-green-600">{widget.data.errorRate}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Backup</p>
                  <p className="text-sm font-bold">{widget.data.lastBackup}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Dynamic reporting with AI-powered insights and role-based dashboards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share Dashboard
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Role-Based Dashboard
          </CardTitle>
          <CardDescription>Switch between different role perspectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {Object.entries(roleDashboards).map(([role, config]) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                onClick={() => setSelectedRole(role)}
                className="flex items-center gap-2"
              >
                <config.icon className={`h-4 w-4 ${selectedRole === role ? "" : config.color}`} />
                {config.title.replace(" Dashboard", "")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Report Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Role-Based Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <currentDashboard.icon className={`h-6 w-6 ${currentDashboard.color}`} />
            <h2 className="text-2xl font-bold">{currentDashboard.title}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentDashboard.widgets.map((widget, index) => (
              <div key={index} className="lg:col-span-1">
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Report Builder */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Dynamic Report Builder
              </CardTitle>
              <CardDescription>Create custom reports with advanced filtering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="branch-filter">Branch/Entity</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="hq">Headquarters</SelectItem>
                      <SelectItem value="east">East Coast</SelectItem>
                      <SelectItem value="west">West Coast</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-quarter">This Quarter</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ledger-filter">Ledger Account</Label>
                  <Select value={selectedLedger} onValueChange={setSelectedLedger}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      <SelectItem value="assets">Assets</SelectItem>
                      <SelectItem value="liabilities">Liabilities</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expenses">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags-filter">Tags</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Summary Toggle */}
              <div className="flex items-center space-x-2">
                <Switch id="ai-summary" checked={aiSummaryEnabled} onCheckedChange={setAiSummaryEnabled} />
                <Label htmlFor="ai-summary" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Enable AI Summary & Insights
                </Label>
              </div>

              {/* Export Options */}
              <div className="flex items-center gap-2">
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Report Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report Preview</CardTitle>
                {aiSummaryEnabled && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Brain className="h-4 w-4 mr-2" />
                        Explain This Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
                      <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                          <Brain className="h-5 w-5" />
                          AI Report Analysis
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">AI-powered insights and explanation of your report data</DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto px-1">
                        <div className="space-y-4 py-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Key Findings</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Revenue increased by 15.2% compared to the previous period</li>
                            <li>• Operating expenses are within budget at 68% of revenue</li>
                            <li>• Cash flow shows positive trend with $234K net inflow</li>
                            <li>• Inventory turnover improved by 8.5%</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Consider increasing marketing spend to capitalize on growth trend</li>
                            <li>• Review supplier terms to improve cash flow timing</li>
                            <li>• Monitor foreign exchange exposure in European operations</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Risk Assessment</h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Overall financial health is strong with low risk indicators. Seasonal patterns suggest Q2
                            revenue may decline by 5-10% based on historical data.
                          </p>
                        </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead>Previous Period</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>% Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Revenue</TableCell>
                    <TableCell>$1,247,392</TableCell>
                    <TableCell>$1,082,456</TableCell>
                    <TableCell className="text-green-600">+$164,936</TableCell>
                    <TableCell className="text-green-600">+15.2%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Operating Expenses</TableCell>
                    <TableCell>$847,392</TableCell>
                    <TableCell>$789,234</TableCell>
                    <TableCell className="text-red-600">+$58,158</TableCell>
                    <TableCell className="text-red-600">+7.4%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Net Income</TableCell>
                    <TableCell>$400,000</TableCell>
                    <TableCell>$293,222</TableCell>
                    <TableCell className="text-green-600">+$106,778</TableCell>
                    <TableCell className="text-green-600">+36.4%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{template.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{template.lastRun}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access:</span>
                      <div className="flex gap-1">
                        {template.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Run Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Business Intelligence
              </CardTitle>
              <CardDescription>Advanced analytics and predictive insights powered by machine learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Revenue Growth</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI detected consistent 12% month-over-month growth. Trend likely to continue for next 3
                          months.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Expense Pattern</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Marketing expenses increased 25% but ROI remains positive. Monitor for efficiency
                          optimization.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Predictive Forecasting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Q2 Forecast</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Predicted revenue: $1.4M (±8% confidence interval) Based on seasonal patterns and current
                          growth rate.
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Cash Flow</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Expected cash flow positive for next 6 months. Recommend maintaining current collection
                          policies.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Anomaly Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Unusual Expense Pattern</p>
                          <p className="text-sm text-muted-foreground">
                            Office supplies expense 300% above normal - requires investigation
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Payment Pattern Normal</p>
                          <p className="text-sm text-muted-foreground">
                            Customer payment timing within expected parameters
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

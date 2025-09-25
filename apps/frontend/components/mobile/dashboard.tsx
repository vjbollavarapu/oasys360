"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Menu,
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MoreVertical,
  CreditCard,
  Receipt,
  ArrowRight,
  RefreshCw,
  Settings,
  LogOut,
  Home,
  BarChart3,
} from "lucide-react"

export function MobileDashboard() {
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null)
  const [notificationCount, setNotificationCount] = useState(7)

  const dashboardMetrics = {
    totalRevenue: "$2,847,392",
    pendingInvoices: "$234,567",
    expensesClaimed: "$45,890",
    approvalsPending: 12,
    revenueChange: "+15.2%",
    invoiceChange: "+8.7%",
    expenseChange: "+23.1%",
    approvalsChange: "-5.2%",
  }

  const quickActions = [
    {
      id: "invoice",
      title: "Create Invoice",
      icon: FileText,
      color: "bg-blue-500",
      description: "New customer invoice",
    },
    {
      id: "expense",
      title: "Add Expense",
      icon: Receipt,
      color: "bg-green-500",
      description: "Submit expense claim",
    },
    {
      id: "approval",
      title: "Approvals",
      icon: CheckCircle,
      color: "bg-purple-500",
      description: "Review pending items",
    },
    {
      id: "payment",
      title: "Make Payment",
      icon: CreditCard,
      color: "bg-orange-500",
      description: "Process vendor payment",
    },
  ]

  const recentActivities = [
    {
      id: "1",
      type: "invoice",
      title: "Invoice INV-2024-001 paid",
      description: "TechCorp Solutions - $45,000",
      time: "2 minutes ago",
      status: "success",
      amount: "$45,000",
    },
    {
      id: "2",
      type: "approval",
      title: "Purchase request approved",
      description: "Office supplies - Marketing Dept",
      time: "15 minutes ago",
      status: "info",
      amount: "$2,500",
    },
    {
      id: "3",
      type: "expense",
      title: "Expense claim submitted",
      description: "Travel expenses - John Doe",
      time: "1 hour ago",
      status: "pending",
      amount: "$1,250",
    },
    {
      id: "4",
      type: "payment",
      title: "Payment processed",
      description: "Creative Solutions - Marketing",
      time: "2 hours ago",
      status: "success",
      amount: "$23,750",
    },
  ]

  const pendingApprovals = [
    {
      id: "PR-2024-001",
      type: "Purchase Request",
      requester: "John Doe",
      amount: "$45,000",
      description: "Laptop Computers - IT Dept",
      priority: "High",
      daysOld: 2,
    },
    {
      id: "EXP-2024-045",
      type: "Expense Claim",
      requester: "Jane Smith",
      amount: "$1,250",
      description: "Client Meeting - Travel",
      priority: "Medium",
      daysOld: 1,
    },
    {
      id: "INV-2024-089",
      type: "Invoice Approval",
      requester: "Bob Wilson",
      amount: "$8,750",
      description: "Consulting Services",
      priority: "Low",
      daysOld: 3,
    },
  ]

  const upcomingTasks = [
    {
      id: "1",
      title: "Monthly Financial Review",
      dueDate: "Today, 3:00 PM",
      priority: "High",
      type: "Meeting",
    },
    {
      id: "2",
      title: "Vendor Payment Run",
      dueDate: "Tomorrow, 10:00 AM",
      priority: "Medium",
      type: "Payment",
    },
    {
      id: "3",
      title: "Expense Report Review",
      dueDate: "Jan 18, 2:00 PM",
      priority: "Low",
      type: "Review",
    },
  ]

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/mobile/dashboard", active: true },
    { icon: FileText, label: "Invoices", href: "/mobile/invoices" },
    { icon: Receipt, label: "Expenses", href: "/mobile/expenses" },
    { icon: CheckCircle, label: "Approvals", href: "/mobile/approvals" },
    { icon: BarChart3, label: "Reports", href: "/mobile/reports" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">OASYS Mobile</SheetTitle>
                  <SheetDescription className="text-left">Enterprise Financial Management</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-gray-500">Finance Manager</div>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          item.active ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </a>
                    ))}
                  </nav>
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Settings className="h-5 w-5" />
                        Settings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, John</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center p-0">
                  {notificationCount}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-lg font-bold">{dashboardMetrics.totalRevenue}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{dashboardMetrics.revenueChange}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-lg font-bold">{dashboardMetrics.pendingInvoices}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{dashboardMetrics.invoiceChange}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expenses</p>
                  <p className="text-lg font-bold">{dashboardMetrics.expensesClaimed}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{dashboardMetrics.expenseChange}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approvals</p>
                  <p className="text-lg font-bold">{dashboardMetrics.approvalsPending}</p>
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">{dashboardMetrics.approvalsChange}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveQuickAction(action.id)}
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={
                            approval.priority === "High"
                              ? "border-red-200 text-red-700"
                              : approval.priority === "Medium"
                                ? "border-yellow-200 text-yellow-700"
                                : "border-gray-200 text-gray-700"
                          }
                        >
                          {approval.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{approval.daysOld}d old</span>
                      </div>
                      <div className="font-medium text-sm">{approval.description}</div>
                      <div className="text-xs text-gray-500">
                        {approval.type} • {approval.requester}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{approval.amount}</div>
                      <Button size="sm" className="mt-1">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-100"
                          : activity.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {activity.type === "invoice" && (
                        <FileText
                          className={`h-4 w-4 ${
                            activity.status === "success"
                              ? "text-green-600"
                              : activity.status === "pending"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                      )}
                      {activity.type === "approval" && (
                        <CheckCircle
                          className={`h-4 w-4 ${
                            activity.status === "success"
                              ? "text-green-600"
                              : activity.status === "pending"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                      )}
                      {activity.type === "expense" && (
                        <Receipt
                          className={`h-4 w-4 ${
                            activity.status === "success"
                              ? "text-green-600"
                              : activity.status === "pending"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                      )}
                      {activity.type === "payment" && (
                        <CreditCard
                          className={`h-4 w-4 ${
                            activity.status === "success"
                              ? "text-green-600"
                              : activity.status === "pending"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-500">{activity.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                    </div>
                    <div className="text-sm font-medium">{activity.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        task.priority === "High"
                          ? "bg-red-500"
                          : task.priority === "Medium"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.dueDate}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                item.active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

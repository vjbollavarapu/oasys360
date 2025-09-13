"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  Bell,
  BellOff,
  Settings,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Brain,
} from "lucide-react"

export function MobileNotifications() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "approval",
      title: "Purchase Request Approved",
      message: "Your laptop purchase request (PR-2024-001) has been approved by Finance Director",
      timestamp: "2 minutes ago",
      read: false,
      priority: "high",
      category: "approval",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: false,
      relatedId: "PR-2024-001",
    },
    {
      id: "2",
      type: "payment",
      title: "Invoice Payment Received",
      message: "Payment of $45,000 received from TechCorp Solutions for INV-2024-001",
      timestamp: "15 minutes ago",
      read: false,
      priority: "medium",
      category: "payment",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: false,
      relatedId: "INV-2024-001",
    },
    {
      id: "3",
      type: "approval_request",
      title: "Expense Claim Requires Approval",
      message: "Jane Smith submitted an expense claim for $1,250 - Travel expenses",
      timestamp: "1 hour ago",
      read: true,
      priority: "high",
      category: "approval",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: true,
      relatedId: "EXP-2024-045",
    },
    {
      id: "4",
      type: "alert",
      title: "Unusual Activity Detected",
      message: "Multiple failed login attempts detected from unknown IP address",
      timestamp: "2 hours ago",
      read: false,
      priority: "critical",
      category: "security",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: true,
      relatedId: "SEC-2024-001",
    },
    {
      id: "5",
      type: "reminder",
      title: "Monthly Financial Review",
      message: "Scheduled for today at 3:00 PM in Conference Room A",
      timestamp: "3 hours ago",
      read: true,
      priority: "medium",
      category: "calendar",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: false,
      relatedId: "MTG-2024-001",
    },
    {
      id: "6",
      type: "ai_insight",
      title: "AI Recommendation",
      message: "Consider increasing prices for Enterprise tier by 8% based on market analysis",
      timestamp: "4 hours ago",
      read: false,
      priority: "low",
      category: "ai",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: false,
      relatedId: "AI-2024-001",
    },
    {
      id: "7",
      type: "system",
      title: "System Maintenance Complete",
      message: "Scheduled maintenance completed successfully. All systems operational.",
      timestamp: "6 hours ago",
      read: true,
      priority: "low",
      category: "system",
      avatar: "/placeholder.svg?height=32&width=32",
      actionRequired: false,
      relatedId: "SYS-2024-001",
    },
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    approvals: true,
    payments: true,
    security: true,
    ai: false,
    system: false,
    quietHours: true,
    quietStart: "22:00",
    quietEnd: "08:00",
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "approval":
      case "approval_request":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "payment":
        return <DollarSign className="h-5 w-5 text-blue-600" />
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "reminder":
        return <Calendar className="h-5 w-5 text-purple-600" />
      case "ai_insight":
        return <Brain className="h-5 w-5 text-indigo-600" />
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    if (activeTab === "action") return notification.actionRequired
    return notification.category === activeTab
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const actionRequiredCount = notifications.filter((n) => n.actionRequired).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Notifications</h1>
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Notification Settings</SheetTitle>
                  <SheetDescription>Configure your notification preferences</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">General Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Push Notifications</Label>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Email Notifications</Label>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Quiet Hours</Label>
                        <Switch
                          checked={notificationSettings.quietHours}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, quietHours: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Categories</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Approvals</Label>
                        <Switch
                          checked={notificationSettings.approvals}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, approvals: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Payments</Label>
                        <Switch
                          checked={notificationSettings.payments}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, payments: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Security Alerts</Label>
                        <Switch
                          checked={notificationSettings.security}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, security: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>AI Insights</Label>
                        <Switch
                          checked={notificationSettings.ai}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, ai: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>System Updates</Label>
                        <Switch
                          checked={notificationSettings.system}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, system: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="action">Action ({actionRequiredCount})</TabsTrigger>
            <TabsTrigger value="approval">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`overflow-hidden ${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 ml-2"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {notification.actionRequired && (
                              <Badge className="bg-red-100 text-red-800">Action Required</Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        </div>

                        {notification.actionRequired && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1">
                              Take Action
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                              Mark Read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

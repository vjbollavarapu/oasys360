"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  Clock,
  Settings,
  Trash2,
  Archive,
  Star,
  StarOff,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  Zap,
  ZapOff,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Umbrella,
  Droplets,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Gauge,
  Timer,
  TimerOff,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Shuffle,
  Volume1,
  VolumeX as VolumeXIcon,
  Mic,
  MicOff,
  Headphones,
  HeadphonesOff,
  Speaker,
  SpeakerOff,
  Monitor,
  MonitorOff,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Wifi as WifiIcon,
  Bluetooth,
  Usb,
  Hdmi,
  Vga,
  Dvi,
  DisplayPort,
  Thunderbolt,
  Lightning,
  Power,
  PowerOff,
  Battery as BatteryIcon,
  BatteryCharging as BatteryChargingIcon,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryEmpty,
  Plug,
  PlugZap,
  PlugZap2,
  PlugOff,
  PlugOff2,
  Outlet,
  OutletOff,
  Cable,
  CableOff,
  Router,
  RouterOff,
  Modem,
  ModemOff,
  Satellite,
  SatelliteOff,
  Antenna,
  AntennaOff,
  Radio,
  RadioOff,
  Tv,
  TvOff,
  MonitorSpeaker,
  MonitorSpeakerOff,
  MonitorSmartphone,
  MonitorSmartphoneOff,
  MonitorTablet,
  MonitorTabletOff,
  MonitorLaptop,
  MonitorLaptopOff,
  MonitorDesktop,
  MonitorDesktopOff,
  MonitorCheck,
  MonitorX,
  MonitorPause,
  MonitorPlay,
  MonitorStop,
  MonitorRecord,
  MonitorUp,
  MonitorDown,
  MonitorLeft,
  MonitorRight,
  MonitorRotate,
  MonitorRotateCcw,
  MonitorRotateCw,
  MonitorFlip,
  MonitorFlipHorizontal,
  MonitorFlipVertical,
  MonitorFlip2,
  MonitorFlipHorizontal2,
  MonitorFlipVertical2,
  MonitorFlip3,
  MonitorFlipHorizontal3,
  MonitorFlipVertical3,
  MonitorFlip4,
  MonitorFlipHorizontal4,
  MonitorFlipVertical4,
  MonitorFlip5,
  MonitorFlipHorizontal5,
  MonitorFlipVertical5,
  MonitorFlip6,
  MonitorFlipHorizontal6,
  MonitorFlipVertical6,
  MonitorFlip7,
  MonitorFlipHorizontal7,
  MonitorFlipVertical7,
  MonitorFlip8,
  MonitorFlipHorizontal8,
  MonitorFlipVertical8,
  MonitorFlip9,
  MonitorFlipHorizontal9,
  MonitorFlipVertical9,
  MonitorFlip10,
  MonitorFlipHorizontal10,
  MonitorFlipVertical10,
  FileText,
  DollarSign,
  User,
  Building2,
  Calendar,
  Tag,
  Hash,
  Edit,
  Copy,
  Link,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Key,
  Lock,
  Unlock,
  CheckCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Percent,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Download,
  Upload,
  RefreshCw,
  Bookmark,
  Share,
  Plus,
  Minus,
  Equal,
  Divide,
  Hash as HashIcon,
  Tag as TagIcon,
  AtSign,
  Hash as HashIcon2,
  Tag as TagIcon2,
  AtSign as AtSignIcon,
  Hash as HashIcon3,
  Tag as TagIcon3,
  AtSign as AtSignIcon2,
  Hash as HashIcon4,
  Tag as TagIcon4,
  AtSign as AtSignIcon3,
  Hash as HashIcon5,
  Tag as TagIcon5,
  AtSign as AtSignIcon4,
  Hash as HashIcon6,
  Tag as TagIcon6,
  AtSign as AtSignIcon5,
  Hash as HashIcon7,
  Tag as TagIcon7,
  AtSign as AtSignIcon6,
  Hash as HashIcon8,
  Tag as TagIcon8,
  AtSign as AtSignIcon7,
  Hash as HashIcon9,
  Tag as TagIcon9,
  AtSign as AtSignIcon8,
  Hash as HashIcon10,
  Tag as TagIcon10,
  AtSign as AtSignIcon9,
} from "lucide-react"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
  category: string
  actionUrl?: string
  actionText?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  categories: {
    [key: string]: boolean
  }
}

export function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    categories: {
      invoices: true,
      payments: true,
      customers: true,
      reports: true,
      system: true,
      security: true
    }
  })
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "success",
      title: "Payment Received",
      message: "Payment of $5,000 received from Acme Corporation",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      priority: "high",
      category: "payments",
      actionUrl: "/banking/transactions/1",
      actionText: "View Transaction",
      icon: DollarSign
    },
    {
      id: "2",
      type: "warning",
      title: "Invoice Overdue",
      message: "Invoice INV-2024-001 is 15 days overdue",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: "high",
      category: "invoices",
      actionUrl: "/invoicing/invoices/1",
      actionText: "View Invoice",
      icon: FileText
    },
    {
      id: "3",
      type: "info",
      title: "New Customer Added",
      message: "Tech Solutions Ltd has been added as a new customer",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      priority: "medium",
      category: "customers",
      actionUrl: "/sales/customers/2",
      actionText: "View Customer",
      icon: Building2
    },
    {
      id: "4",
      type: "error",
      title: "Bank Connection Failed",
      message: "Failed to sync with Plaid bank connection",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      priority: "high",
      category: "system",
      actionUrl: "/banking/integration",
      actionText: "Reconnect",
      icon: WifiOff
    },
    {
      id: "5",
      type: "success",
      title: "Report Generated",
      message: "Q4 Financial Report has been generated successfully",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      priority: "medium",
      category: "reports",
      actionUrl: "/reports/financial",
      actionText: "View Report",
      icon: BarChart3
    }
  ]

  useEffect(() => {
    setNotifications(mockNotifications)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const archiveNotification = (id: string) => {
    // In a real app, this would move to archived notifications
    deleteNotification(id)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle
      case "warning": return AlertTriangle
      case "error": return AlertTriangle
      case "info": return Info
      default: return Info
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "warning": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
      case "error": return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
      case "info": return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600"
      case "medium": return "text-yellow-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return timestamp.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || notification.category === filter
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <div className="relative" ref={notificationsRef}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <Card className="absolute top-full right-0 mt-2 w-96 z-50 max-h-96 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filter and Search */}
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 p-2 border rounded text-sm"
              >
                <option value="all">All Categories</option>
                <option value="invoices">Invoices</option>
                <option value="payments">Payments</option>
                <option value="customers">Customers</option>
                <option value="reports">Reports</option>
                <option value="system">System</option>
                <option value="security">Security</option>
              </select>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => {
                    const TypeIcon = getTypeIcon(notification.type)
                    const NotificationIcon = notification.icon || TypeIcon
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 border-b last:border-b-0 hover:bg-accent transition-colors cursor-pointer ${
                          !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <NotificationIcon className={`h-5 w-5 ${getTypeColor(notification.type)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {notification.category}
                                </Badge>
                              </div>
                              
                              {notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.location.href = notification.actionUrl!
                                  }}
                                >
                                  {notification.actionText}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t bg-muted/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{filteredNotifications.length} notifications</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  View All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

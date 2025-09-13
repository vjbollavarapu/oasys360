"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { SearchComponent } from "@/components/ui/search"
import { NotificationsComponent } from "@/components/ui/notifications"
import { useAuth } from "@/hooks/use-auth"
import { useOrganization } from "@/hooks/use-organization"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calculator,
  FileText,
  Building2,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  Users,
  Shield,
  Zap,
  Wallet,
  Coins,
  Globe,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Plus,
  User,
  LogOut,
  CreditCard,
  Receipt,
  Banknote,
  PiggyBank,
  Briefcase,
  Factory,
  Truck,
  Store,
  ShoppingBag,
  FileSpreadsheet,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  Award,
  TrendingDown,
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  Ethereum,
  Database,
  Cloud,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Smartphone,
  Tablet,
  Monitor,
  Server,
  Network,
  Wifi,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Languages,
  HelpCircle,
  Info,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Share,
  Copy,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Tag,
  Hash,
  Percent,
  Minus,
  Equal,
  Divide,
  Plus as PlusIcon,
  X as XIcon,
  Check,
  AlertCircle,
  AlertOctagon,
  AlertSquare,
  Archive,
  Bookmark,
  BookOpen,
  Camera,
  Compass,
  Cpu,
  HardDrive,
  Headphones,
  Heart,
  Home,
  Image,
  Layers,
  LifeBuoy,
  Lightbulb,
  Map,
  MessageCircle,
  MessageSquare,
  Mic,
  MicOff,
  Monitor as MonitorIcon,
  MousePointer,
  Music,
  Paperclip,
  Phone as PhoneIcon,
  Play,
  PlayCircle,
  Power,
  Printer,
  Radio,
  Repeat,
  Rewind,
  RotateCw,
  Scissors,
  Send,
  SkipBack,
  SkipForward,
  Slash,
  Speaker,
  Square,
  StopCircle,
  ThumbsDown,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
  Tool,
  Type,
  Umbrella,
  Video,
  VideoOff,
  Voicemail,
  Volume1,
  Wifi as WifiIcon,
  WifiOff,
  Wind,
  Zap as ZapIcon,
  ZoomIn,
  ZoomOut,
  Crown,
} from "lucide-react"

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavigationItem[]
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    title: "Accounting",
    href: "/accounting",
    icon: Calculator,
    description: "Financial management",
    children: [
      { title: "Overview", href: "/accounting", icon: BarChart3 },
      { title: "Chart of Accounts", href: "/accounting/gl-accounts", icon: FileSpreadsheet },
      { title: "Journal Entries", href: "/accounting/journal-entries", icon: FileText },
      { title: "Bank Reconciliation", href: "/accounting/bank-reconciliation", icon: RefreshCw },
      { title: "Fiscal Year", href: "/accounting/fiscal-year", icon: Calendar },
      { title: "Petty Cash", href: "/accounting/petty-cash", icon: PiggyBank },
      { title: "Credit/Debit Notes", href: "/accounting/credit-debit-notes", icon: Receipt },
      { title: "Settings", href: "/accounting/settings", icon: Settings },
    ]
  },
  {
    title: "Invoicing",
    href: "/invoicing",
    icon: FileText,
    description: "Invoice management & compliance",
    children: [
      { title: "Overview", href: "/invoicing", icon: BarChart3 },
      { title: "Create Invoice", href: "/invoicing/create", icon: Plus },
      { title: "Invoice Templates", href: "/invoicing/templates", icon: FileText },
      { title: "E-Invoicing", href: "/invoicing/e-invoicing", icon: Globe },
      { title: "Compliance Rules", href: "/invoicing/compliance", icon: Shield },
      { title: "Digital Signatures", href: "/invoicing/signatures", icon: Key },
      { title: "Tax Management", href: "/invoicing/tax", icon: Percent },
      { title: "Settings", href: "/invoicing/settings", icon: Settings },
    ]
  },
  {
    title: "Banking",
    href: "/banking",
    icon: Building2,
    description: "Bank integration & transactions",
    children: [
      { title: "Overview", href: "/banking", icon: BarChart3 },
      { title: "Bank Accounts", href: "/banking/accounts", icon: CreditCard },
      { title: "Transactions", href: "/banking/transactions", icon: Activity },
      { title: "Reconciliation", href: "/banking/reconciliation", icon: RefreshCw },
      { title: "Bank Integration", href: "/banking/integration", icon: Link },
      { title: "Plaid Connect", href: "/banking/plaid", icon: Zap },
      { title: "Import/Export", href: "/banking/import-export", icon: Upload },
      { title: "Settings", href: "/banking/settings", icon: Settings },
    ]
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    description: "Stock management & tracking",
    children: [
      { title: "Overview", href: "/inventory", icon: BarChart3 },
      { title: "Items", href: "/inventory/items", icon: Package },
      { title: "Stock Movements", href: "/inventory/movements", icon: Truck },
      { title: "Categories", href: "/inventory/categories", icon: Tag },
      { title: "Valuation", href: "/inventory/valuation", icon: DollarSign },
      { title: "Reorder Points", href: "/inventory/reorder", icon: AlertTriangle },
      { title: "Barcode Scanning", href: "/inventory/barcode", icon: Camera },
      { title: "Settings", href: "/inventory/settings", icon: Settings },
    ]
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    description: "Sales management & CRM",
    children: [
      { title: "Overview", href: "/sales", icon: BarChart3 },
      { title: "Customers", href: "/sales/customers", icon: Users },
      { title: "Sales Orders", href: "/sales/orders", icon: ShoppingBag },
      { title: "Quotes", href: "/sales/quotes", icon: FileText },
      { title: "Sales Analytics", href: "/sales/analytics", icon: TrendingUp },
      { title: "Commission Tracking", href: "/sales/commission", icon: Award },
      { title: "Sales Pipeline", href: "/sales/pipeline", icon: Target },
      { title: "Settings", href: "/sales/settings", icon: Settings },
    ]
  },
  {
    title: "Purchase",
    href: "/purchase",
    icon: ShoppingBag,
    description: "Procurement & vendor management",
    children: [
      { title: "Overview", href: "/purchase", icon: BarChart3 },
      { title: "Vendors", href: "/purchase/vendors", icon: Building2 },
      { title: "Purchase Orders", href: "/purchase/orders", icon: FileText },
      { title: "Receiving", href: "/purchase/receiving", icon: Truck },
      { title: "Approvals", href: "/purchase/approvals", icon: CheckCircle },
      { title: "Vendor Analytics", href: "/purchase/analytics", icon: TrendingUp },
      { title: "Contract Management", href: "/purchase/contracts", icon: FileText },
      { title: "Settings", href: "/purchase/settings", icon: Settings },
    ]
  },
  {
    title: "Web3",
    href: "/web3",
    icon: Coins,
    description: "Blockchain & crypto integration",
    children: [
      { title: "Overview", href: "/web3", icon: BarChart3 },
      { title: "Crypto Wallets", href: "/web3/wallets", icon: Wallet },
      { title: "Transactions", href: "/web3/transactions", icon: Activity },
      { title: "DeFi Positions", href: "/web3/defi", icon: TrendingUp },
      { title: "Token Management", href: "/web3/tokens", icon: Coins },
      { title: "Blockchain Networks", href: "/web3/networks", icon: Network },
      { title: "Smart Contracts", href: "/web3/contracts", icon: FileText },
      { title: "Settings", href: "/web3/settings", icon: Settings },
    ]
  },
  {
    title: "AI Processing",
    href: "/ai-processing",
    icon: Zap,
    description: "AI-powered automation",
    children: [
      { title: "Overview", href: "/ai-processing", icon: BarChart3 },
      { title: "Document Processing", href: "/ai-processing/documents", icon: FileText },
      { title: "Transaction Categorization", href: "/ai-processing/categorization", icon: Tag },
      { title: "Fraud Detection", href: "/ai-processing/fraud", icon: Shield },
      { title: "Financial Forecasting", href: "/ai-processing/forecasting", icon: TrendingUp },
      { title: "AI Models", href: "/ai-processing/models", icon: Cpu },
      { title: "Processing Jobs", href: "/ai-processing/jobs", icon: Activity },
      { title: "Settings", href: "/ai-processing/settings", icon: Settings },
    ]
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Analytics & reporting",
    children: [
      { title: "Overview", href: "/reports", icon: BarChart3 },
      { title: "Financial Reports", href: "/reports/financial", icon: DollarSign },
      { title: "Tax Reports", href: "/reports/tax", icon: Percent },
      { title: "Compliance Reports", href: "/reports/compliance", icon: Shield },
      { title: "Custom Reports", href: "/reports/custom", icon: FileSpreadsheet },
      { title: "Scheduled Reports", href: "/reports/scheduled", icon: Clock },
      { title: "Export Options", href: "/reports/export", icon: Download },
      { title: "Settings", href: "/reports/settings", icon: Settings },
    ]
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    description: "Document management",
    children: [
      { title: "Overview", href: "/documents", icon: BarChart3 },
      { title: "All Documents", href: "/documents/all", icon: FileText },
      { title: "Upload Documents", href: "/documents/upload", icon: Upload },
      { title: "Document Templates", href: "/documents/templates", icon: FileText },
      { title: "OCR Processing", href: "/documents/ocr", icon: Eye },
      { title: "Document Workflow", href: "/documents/workflow", icon: Activity },
      { title: "Storage Management", href: "/documents/storage", icon: Database },
      { title: "Settings", href: "/documents/settings", icon: Settings },
    ]
  },
  {
    title: "Mobile",
    href: "/mobile",
    icon: Smartphone,
    description: "Mobile app features",
    children: [
      { title: "Dashboard", href: "/mobile/dashboard", icon: LayoutDashboard },
      { title: "Expenses", href: "/mobile/expenses", icon: Receipt },
      { title: "Invoices", href: "/mobile/invoices", icon: FileText },
      { title: "Approvals", href: "/mobile/approvals", icon: CheckCircle },
      { title: "Notifications", href: "/mobile/notifications", icon: Bell },
      { title: "Offline Mode", href: "/mobile/offline", icon: WifiOff },
      { title: "Mobile Settings", href: "/mobile/settings", icon: Settings },
    ]
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    description: "Platform administration",
    children: [
      { title: "Platform Admin", href: "/platform-admin", icon: Shield },
      { title: "Super Admin", href: "/super-admin", icon: Crown },
      { title: "User Management", href: "/admin/users", icon: Users },
      { title: "Tenant Management", href: "/admin/tenants", icon: Building2 },
      { title: "System Settings", href: "/admin/settings", icon: Settings },
      { title: "Security", href: "/admin/security", icon: Lock },
      { title: "Audit Logs", href: "/admin/audit", icon: FileText },
      { title: "Backup & Restore", href: "/admin/backup", icon: Database },
    ]
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { organization } = useOrganization()

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const isExpanded = (title: string) => expandedItems.includes(title)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="font-bold text-lg">OASYS</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Organization Info */}
          {organization && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{organization.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{organization.plan}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive(item.href) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded(item.title) && "rotate-180"
                        )} 
                      />
                    </button>
                    {isExpanded(item.title) && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActive(child.href) && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <child.icon className="h-4 w-4" />
                            <span>{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                {pathname !== "/" && (
                  <>
                    <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                    <span className="capitalize">
                      {pathname.split("/")[1] || "Overview"}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="hidden md:block w-80">
                <SearchComponent />
              </div>

              {/* Notifications */}
              <NotificationsComponent />

              {/* Theme Toggle */}
              <ModeToggle />

              {/* Quick Actions */}
              <Button size="sm" className="hidden md:flex">
                <Plus className="h-4 w-4 mr-2" />
                Quick Action
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

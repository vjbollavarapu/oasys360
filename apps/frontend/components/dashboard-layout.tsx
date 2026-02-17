"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import NextLink from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { SearchComponent } from "@/components/ui/search"
import { NotificationsComponent } from "@/components/ui/notifications"
import { useAuth } from "@/hooks/use-auth"
import { useOrganization } from "@/hooks/use-organization"
import { useNavigation } from "@/hooks/use-navigation"
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
  Link as LucideLinkIcon,
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
  href?: string  // Make href optional to match runtime behavior
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavigationItem[]
  description?: string
}

// Navigation items are now dynamically loaded based on user role and portal
// See: hooks/use-navigation.tsx and lib/navigation/config.ts

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { organization, currentOrganization } = useOrganization()
  const { navigationItems, isLoading: navigationLoading } = useNavigation()

  // Auto-expand parent menu items when their children are active
  useEffect(() => {
    if (!navigationItems.length || navigationLoading) return

    const activeParents: string[] = []
    
    navigationItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // Check if any child matches the current pathname (prioritize exact child matches)
        const hasActiveChild = item.children.some((child) => {
          if (!child.href) return false
          if (child.href === "/") {
            return pathname === "/"
          }
          // Check for exact match or pathname starts with child href
          return pathname === child.href || pathname.startsWith(child.href + "/")
        })
        
        // Also check if the parent's own href matches (for cases where parent is clickable)
        // But only if no child matches (to avoid expanding when on a child route)
        const isParentActive = !hasActiveChild && item.href && (
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        )
        
        if (hasActiveChild || isParentActive) {
          activeParents.push(item.title)
        }
      }
    })

    // Update expanded items to include active parents (preserve manually expanded items)
    if (activeParents.length > 0) {
      setExpandedItems(prev => {
        const newExpanded = [...new Set([...prev, ...activeParents])]
        return newExpanded
      })
    }
  }, [pathname, navigationItems, navigationLoading])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // Check if a navigation item is active
  // For parent items with children: only active if pathname exactly matches (not a child route)
  // For child items: active if pathname matches the child href
  const isActive = (href: string | undefined, hasChildren: boolean = false, children?: NavigationItem[]) => {
    if (!href) return false
    
    // Special case for root path
    if (href === "/") {
      return pathname === "/"
    }
    
    // If this item has children, check if any child is active first
    if (hasChildren && children && children.length > 0) {
      const hasActiveChild = children.some((child) => {
        if (!child.href) return false
        if (child.href === "/") {
          return pathname === "/"
        }
        // Check for exact match or pathname starts with child href + "/"
        return pathname === child.href || pathname.startsWith(child.href + "/")
      })
      
      // If a child is active, don't highlight the parent
      if (hasActiveChild) {
        return false
      }
      
      // If no child is active, check if parent href exactly matches pathname
      return pathname === href
    }
    
    // For items without children, check exact match first, then starts with
    if (pathname === href) {
      return true
    }
    
    // Use startsWith for items without children
    return pathname.startsWith(href + "/") || pathname.startsWith(href)
  }
  
  // Helper to check if a child item is active
  const isChildActive = (childHref: string | undefined) => {
    if (!childHref) return false
    if (childHref === "/") {
      return pathname === "/"
    }
    return pathname === childHref || pathname.startsWith(childHref + "/")
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
            <NextLink href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="font-bold text-lg">OASYS</span>
            </NextLink>
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
          {(organization || currentOrganization) && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{(organization || currentOrganization)?.name || 'Organization'}</p>
                  {(organization || currentOrganization)?.plan && (
                    <p className="text-xs text-muted-foreground truncate">{(organization || currentOrganization)?.plan}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : navigationItems.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No navigation items available
              </div>
            ) : (
              navigationItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive(item.href, true, item.children) && "bg-accent text-accent-foreground"
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
                        {item.children
                          .filter((child): child is NavigationItem & { href: string } => {
                            // Strict type guard: href must be a non-empty string
                            return Boolean(child?.href) && typeof child.href === 'string' && child.href.length > 0;
                          })
                          .map((child, index) => {
                            // Final runtime check before rendering Link
                            const href = child.href;
                            if (!href || typeof href !== 'string' || href.length === 0) {
                              console.warn(`Navigation item "${child.title}" has invalid href, skipping.`);
                              return null;
                            }
                            return (
                              <NextLink
                                key={href || `${child.title}-${index}`}
                                href={href}
                                className={cn(
                                  "flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                  isChildActive(href) && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <child.icon className="h-4 w-4" />
                                <span>{child.title}</span>
                              </NextLink>
                            );
                          })
                          .filter(Boolean) // Remove any null entries
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  item.href && typeof item.href === 'string' ? (
                    <NextLink
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive(item.href, false) && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NextLink>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  )
                )}
              </div>
            )))}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || user?.email || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role || 'Guest'}</p>
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

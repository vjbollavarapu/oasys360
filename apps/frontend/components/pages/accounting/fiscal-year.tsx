"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Percent,
  Activity,
  Target,
  Award,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Bell,
  BellOff,
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
} from "lucide-react"

interface FiscalYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "open" | "closed" | "locked"
  periods: FiscalPeriod[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  isCurrent: boolean
}

interface FiscalPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "open" | "closed" | "locked"
  revenue: number
  expenses: number
  netIncome: number
  isCurrent: boolean
}

export function FiscalYearOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([])
  const [selectedYear, setSelectedYear] = useState<FiscalYear | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Mock data
  useEffect(() => {
    setFiscalYears([
      {
        id: "1",
        name: "FY 2024",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        status: "open",
        isCurrent: true,
        totalRevenue: 1250000,
        totalExpenses: 850000,
        netIncome: 400000,
        periods: [
          {
            id: "1-1",
            name: "Q1 2024",
            startDate: "2024-01-01",
            endDate: "2024-03-31",
            status: "closed",
            isCurrent: false,
            revenue: 300000,
            expenses: 200000,
            netIncome: 100000
          },
          {
            id: "1-2",
            name: "Q2 2024",
            startDate: "2024-04-01",
            endDate: "2024-06-30",
            status: "closed",
            isCurrent: false,
            revenue: 350000,
            expenses: 225000,
            netIncome: 125000
          },
          {
            id: "1-3",
            name: "Q3 2024",
            startDate: "2024-07-01",
            endDate: "2024-09-30",
            status: "open",
            isCurrent: true,
            revenue: 400000,
            expenses: 275000,
            netIncome: 125000
          },
          {
            id: "1-4",
            name: "Q4 2024",
            startDate: "2024-10-01",
            endDate: "2024-12-31",
            status: "open",
            isCurrent: false,
            revenue: 200000,
            expenses: 150000,
            netIncome: 50000
          }
        ]
      },
      {
        id: "2",
        name: "FY 2023",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        status: "closed",
        isCurrent: false,
        totalRevenue: 1000000,
        totalExpenses: 700000,
        netIncome: 300000,
        periods: [
          {
            id: "2-1",
            name: "Q1 2023",
            startDate: "2023-01-01",
            endDate: "2023-03-31",
            status: "closed",
            isCurrent: false,
            revenue: 250000,
            expenses: 175000,
            netIncome: 75000
          },
          {
            id: "2-2",
            name: "Q2 2023",
            startDate: "2023-04-01",
            endDate: "2023-06-30",
            status: "closed",
            isCurrent: false,
            revenue: 275000,
            expenses: 190000,
            netIncome: 85000
          },
          {
            id: "2-3",
            name: "Q3 2023",
            startDate: "2023-07-01",
            endDate: "2023-09-30",
            status: "closed",
            isCurrent: false,
            revenue: 300000,
            expenses: 210000,
            netIncome: 90000
          },
          {
            id: "2-4",
            name: "Q4 2023",
            startDate: "2023-10-01",
            endDate: "2023-12-31",
            status: "closed",
            isCurrent: false,
            revenue: 175000,
            expenses: 125000,
            netIncome: 50000
          }
        ]
      }
    ])
  }, [])

  const currentYear = fiscalYears.find(year => year.isCurrent)

  const handleClosePeriod = async (yearId: string, periodId: string) => {
    setFiscalYears(prev => prev.map(year => 
      year.id === yearId 
        ? {
            ...year,
            periods: year.periods.map(period => 
              period.id === periodId 
                ? { ...period, status: "closed" as const }
                : period
            )
          }
        : year
    ))
  }

  const handleLockPeriod = async (yearId: string, periodId: string) => {
    setFiscalYears(prev => prev.map(year => 
      year.id === yearId 
        ? {
            ...year,
            periods: year.periods.map(period => 
              period.id === periodId 
                ? { ...period, status: "locked" as const }
                : period
            )
          }
        : year
    ))
  }

  const handleCloseYear = async (yearId: string) => {
    setFiscalYears(prev => prev.map(year => 
      year.id === yearId 
        ? { ...year, status: "closed" as const }
        : year
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "closed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "locked": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fiscal Year Management</h1>
          <p className="text-muted-foreground">
            Manage fiscal years, periods, and financial closing processes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" disabled={isLoading}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            New Fiscal Year
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="periods">Periods</TabsTrigger>
          <TabsTrigger value="closing">Closing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Fiscal Year Summary */}
          {currentYear && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Current Fiscal Year: {currentYear.name}</span>
                  <Badge className={getStatusColor(currentYear.status)}>
                    {currentYear.status.charAt(0).toUpperCase() + currentYear.status.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentYear.startDate} to {currentYear.endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(currentYear.totalRevenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(currentYear.totalExpenses)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(currentYear.netIncome)}
                    </div>
                    <div className="text-sm text-muted-foreground">Net Income</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Fiscal Years */}
          <div className="space-y-4">
            {fiscalYears.map((year) => (
              <Card key={year.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{year.name}</span>
                        {year.isCurrent && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Current
                          </Badge>
                        )}
                        <Badge className={getStatusColor(year.status)}>
                          {year.status.charAt(0).toUpperCase() + year.status.slice(1)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {year.startDate} to {year.endDate}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {year.status === "open" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCloseYear(year.id)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Close Year
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {formatCurrency(year.totalRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expenses:</span>
                      <span className="ml-2 font-medium text-red-600">
                        {formatCurrency(year.totalExpenses)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Income:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {formatCurrency(year.netIncome)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          {currentYear && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fiscal Periods - {currentYear.name}</CardTitle>
                  <CardDescription>
                    Manage quarterly and monthly periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentYear.periods.map((period) => (
                      <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{period.name}</h3>
                            {period.isCurrent && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                Current
                              </Badge>
                            )}
                            <Badge className={getStatusColor(period.status)}>
                              {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {period.startDate} to {period.endDate}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="ml-2 font-medium text-green-600">
                                {formatCurrency(period.revenue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expenses:</span>
                              <span className="ml-2 font-medium text-red-600">
                                {formatCurrency(period.expenses)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Net Income:</span>
                              <span className="ml-2 font-medium text-blue-600">
                                {formatCurrency(period.netIncome)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {period.status === "open" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClosePeriod(currentYear.id, period.id)}
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Close
                              </Button>
                            </>
                          )}
                          {period.status === "closed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLockPeriod(currentYear.id, period.id)}
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Lock
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="closing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Closing Process</CardTitle>
              <CardDescription>
                Step-by-step process for closing fiscal periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">1. Review All Transactions</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure all transactions are posted and reconciled
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
                
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">2. Run Closing Entries</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate depreciation, accruals, and other closing entries
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Generate</Button>
                </div>
                
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">3. Review Financial Statements</h3>
                    <p className="text-sm text-muted-foreground">
                      Review P&L, Balance Sheet, and Cash Flow statements
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
                
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">4. Close Period</h3>
                    <p className="text-sm text-muted-foreground">
                      Lock the period to prevent further modifications
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Close</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fiscal Year Reports</CardTitle>
              <CardDescription>
                Generate and view fiscal year reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Income Statement</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Balance Sheet</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Cash Flow</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  <span>Period Comparison</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

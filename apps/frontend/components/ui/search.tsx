"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  X, 
  Filter, 
  SlidersHorizontal,
  Clock,
  FileText,
  User,
  Building2,
  DollarSign,
  Calendar,
  Tag,
  Hash,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Check,
  Plus,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Star,
  Bookmark,
  Share,
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
  AlertTriangle,
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

interface SearchResult {
  id: string
  type: string
  title: string
  description: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  tags: string[]
  lastModified: string
  relevance: number
}

interface SearchFilter {
  type: string[]
  dateRange: string
  tags: string[]
  status: string[]
}

export function SearchComponent() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [filters, setFilters] = useState<SearchFilter>({
    type: [],
    dateRange: "all",
    tags: [],
    status: []
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "invoice",
      title: "Invoice INV-2024-001",
      description: "Outstanding invoice for Acme Corporation",
      url: "/invoicing/invoices/1",
      icon: FileText,
      tags: ["outstanding", "acme", "b2b"],
      lastModified: "2024-01-15",
      relevance: 0.95
    },
    {
      id: "2",
      type: "customer",
      title: "Acme Corporation",
      description: "B2B customer with outstanding balance",
      url: "/sales/customers/1",
      icon: Building2,
      tags: ["b2b", "active", "outstanding"],
      lastModified: "2024-01-14",
      relevance: 0.88
    },
    {
      id: "3",
      type: "transaction",
      title: "Payment Received - $5,000",
      description: "Payment from Tech Solutions Ltd",
      url: "/banking/transactions/1",
      icon: DollarSign,
      tags: ["payment", "received", "tech-solutions"],
      lastModified: "2024-01-13",
      relevance: 0.82
    },
    {
      id: "4",
      type: "document",
      title: "Q4 Financial Report",
      description: "Quarterly financial report for 2023",
      url: "/documents/reports/1",
      icon: FileText,
      tags: ["report", "financial", "q4-2023"],
      lastModified: "2024-01-12",
      relevance: 0.75
    }
  ]

  // Mock suggestions
  const mockSuggestions = [
    "invoice",
    "customer",
    "payment",
    "report",
    "transaction",
    "document",
    "acme",
    "tech solutions",
    "financial",
    "outstanding"
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setResults([])
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Filter mock results based on query
    const filteredResults = mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    
    setResults(filteredResults)
    setIsSearching(false)
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)])
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    
    if (value.trim()) {
      // Show suggestions
      const filteredSuggestions = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filteredSuggestions.slice(0, 5))
      
      // Debounced search
      const timeoutId = setTimeout(() => handleSearch(value), 300)
      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
    setSuggestions([])
  }

  const handleResultClick = (result: SearchResult) => {
    // Navigate to result
    window.location.href = result.url
    setResults([])
    setQuery("")
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setSuggestions([])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "invoice": return FileText
      case "customer": return Building2
      case "transaction": return DollarSign
      case "document": return FileText
      case "user": return User
      case "report": return BarChart3
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "invoice": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "customer": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "transaction": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "document": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "user": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      case "report": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search invoices, customers, transactions..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {(results.length > 0 || suggestions.length > 0 || recentSearches.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Suggestions</h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-sm flex items-center space-x-2"
                    >
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-accent text-sm flex items-center space-x-2"
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {isSearching ? "Searching..." : `${results.length} results found`}
                </h3>
                <div className="space-y-2">
                  {results.map((result) => {
                    const TypeIcon = getTypeIcon(result.type)
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium truncate">{result.title}</h4>
                              <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                {result.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(result.relevance * 100)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Modified: {result.lastModified}</span>
                              <div className="flex items-center space-x-1">
                                {result.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {result.tags.length > 3 && (
                                  <span>+{result.tags.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {query && !isSearching && results.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try different keywords or check your spelling</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Advanced Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="space-y-2 mt-2">
                    {["invoice", "customer", "transaction", "document", "user", "report"].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, type: [...prev.type, type] }))
                            } else {
                              setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full mt-2 p-2 border rounded text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setFilters({
                  type: [],
                  dateRange: "all",
                  tags: [],
                  status: []
                })}>
                  Clear Filters
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

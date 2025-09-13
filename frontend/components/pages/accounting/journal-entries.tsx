"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  AlertTriangle,
  Check,
  X,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Save,
  Send,
  Printer,
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
  User,
  Users,
  Building2,
  CreditCard,
  Banknote,
  Receipt,
  PiggyBank,
  Briefcase,
  Factory,
  Truck,
  Store,
  ShoppingBag,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Percent,
  Calculator,
  Settings,
  Database,
  Cloud,
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
  Monitor,
  MousePointer,
  Music,
  Paperclip,
  Play,
  PlayCircle,
  Power,
  Printer as PrinterIcon,
  Radio,
  Repeat,
  Rewind,
  RotateCw,
  Scissors,
  Send as SendIcon,
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
  WifiOff,
  Wind,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  description: string
  reference: string
  status: "draft" | "posted" | "approved" | "rejected"
  totalDebit: number
  totalCredit: number
  lineItems: JournalLineItem[]
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
}

interface JournalLineItem {
  id: string
  accountCode: string
  accountName: string
  description: string
  debit: number
  credit: number
  taxCode?: string
  taxAmount?: number
}

export function JournalEntriesOverview() {
  const [activeTab, setActiveTab] = useState("entries")
  const [isLoading, setIsLoading] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Mock data
  useEffect(() => {
    setEntries([
      {
        id: "1",
        entryNumber: "JE-2024-001",
        date: "2024-01-15",
        description: "Monthly depreciation expense",
        reference: "DEP-2024-01",
        status: "posted",
        totalDebit: 5000,
        totalCredit: 5000,
        lineItems: [
          {
            id: "1-1",
            accountCode: "5000",
            accountName: "Depreciation Expense",
            description: "Monthly depreciation",
            debit: 5000,
            credit: 0
          },
          {
            id: "1-2",
            accountCode: "1500",
            accountName: "Accumulated Depreciation",
            description: "Monthly depreciation",
            debit: 0,
            credit: 5000
          }
        ],
        createdBy: "John Doe",
        createdAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "2",
        entryNumber: "JE-2024-002",
        date: "2024-01-16",
        description: "Accrued interest expense",
        reference: "INT-2024-01",
        status: "draft",
        totalDebit: 2500,
        totalCredit: 2500,
        lineItems: [
          {
            id: "2-1",
            accountCode: "6000",
            accountName: "Interest Expense",
            description: "Accrued interest",
            debit: 2500,
            credit: 0
          },
          {
            id: "2-2",
            accountCode: "2200",
            accountName: "Accrued Interest Payable",
            description: "Accrued interest",
            debit: 0,
            credit: 2500
          }
        ],
        createdBy: "Jane Smith",
        createdAt: "2024-01-16T14:30:00Z"
      }
    ])
  }, [])

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    const matchesDate = dateFilter === "all" || entry.date.includes(dateFilter)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleCreateEntry = () => {
    setIsCreateOpen(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsEditOpen(true)
  }

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      setEntries(prev => prev.filter(entry => entry.id !== id))
    }
  }

  const handleApproveEntry = async (id: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, status: "approved", approvedBy: "Current User", approvedAt: new Date().toISOString() }
        : entry
    ))
  }

  const handleRejectEntry = async (id: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, status: "rejected" }
        : entry
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "approved": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "draft": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
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
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground">
            Create and manage journal entries with approval workflow
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={isLoading}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateEntry} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">All Entries</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="2024-01">January 2024</SelectItem>
                    <SelectItem value="2024-02">February 2024</SelectItem>
                    <SelectItem value="2024-03">March 2024</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Entries List */}
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{entry.entryNumber}</h3>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                      </div>
                      
                      <p className="text-sm font-medium mb-1">{entry.description}</p>
                      <p className="text-sm text-muted-foreground mb-3">Ref: {entry.reference}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Debit:</span>
                          <span className="ml-2 font-medium">{formatCurrency(entry.totalDebit)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Credit:</span>
                          <span className="ml-2 font-medium">{formatCurrency(entry.totalCredit)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                        <span>Created by: {entry.createdBy}</span>
                        <span>Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
                        {entry.approvedBy && (
                          <span>Approved by: {entry.approvedBy}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {entry.status === "draft" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {entry.status === "posted" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveEntry(entry.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No draft entries found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending entries found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posted" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posted entries found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
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
import { accountingService } from '@/lib/api-services'
import { useErrorHandler } from '@/hooks/use-error-handler'
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
  entry_number?: string
  entryNumber?: string
  date: string
  description: string
  reference: string
  status: "draft" | "posted" | "approved" | "rejected"
  total_debit?: number | string
  totalDebit?: number
  total_credit?: number | string
  totalCredit?: number
  lines?: JournalLineItem[]
  lineItems?: JournalLineItem[]
  created_by_name?: string
  createdBy?: string
  created_at?: string
  createdAt?: string
  approved_by_name?: string
  approvedBy?: string
  approved_at?: string
  approvedAt?: string
  posted_at?: string
  notes?: string
}

interface JournalLineItem {
  id: string
  account?: {
    id: string
    code: string
    name: string
  }
  account_code?: string
  accountCode?: string
  account_name?: string
  accountName?: string
  description: string
  debit_amount?: number | string
  debit?: number
  credit_amount?: number | string
  credit?: number
  taxCode?: string
  taxAmount?: number
}

export function JournalEntriesOverview() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [activeTab, setActiveTab] = useState("entries")
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Load journal entries from backend
  const loadEntries = async () => {
    await withErrorHandling(async () => {
      setIsLoading(true);
      const response = await accountingService.getJournalEntries({
        limit: 100,
        ...(searchQuery && { search: searchQuery }),
      });
      
      if (response.success && response.data) {
        const entriesData = response.data.results || response.data || [];
        // Normalize entry data structure
        const normalizedEntries = entriesData.map((entry: any) => ({
          id: entry.id,
          entryNumber: entry.entry_number || entry.reference || `JE-${entry.id.slice(0, 8)}`,
          entry_number: entry.entry_number || entry.reference,
          date: entry.date,
          description: entry.description || '',
          reference: entry.reference || '',
          status: entry.status || 'draft',
          totalDebit: parseFloat(entry.total_debit || entry.totalDebit || 0),
          total_debit: entry.total_debit || entry.totalDebit,
          totalCredit: parseFloat(entry.total_credit || entry.totalCredit || 0),
          total_credit: entry.total_credit || entry.totalCredit,
          lines: entry.lines || [],
          lineItems: entry.lines || [],
          createdBy: entry.created_by_name || entry.created_by?.name || 'Unknown',
          created_by_name: entry.created_by_name,
          createdAt: entry.created_at || entry.createdAt,
          created_at: entry.created_at,
          approvedBy: entry.approved_by_name || entry.approved_by?.name,
          approved_by_name: entry.approved_by_name,
          approvedAt: entry.approved_at || entry.approvedAt,
          posted_at: entry.posted_at,
        }));
        setEntries(normalizedEntries);
      }
    });
    setIsLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, [searchQuery]);

  const filteredEntries = entries.filter(entry => {
    const entryNum = entry.entryNumber || entry.entry_number || entry.reference || '';
    const matchesSearch = entryNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    const matchesDate = dateFilter === "all" || entry.date?.includes(dateFilter)
    
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
    if (!confirm("Are you sure you want to delete this journal entry?")) {
      return;
    }
    
    try {
      const response = await accountingService.deleteJournalEntry(id);
      if (response.success) {
        await loadEntries();
      } else {
        handleError(new Error(response.message || 'Failed to delete journal entry'));
      }
    } catch (error) {
      handleError(error, 'Failed to delete journal entry');
    }
  }

  const handlePostEntry = async (id: string) => {
    try {
      const response = await accountingService.postJournalEntry(id);
      if (response.success) {
        await loadEntries();
      } else {
        handleError(new Error(response.message || 'Failed to post journal entry'));
      }
    } catch (error) {
      handleError(error, 'Failed to post journal entry');
    }
  }

  const handleUnpostEntry = async (id: string) => {
    try {
      const response = await accountingService.unpostJournalEntry(id);
      if (response.success) {
        await loadEntries();
      } else {
        handleError(new Error(response.message || 'Failed to unpost journal entry'));
      }
    } catch (error) {
      handleError(error, 'Failed to unpost journal entry');
    }
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
            Create and manage journal entries with posting workflow
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            disabled={isLoading}
            onClick={loadEntries}
            className="rounded-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" disabled={isLoading} className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateEntry} disabled={isLoading} className="rounded-full">
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
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full"
                  onClick={loadEntries}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Entries List */}
          {isLoading ? (
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardContent className="p-12">
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No journal entries found</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 rounded-full"
                    onClick={handleCreateEntry}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const entryNum = entry.entryNumber || entry.entry_number || entry.reference || 'N/A';
                const totalDebit = entry.totalDebit || parseFloat(entry.total_debit as string || '0');
                const totalCredit = entry.totalCredit || parseFloat(entry.total_credit as string || '0');
                const createdBy = entry.createdBy || entry.created_by_name || 'Unknown';
                const createdAt = entry.createdAt || entry.created_at || '';
                
                return (
                  <Card key={entry.id} className="rounded-4xl shadow-soft dark:shadow-soft-dark hover:shadow-lg transition-shadow border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{entryNum}</h3>
                            <Badge className={`rounded-full ${getStatusColor(entry.status)}`}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{entry.date}</span>
                          </div>
                          
                          <p className="text-sm font-medium mb-1">{entry.description}</p>
                          {entry.reference && (
                            <p className="text-sm text-muted-foreground mb-3">Ref: {entry.reference}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Debit:</span>
                              <span className="ml-2 font-medium text-green-600">{formatCurrency(totalDebit)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Credit:</span>
                              <span className="ml-2 font-medium text-blue-600">{formatCurrency(totalCredit)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                            <span>Created by: {createdBy}</span>
                            {createdAt && (
                              <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
                            )}
                            {entry.posted_at && (
                              <span>Posted: {new Date(entry.posted_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {entry.status === "draft" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => handleEditEntry(entry)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-green-600 hover:text-green-700"
                                onClick={() => handlePostEntry(entry.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {entry.status === "posted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-orange-600 hover:text-orange-700"
                              onClick={() => handleUnpostEntry(entry.id)}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No draft entries found</p>
                <p className="text-sm mt-2">Draft entries will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending entries found</p>
                <p className="text-sm mt-2">Pending approval entries will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posted" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posted entries found</p>
                <p className="text-sm mt-2">Posted entries will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
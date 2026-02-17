"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Settings,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  XCircle
} from "lucide-react"
import { salesService } from "@/lib/api-services"
import { useErrorHandler } from "@/hooks/use-error-handler"

export function QuotesOverview() {
  const { withErrorHandling } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [quotes, setQuotes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadQuotes = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      const response = await salesService.getSalesQuotes({
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      
      if (response.success && response.data) {
        setQuotes(response.data.results || response.data)
      }
    })
    setLoading(false)
  }

  useEffect(() => {
    loadQuotes()
  }, [searchTerm, statusFilter])

  const totalQuotes = quotes.length
  const pendingQuotes = quotes.filter((q: any) => q.status === 'draft' || q.status === 'sent' || q.status === 'viewed').length
  const acceptedQuotes = quotes.filter((q: any) => q.status === 'accepted').length
  const totalValue = quotes.reduce((sum: number, quote: any) => sum + (parseFloat(quote.total_amount) || 0), 0)

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected':
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0)
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Quotes</h1>
          <p className="text-muted-foreground">
            Create and manage sales quotes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Quotes</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuotes}</div>
                <p className="text-xs text-muted-foreground mt-2">All quotes</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Quotes</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingQuotes}</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accepted Quotes</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{acceptedQuotes}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0}% acceptance rate
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <p className="text-xs text-muted-foreground mt-2">Quote value</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>
                Latest quotes and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : quotes.length > 0 ? (
                <div className="space-y-4">
                  {quotes.slice(0, 5).map((quote: any) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          quote.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/20' :
                          quote.status === 'rejected' || quote.status === 'expired' ? 'bg-red-100 dark:bg-red-900/20' :
                          quote.status === 'sent' || quote.status === 'viewed' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            quote.status === 'accepted' ? 'text-green-600 dark:text-green-400' :
                            quote.status === 'rejected' || quote.status === 'expired' ? 'text-red-600 dark:text-red-400' :
                            quote.status === 'sent' || quote.status === 'viewed' ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{quote.quote_number || `Quote #${quote.id?.slice(0, 8)}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {quote.customer_name || quote.customer || 'N/A'} - {formatCurrency(quote.total_amount)} - {quote.status || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`rounded-full ${getStatusBadgeColor(quote.status || '')}`}>
                          {quote.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No quotes found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Quote Management</CardTitle>
              <CardDescription>
                View and manage sales quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search quotes..." 
                      className="pl-8 rounded-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quotes</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="viewed">Viewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : quotes.length > 0 ? (
                  <div className="space-y-4">
                    {quotes.map((quote: any) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 border rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{quote.quote_number || `Quote #${quote.id?.slice(0, 8)}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {quote.customer_name || quote.customer || 'N/A'} - {formatCurrency(quote.total_amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Badge className={`rounded-full ${getStatusBadgeColor(quote.status || '')}`}>
                            {quote.status || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quotes found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Quote Templates</CardTitle>
              <CardDescription>
                Manage quote templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Quote templates will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

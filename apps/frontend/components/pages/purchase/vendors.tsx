"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Eye,
  Plus,
  Search,
  Loader2,
  TrendingUp
} from "lucide-react"
import { purchaseService } from "@/lib/api-services"
import { useErrorHandler } from "@/hooks/use-error-handler"

export function VendorsOverview() {
  const { withErrorHandling } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadSuppliers = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      const response = await purchaseService.getSuppliers({
        search: searchTerm || undefined,
        is_active: statusFilter === "all" ? undefined : statusFilter === "active",
      })
      
      if (response.success && response.data) {
        setSuppliers(response.data.results || response.data)
      }
    })
    setLoading(false)
  }

  const loadSummary = async () => {
    await withErrorHandling(async () => {
      const response = await purchaseService.getSupplierSummary()
      if (response.success && response.data) {
        setSummary(response.data)
      }
    })
  }

  useEffect(() => {
    loadSuppliers()
    loadSummary()
  }, [searchTerm, statusFilter])

  const totalSuppliers = summary?.total || suppliers.length || 0
  const approvedSuppliers = summary?.approved || suppliers.filter((s: any) => s.is_approved || s.status === 'approved').length || 0
  const pendingSuppliers = summary?.pending || suppliers.filter((s: any) => !s.is_approved && s.status !== 'approved').length || 0

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor relationships and information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendors</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSuppliers}</div>
                <p className="text-xs text-muted-foreground mt-2">Active vendors</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedSuppliers}</div>
                <p className="text-xs text-muted-foreground mt-2">Approved vendors</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingSuppliers}</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Performers</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground mt-2">High-rated vendors</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Vendors</CardTitle>
              <CardDescription>
                Latest vendor additions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : suppliers.length > 0 ? (
                <div className="space-y-4">
                  {suppliers.slice(0, 5).map((supplier: any) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name || supplier.company_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {supplier.email || supplier.contact_email || 'No email'} - {supplier.supplier_type || 'Vendor'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`rounded-full ${
                          (supplier.is_approved || supplier.status === 'approved') 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {(supplier.is_approved || supplier.status === 'approved') ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vendors found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>
                View and manage vendor information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search vendors..." 
                      className="pl-8 rounded-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : suppliers.length > 0 ? (
                  <div className="space-y-4">
                    {suppliers.map((supplier: any) => (
                      <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{supplier.name || supplier.company_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.email || supplier.contact_email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Badge className={`rounded-full ${
                            (supplier.is_approved || supplier.status === 'approved') 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          }`}>
                            {(supplier.is_approved || supplier.status === 'approved') ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vendors found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Vendor Performance</CardTitle>
              <CardDescription>
                Vendor performance metrics and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Vendor performance interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

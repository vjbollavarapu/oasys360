"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Settings,
  TrendingUp,
  Loader2
} from "lucide-react"
import { salesService } from "@/lib/api-services"
import { useErrorHandler } from "@/hooks/use-error-handler"

export function CustomersOverview() {
  const { withErrorHandling } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadCustomers = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      const response = await salesService.getCustomers({
        search: searchTerm || undefined,
        is_active: statusFilter === "all" ? undefined : statusFilter === "active",
      })
      
      if (response.success && response.data) {
        setCustomers(response.data.results || response.data)
      }
    })
    setLoading(false)
  }

  const loadSummary = async () => {
    await withErrorHandling(async () => {
      const response = await salesService.getCustomerSummary()
      if (response.success && response.data) {
        setSummary(response.data)
      }
    })
  }

  useEffect(() => {
    loadCustomers()
    loadSummary()
  }, [searchTerm, statusFilter])

  const totalCustomers = summary?.total || customers.length || 0
  const activeCustomers = summary?.active || customers.filter((c: any) => c.is_active).length || 0
  const newThisMonth = summary?.new_this_month || 0

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer relationships and data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-2">All customers</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-2">{totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% of total</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newThisMonth}</div>
                <p className="text-xs text-muted-foreground mt-2">New customers</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customer Segments</CardTitle>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                  <Filter className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground mt-2">Active segments</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>
                Latest customer additions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : customers.length > 0 ? (
                <div className="space-y-4">
                  {customers.slice(0, 5).map((customer: any) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name || customer.company_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.email || customer.contact_email || 'No email'} - {customer.customer_type || 'Customer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`rounded-full ${customer.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No customers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage customer information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search customers..." 
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
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : customers.length > 0 ? (
                  <div className="space-y-4">
                    {customers.map((customer: any) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name || customer.company_name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.email || customer.contact_email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Badge className={`rounded-full ${customer.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}`}>
                            {customer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No customers found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Manage customer segments and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Customer segments interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Eye,
  Plus,
  DollarSign,
  Loader2
} from "lucide-react"
import { purchaseService } from "@/lib/api-services"
import { useErrorHandler } from "@/hooks/use-error-handler"

export function PurchaseOrdersOverview() {
  const { withErrorHandling } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadOrders = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      const response = await purchaseService.getPurchaseOrders({
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      
      if (response.success && response.data) {
        setOrders(response.data.results || response.data)
      }
    })
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [searchTerm, statusFilter])

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'draft').length
  const approvedOrders = orders.filter((o: any) => o.status === 'approved').length
  const totalValue = orders.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount || order.total) || 0), 0)

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'received':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
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
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and requisitions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-2">All orders</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting approval</p>
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
                <div className="text-2xl font-bold">{approvedOrders}</div>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
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
                <p className="text-xs text-muted-foreground mt-2">Order value</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                          order.status === 'pending' || order.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          <ShoppingCart className={`h-5 w-5 ${
                            order.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                            order.status === 'pending' || order.status === 'draft' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{order.order_number || order.po_number || `PO #${order.id?.slice(0, 8)}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.supplier_name || order.supplier || 'N/A'} - {formatCurrency(order.total_amount || order.total)} - {order.status || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`rounded-full ${getStatusBadgeColor(order.status || '')}`}>
                          {order.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No purchase orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Search orders..." 
                      className="rounded-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{order.order_number || order.po_number || `PO #${order.id?.slice(0, 8)}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.supplier_name || order.supplier || 'N/A'} - {formatCurrency(order.total_amount || order.total)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Badge className={`rounded-full ${getStatusBadgeColor(order.status || '')}`}>
                            {order.status || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No purchase orders found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisitions" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Purchase Requisitions</CardTitle>
              <CardDescription>
                Manage purchase requisitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Purchase requisitions interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

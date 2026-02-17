"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Users,
  Building2,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BillingData {
  tenants: TenantBilling[]
  subscriptions: SubscriptionBilling[]
  payments: PaymentRecord[]
  revenue: RevenueMetrics
}

interface TenantBilling {
  id: string
  name: string
  type: 'business' | 'firm'
  subscriptionPlan: string
  billingCycle: 'monthly' | 'yearly'
  amount: number
  status: 'active' | 'overdue' | 'cancelled' | 'pending'
  nextBillingDate: string
  lastPayment: string
  totalRevenue: number
  paymentMethod: string
  createdAt: string
}

interface SubscriptionBilling {
  id: string
  planName: string
  planType: string
  activeSubscriptions: number
  totalRevenue: number
  averageRevenue: number
  churnRate: number
}

interface PaymentRecord {
  id: string
  tenantName: string
  amount: number
  date: string
  status: 'completed' | 'failed' | 'pending' | 'refunded'
  paymentMethod: string
  invoiceId: string
}

interface RevenueMetrics {
  totalMRR: number
  totalARR: number
  growthRate: number
  activeSubscriptions: number
  churnRate: number
  averageRevenuePerTenant: number
}

export function BillingManagement() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTenant, setSelectedTenant] = useState<TenantBilling | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with real API call
      const mockData: BillingData = {
        tenants: [
          {
            id: 'tenant-1',
            name: 'oasys360 Solutions',
            type: 'business',
            subscriptionPlan: 'AI + Full Web3',
            billingCycle: 'monthly',
            amount: 449,
            status: 'active',
            nextBillingDate: '2024-02-22',
            lastPayment: '2024-01-22',
            totalRevenue: 4490,
            paymentMethod: 'Credit Card ****1234',
            createdAt: '2023-11-22'
          },
          {
            id: 'tenant-2',
            name: 'Global Accounting Firm',
            type: 'firm',
            subscriptionPlan: 'Professional',
            billingCycle: 'yearly',
            amount: 699,
            status: 'active',
            nextBillingDate: '2024-12-15',
            lastPayment: '2023-12-15',
            totalRevenue: 8388,
            paymentMethod: 'Bank Transfer',
            createdAt: '2022-12-15'
          },
          {
            id: 'tenant-3',
            name: 'StartupCorp',
            type: 'business',
            subscriptionPlan: 'AI Core',
            billingCycle: 'monthly',
            amount: 99,
            status: 'overdue',
            nextBillingDate: '2024-01-15',
            lastPayment: '2023-12-15',
            totalRevenue: 1188,
            paymentMethod: 'Credit Card ****5678',
            createdAt: '2023-01-15'
          }
        ],
        subscriptions: [
          {
            id: 'ai_core',
            planName: 'AI Core',
            planType: 'ai_core',
            activeSubscriptions: 45,
            totalRevenue: 4455,
            averageRevenue: 99,
            churnRate: 5.2
          },
          {
            id: 'ai_full_web3',
            planName: 'AI + Full Web3',
            planType: 'ai_full_web3',
            activeSubscriptions: 23,
            totalRevenue: 10327,
            averageRevenue: 449,
            churnRate: 3.1
          },
          {
            id: 'firm_professional',
            planName: 'Firm Professional',
            planType: 'firm_professional',
            activeSubscriptions: 12,
            totalRevenue: 8388,
            averageRevenue: 699,
            churnRate: 1.8
          }
        ],
        payments: [
          {
            id: 'pay-1',
            tenantName: 'oasys360 Solutions',
            amount: 449,
            date: '2024-01-22',
            status: 'completed',
            paymentMethod: 'Credit Card',
            invoiceId: 'INV-2024-001'
          },
          {
            id: 'pay-2',
            tenantName: 'Global Accounting Firm',
            amount: 8388,
            date: '2023-12-15',
            status: 'completed',
            paymentMethod: 'Bank Transfer',
            invoiceId: 'INV-2023-099'
          }
        ],
        revenue: {
          totalMRR: 24567,
          totalARR: 294804,
          growthRate: 15.3,
          activeSubscriptions: 80,
          churnRate: 3.4,
          averageRevenuePerTenant: 307
        }
      }
      setBillingData(mockData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTenants = billingData?.tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
      case 'refunded':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading billing data...
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Failed to load billing data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-blue-900">${billingData.revenue.totalMRR.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">+{billingData.revenue.growthRate}% growth</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Annual Recurring Revenue</p>
                <p className="text-2xl font-bold text-green-900">${billingData.revenue.totalARR.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Projected annual</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-purple-900">{billingData.revenue.activeSubscriptions}</p>
                <p className="text-xs text-purple-600 mt-1">Total tenants</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Average Revenue</p>
                <p className="text-2xl font-bold text-orange-900">${billingData.revenue.averageRevenuePerTenant}</p>
                <p className="text-xs text-orange-600 mt-1">Per tenant/month</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="tenants" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Tenant Billing
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Tenant Billing Management</CardTitle>
                  <CardDescription className="text-blue-600">
                    Manage billing for all tenants and subscriptions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mt-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 border-blue-200">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants?.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">{tenant.name}</p>
                            <p className="text-sm text-blue-600">{tenant.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.subscriptionPlan}</p>
                          <p className="text-sm text-muted-foreground">{tenant.billingCycle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">${tenant.amount}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {tenant.nextBillingDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">${tenant.totalRevenue.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Subscription Plan Analytics</CardTitle>
              <CardDescription className="text-blue-600">
                Performance metrics for each subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {billingData.subscriptions.map((plan) => (
                  <Card key={plan.id} className="bg-white border-blue-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-blue-900">{plan.planName}</h3>
                          <p className="text-sm text-blue-600">{plan.activeSubscriptions} active subscriptions</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-600">Total Revenue</span>
                            <span className="font-semibold text-blue-900">${plan.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-600">Average Revenue</span>
                            <span className="font-semibold text-blue-900">${plan.averageRevenue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-600">Churn Rate</span>
                            <span className="font-semibold text-blue-900">{plan.churnRate}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Payment History</CardTitle>
              <CardDescription className="text-blue-600">
                Recent payment transactions and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <p className="font-medium text-blue-900">{payment.tenantName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {payment.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="text-blue-600">
                          {payment.invoiceId}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
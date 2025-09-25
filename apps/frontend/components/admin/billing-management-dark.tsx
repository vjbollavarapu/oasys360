"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export function BillingManagementDark() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
            name: 'TechFlow Solutions',
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
            tenantName: 'TechFlow Solutions',
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
          },
          {
            id: 'pay-3',
            tenantName: 'StartupCorp',
            amount: 99,
            date: '2024-01-15',
            status: 'failed',
            paymentMethod: 'Credit Card',
            invoiceId: 'INV-2024-002'
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
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
      case 'refunded':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00FFC6]" />
          <span className="text-[#F3F4F6]">Loading billing data...</span>
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#F3F4F6]/60">Failed to load billing data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1B1D23] border-[#4B0082]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F3F4F6]/80">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-[#00FFC6]">${billingData.revenue.totalMRR.toLocaleString()}</p>
                <p className="text-xs text-green-400 mt-1">+{billingData.revenue.growthRate}% growth</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#4B0082]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1B1D23] border-[#4B0082]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F3F4F6]/80">Annual Recurring Revenue</p>
                <p className="text-2xl font-bold text-[#00FFC6]">${billingData.revenue.totalARR.toLocaleString()}</p>
                <p className="text-xs text-[#F3F4F6]/60 mt-1">Projected annual</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#4B0082]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1B1D23] border-[#4B0082]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F3F4F6]/80">Active Subscriptions</p>
                <p className="text-2xl font-bold text-[#00FFC6]">{billingData.revenue.activeSubscriptions}</p>
                <p className="text-xs text-[#F3F4F6]/60 mt-1">Total tenants</p>
              </div>
              <Users className="h-8 w-8 text-[#4B0082]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1B1D23] border-[#4B0082]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F3F4F6]/80">Average Revenue</p>
                <p className="text-2xl font-bold text-[#00FFC6]">${billingData.revenue.averageRevenuePerTenant}</p>
                <p className="text-xs text-[#F3F4F6]/60 mt-1">Per tenant/month</p>
              </div>
              <CreditCard className="h-8 w-8 text-[#4B0082]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList className="bg-[#1B1D23] border border-[#4B0082]/30">
          <TabsTrigger value="tenants" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
            Tenant Billing
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[#4B0082] data-[state=active]:text-white">
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <Card className="bg-[#1B1D23] border-[#4B0082]/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#F3F4F6]">Tenant Billing Management</CardTitle>
                  <CardDescription className="text-[#F3F4F6]/70">
                    Manage billing for all tenants and subscriptions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="border-[#4B0082]/30 text-[#F3F4F6]">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mt-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B0082] w-4 h-4" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6]">
                    <Filter className="w-4 h-4 mr-2 text-[#4B0082]" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1B1D23] border-[#4B0082]/30">
                    <SelectItem value="all" className="text-[#F3F4F6]">All Status</SelectItem>
                    <SelectItem value="active" className="text-[#F3F4F6]">Active</SelectItem>
                    <SelectItem value="overdue" className="text-[#F3F4F6]">Overdue</SelectItem>
                    <SelectItem value="cancelled" className="text-[#F3F4F6]">Cancelled</SelectItem>
                    <SelectItem value="pending" className="text-[#F3F4F6]">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#4B0082]/30">
                    <TableHead className="text-[#F3F4F6]/80">Tenant</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Subscription</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Amount</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Status</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Next Billing</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Total Revenue</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants?.map((tenant) => (
                    <TableRow key={tenant.id} className="border-[#4B0082]/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-[#4B0082]" />
                          <div>
                            <p className="font-medium text-[#F3F4F6]">{tenant.name}</p>
                            <p className="text-sm text-[#F3F4F6]/60">{tenant.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#F3F4F6]">{tenant.subscriptionPlan}</p>
                          <p className="text-sm text-[#F3F4F6]/60">{tenant.billingCycle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-[#00FFC6]">${tenant.amount}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#F3F4F6]/60" />
                          <span className="text-[#F3F4F6]">{tenant.nextBillingDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-[#00FFC6]">${tenant.totalRevenue.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-[#4B0082]/30 text-[#F3F4F6]">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="border-[#4B0082]/30 text-[#F3F4F6]">
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
          <Card className="bg-[#1B1D23] border-[#4B0082]/30">
            <CardHeader>
              <CardTitle className="text-[#F3F4F6]">Subscription Plan Analytics</CardTitle>
              <CardDescription className="text-[#F3F4F6]/70">
                Performance metrics for each subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {billingData.subscriptions.map((plan) => (
                  <Card key={plan.id} className="bg-[#1B1D23]/50 border-[#4B0082]/20">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-[#F3F4F6]">{plan.planName}</h3>
                          <p className="text-sm text-[#F3F4F6]/60">{plan.activeSubscriptions} active subscriptions</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-[#F3F4F6]/60">Total Revenue</span>
                            <span className="font-semibold text-[#00FFC6]">${plan.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#F3F4F6]/60">Average Revenue</span>
                            <span className="font-semibold text-[#00FFC6]">${plan.averageRevenue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-[#F3F4F6]/60">Churn Rate</span>
                            <span className="font-semibold text-[#F3F4F6]">{plan.churnRate}%</span>
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
          <Card className="bg-[#1B1D23] border-[#4B0082]/30">
            <CardHeader>
              <CardTitle className="text-[#F3F4F6]">Payment History</CardTitle>
              <CardDescription className="text-[#F3F4F6]/70">
                Recent payment transactions and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#4B0082]/30">
                    <TableHead className="text-[#F3F4F6]/80">Tenant</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Amount</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Date</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Status</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Payment Method</TableHead>
                    <TableHead className="text-[#F3F4F6]/80">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.payments.map((payment) => (
                    <TableRow key={payment.id} className="border-[#4B0082]/20">
                      <TableCell>
                        <p className="font-medium text-[#F3F4F6]">{payment.tenantName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-[#00FFC6]">${payment.amount.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#F3F4F6]/60" />
                          <span className="text-[#F3F4F6]">{payment.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentStatusIcon(payment.status)}
                          <span className="capitalize text-[#F3F4F6]">{payment.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#F3F4F6]">{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="text-[#00FFC6] p-0">
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
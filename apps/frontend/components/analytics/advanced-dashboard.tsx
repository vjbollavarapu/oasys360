"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTenantData } from '@/hooks/use-tenant-data'

// Analytics data interfaces
interface AnalyticsMetric {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changeType: 'increase' | 'decrease' | 'neutral'
  format: 'currency' | 'number' | 'percentage'
  trend?: number[]
}

interface ChartDataPoint {
  date: string
  value: number
  category?: string
  label?: string
}

interface AnalyticsPeriod {
  label: string
  value: string
  days: number
}

interface AdvancedAnalyticsProps {
  tenantId?: string
  viewMode?: 'tenant' | 'platform' | 'firm'
}

const analyticsPeriods: AnalyticsPeriod[] = [
  { label: 'Last 7 Days', value: '7d', days: 7 },
  { label: 'Last 30 Days', value: '30d', days: 30 },
  { label: 'Last 90 Days', value: '90d', days: 90 },
  { label: 'Last 6 Months', value: '6m', days: 180 },
  { label: 'Last Year', value: '1y', days: 365 }
]

export function AdvancedAnalyticsDashboard({ tenantId, viewMode = 'tenant' }: AdvancedAnalyticsProps) {
  const { user, tenant } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'transactions', 'users'])

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState<{
    metrics: AnalyticsMetric[]
    chartData: { [key: string]: ChartDataPoint[] }
    insights: any[]
  }>({
    metrics: [],
    chartData: {},
    insights: []
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod, tenantId])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockMetrics: AnalyticsMetric[] = [
        {
          id: 'revenue',
          name: 'Total Revenue',
          value: 45670,
          previousValue: 38920,
          change: 17.3,
          changeType: 'increase',
          format: 'currency',
          trend: [32000, 35000, 38000, 41000, 43000, 45670]
        },
        {
          id: 'transactions',
          name: 'Transactions',
          value: 1247,
          previousValue: 1189,
          change: 4.9,
          changeType: 'increase',
          format: 'number',
          trend: [1050, 1120, 1189, 1205, 1230, 1247]
        },
        {
          id: 'users',
          name: 'Active Users',
          value: 89,
          previousValue: 94,
          change: -5.3,
          changeType: 'decrease',
          format: 'number',
          trend: [94, 92, 90, 88, 89, 89]
        },
        {
          id: 'conversion',
          name: 'Conversion Rate',
          value: 23.5,
          previousValue: 21.8,
          change: 7.8,
          changeType: 'increase',
          format: 'percentage',
          trend: [20.1, 21.2, 21.8, 22.5, 23.1, 23.5]
        },
        {
          id: 'avgValue',
          name: 'Avg Transaction Value',
          value: 367,
          previousValue: 327,
          change: 12.2,
          changeType: 'increase',
          format: 'currency',
          trend: [310, 315, 327, 340, 355, 367]
        },
        {
          id: 'satisfaction',
          name: 'User Satisfaction',
          value: 4.7,
          previousValue: 4.5,
          change: 4.4,
          changeType: 'increase',
          format: 'number',
          trend: [4.3, 4.4, 4.5, 4.6, 4.7, 4.7]
        }
      ]

      const mockChartData = {
        revenue: [
          { date: '2024-01-15', value: 32000, category: 'subscriptions' },
          { date: '2024-01-16', value: 35000, category: 'subscriptions' },
          { date: '2024-01-17', value: 38000, category: 'subscriptions' },
          { date: '2024-01-18', value: 41000, category: 'subscriptions' },
          { date: '2024-01-19', value: 43000, category: 'subscriptions' },
          { date: '2024-01-20', value: 45670, category: 'subscriptions' }
        ],
        transactions: [
          { date: '2024-01-15', value: 1050, category: 'journal_entries' },
          { date: '2024-01-16', value: 1120, category: 'invoices' },
          { date: '2024-01-17', value: 1189, category: 'payments' },
          { date: '2024-01-18', value: 1205, category: 'journal_entries' },
          { date: '2024-01-19', value: 1230, category: 'invoices' },
          { date: '2024-01-20', value: 1247, category: 'payments' }
        ]
      }

      const mockInsights = [
        {
          id: '1',
          type: 'positive',
          title: 'Revenue Growth Acceleration',
          description: 'Revenue growth has accelerated by 23% compared to the previous period.',
          impact: 'high',
          actionable: true
        },
        {
          id: '2',
          type: 'warning',
          title: 'User Engagement Decline',
          description: 'Active user count has decreased by 5.3%. Consider user retention strategies.',
          impact: 'medium',
          actionable: true
        },
        {
          id: '3',
          type: 'neutral',
          title: 'Seasonal Pattern Detected',
          description: 'Transaction volume shows consistent weekly patterns.',
          impact: 'low',
          actionable: false
        }
      ]

      setAnalyticsData({
        metrics: mockMetrics,
        chartData: mockChartData,
        insights: mockInsights
      })
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'number':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'decrease':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <Target className="w-5 h-5 text-blue-600" />
    }
  }

  const filteredMetrics = analyticsData.metrics.filter(metric => 
    selectedMetrics.includes(metric.id)
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive business intelligence and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {analyticsPeriods.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {filteredMetrics.map((metric) => (
          <Card key={metric.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatValue(metric.value, metric.format)}
                  </p>
                  {metric.change !== undefined && (
                    <div className="flex items-center gap-1">
                      {getChangeIcon(metric.changeType)}
                      <span className={`text-xs font-medium ${
                        metric.changeType === 'increase' ? 'text-green-600' : 
                        metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-16 h-12">
                  {/* Mini sparkline chart would go here */}
                  <div className="h-full bg-blue-200 rounded opacity-30"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financial" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <DollarSign className="w-4 h-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Users className="w-4 h-4 mr-2" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Target className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Revenue Trend</CardTitle>
                <CardDescription className="text-blue-600">
                  Revenue performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                    <p className="text-blue-700">Chart visualization would go here</p>
                    <p className="text-sm text-blue-600">
                      Revenue: {formatValue(analyticsData.metrics[0]?.value || 0, 'currency')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Transaction Volume</CardTitle>
                <CardDescription className="text-blue-600">
                  Daily transaction counts and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                    <p className="text-blue-700">Chart visualization would go here</p>
                    <p className="text-sm text-blue-600">
                      Transactions: {formatValue(analyticsData.metrics[1]?.value || 0, 'number')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Real-time Activity
              </CardTitle>
              <CardDescription className="text-blue-600">
                Live updates from your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        New journal entry created by Sarah Chen
                      </p>
                      <p className="text-xs text-blue-600">
                        {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      Accounting
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-green-700">Subscription Revenue</span>
                    <span className="font-semibold text-green-900">$38,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">One-time Payments</span>
                    <span className="font-semibold text-green-900">$7,220</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Refunds</span>
                    <span className="font-semibold text-red-700">-$1,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Infrastructure</span>
                    <span className="font-semibold text-purple-900">$4,850</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Support</span>
                    <span className="font-semibold text-purple-900">$2,340</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Marketing</span>
                    <span className="font-semibold text-purple-900">$3,120</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-900">Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-orange-700">Gross Profit</span>
                    <span className="font-semibold text-orange-900">$35,360</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Net Profit</span>
                    <span className="font-semibold text-orange-900">$25,050</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Profit Margin</span>
                    <span className="font-semibold text-orange-900">54.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Daily Active Users</span>
                    <span className="font-semibold text-blue-900">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Session Duration</span>
                    <span className="font-semibold text-blue-900">24m 30s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Pages per Session</span>
                    <span className="font-semibold text-blue-900">8.4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Uptime</span>
                    <span className="font-semibold text-green-700">99.97%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Avg Response Time</span>
                    <span className="font-semibold text-blue-900">142ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Error Rate</span>
                    <span className="font-semibold text-blue-900">0.03%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsData.insights.map((insight) => (
              <Card key={insight.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <CardTitle className="text-blue-900">{insight.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 mb-4">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={
                      insight.impact === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }>
                      {insight.impact} impact
                    </Badge>
                    {insight.actionable && (
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                        Take Action
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAnalyticsDashboard 
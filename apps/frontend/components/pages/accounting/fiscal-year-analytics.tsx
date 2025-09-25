"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface AnalyticsData {
  totalTransactions: number
  totalAmount: string
  completionRate: number
  complianceScore: number
  periodStatus: string
  daysRemaining: number
}

const analyticsData: AnalyticsData = {
  totalTransactions: 15847,
  totalAmount: "$2,847,392",
  completionRate: 87.5,
  complianceScore: 94.2,
  periodStatus: "Active",
  daysRemaining: 23,
}

export function FiscalYearAnalytics() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.totalTransactions.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Current fiscal year</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.totalAmount}</p>
              <p className="text-xs text-blue-600 mt-1">All transactions</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.completionRate}%</p>
              <Progress value={analyticsData.completionRate} className="mt-2 h-2" />
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Compliance Score</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.complianceScore}%</p>
              <Progress value={analyticsData.complianceScore} className="mt-2 h-2" />
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Building2,
  Clock,
  Plus,
  Archive,
} from "lucide-react"
import { useOrganization } from "@/hooks/use-organization"
import { FiscalYearAnalytics } from "./fiscal-year-analytics"
import { FiscalPeriodsTable } from "./fiscal-periods-table"

const mockFiscalYears = [
  {
    id: 'fy-2024',
    name: 'FY 2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'open' as const,
    totalRevenue: 3250000,
    totalExpenses: 2456000,
    netIncome: 794000,
    transactionCount: 2891,
    complianceScore: 94,
  },
  {
    id: 'fy-2023',
    name: 'FY 2023',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'closed' as const,
    totalRevenue: 2890000,
    totalExpenses: 2145000,
    netIncome: 745000,
    transactionCount: 1823,
    complianceScore: 96,
  },
]

export function FiscalYearManagement() {
  const { currentOrganization } = useOrganization()
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Open</Badge>
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>
      case 'archived':
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Fiscal Year Management</h2>
          <p className="text-blue-600">Manage fiscal years and periods for {currentOrganization?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
            <Archive className="w-4 h-4 mr-2" />
            Archive Old Years
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Fiscal Year
          </Button>
        </div>
      </div>

      {/* Organization Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Current Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Organization</p>
              <p className="text-lg font-semibold text-blue-900">{currentOrganization?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Currency</p>
              <p className="text-lg font-semibold text-blue-900">{currentOrganization?.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Fiscal Year Start</p>
              <p className="text-lg font-semibold text-blue-900">{currentOrganization?.fiscalYearStart}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      <FiscalYearAnalytics />

      {/* Fiscal Years Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Fiscal Years Overview
          </CardTitle>
          <CardDescription className="text-blue-600">
            Manage and review fiscal years performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFiscalYears.map((year) => (
              <div
                key={year.id}
                className="p-4 bg-white rounded-lg border border-blue-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-900">{year.name}</h3>
                      {getStatusBadge(year.status)}
                    </div>
                    <p className="text-sm text-blue-600">{year.startDate} to {year.endDate}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-blue-600">Revenue</p>
                      <p className="font-semibold text-blue-900">${year.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Net Income</p>
                      <p className="font-semibold text-blue-900">${year.netIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Transactions</p>
                      <p className="font-semibold text-blue-900">{year.transactionCount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                    <FileText className="w-4 h-4 mr-1" />
                    Reports
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                  {year.status === 'open' && (
                    <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Settings className="w-4 h-4 mr-1" />
                      Close Year
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fiscal Periods Table */}
      <FiscalPeriodsTable />

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Actions</CardTitle>
          <CardDescription className="text-blue-600">
            Common fiscal year management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700">Create Period</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700">Year-End Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50">
              <Settings className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700">Settings</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50">
              <Archive className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700">Archive</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
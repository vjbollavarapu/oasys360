"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  Receipt,
  BarChart3,
  Brain,
  RefreshCw,
  Plus,
  Zap,
  Clock,
  FileText,
  Landmark,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Calculator,
} from "lucide-react"
import { FiscalYearManagement } from "./fiscal-year-management"
import { SettingsPage } from "./settings"
import { JournalEntriesTab } from "./journal-entries"
import { GLAccountsTab } from "./gl-accounts"
import { PettyCashTab } from "./petty-cash"
import { CreditDebitNotesTab } from "./credit-debit-notes"
import { BankReconciliation } from "./bank-reconciliation"
import { useToast } from "@/hooks/use-toast"

// Financial metrics for overview
const financialMetrics = {
  totalRevenue: "$1,247,392",
  totalExpenses: "$789,456",
  totalTax: "$91,584",
  netIncome: "$366,352", // Adjusted for tax (457,936 - 91,584)
  totalAssets: "$2,847,392",
  totalLiabilities: "$534,892",
  equity: "$2,312,500",
  revenueChange: "+15.2%",
  expenseChange: "+8.7%",
  taxRate: "7.3%", // Tax as % of revenue
  taxChange: "+12.1%", // Tax change from previous period
  profitMargin: "29.4%", // Adjusted margin after tax
}

export function AccountingOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const handleSyncData = async () => {
    setIsSyncing(true)
    try {
      // Simulate API call to sync data
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Here you would typically call your actual sync API
      // await syncAccountingData()
      toast({
        title: "Success",
        description: "Data synced successfully",
      })
    } catch (error) {
      console.error("Failed to sync data:", error)
      toast({
        title: "Error",
        description: "Failed to sync data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
              <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounting Overview</h1>
            <p className="text-muted-foreground mt-2">Manage your financial data with AI-powered insights</p>
          </div>
                  <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full" 
              onClick={handleSyncData}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Button>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 p-1 bg-blue-50 rounded-2xl min-w-max">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="journal" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Journal
          </TabsTrigger>
          <TabsTrigger value="gl-accounts" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            G/L Accounts
          </TabsTrigger>
          <TabsTrigger value="petty-cash" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Petty Cash
          </TabsTrigger>
          <TabsTrigger value="credit-debit" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Credit/Debit
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Reconciliation
          </TabsTrigger>
          <TabsTrigger value="fiscal-years" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Fiscal Years
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Settings
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">{financialMetrics.totalRevenue}</p>
                    <p className="text-xs text-blue-600 mt-1">{financialMetrics.revenueChange} from last period</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-blue-900">{financialMetrics.totalExpenses}</p>
                    <p className="text-xs text-blue-600 mt-1">{financialMetrics.expenseChange} from last period</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Total Tax</p>
                    <p className="text-2xl font-bold text-orange-900">{financialMetrics.totalTax}</p>
                    <p className="text-xs text-orange-600 mt-1">{financialMetrics.taxRate} effective rate</p>
                  </div>
                  <Receipt className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Net Income</p>
                    <p className="text-2xl font-bold text-green-900">{financialMetrics.netIncome}</p>
                    <p className="text-xs text-green-600 mt-1">{financialMetrics.profitMargin} profit margin</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-blue-600">
                Common accounting tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                  onClick={() => setActiveTab('journal')}
                >
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-700">New Journal Entry</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                  onClick={() => setActiveTab('petty-cash')}
                >
                  <Receipt className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-700">Petty Cash</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                  onClick={() => setActiveTab('reconciliation')}
                >
                  <Landmark className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-700">Bank Reconciliation</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                  onClick={() => {
                    // Navigate to reports page since it's a separate module
                    window.location.href = '/reports';
                  }}
                >
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-700">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="text-blue-600">
                Smart recommendations based on your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-blue-700 text-sm">
                    Your office expenses are 15% higher than usual this month. Consider reviewing recurring subscriptions.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-blue-700 text-sm">
                    Cash flow is projected to be positive for the next 3 months based on current trends.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-blue-700 text-sm">
                    3 unmatched bank transactions require attention in the reconciliation module.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-blue-700 text-sm">
                    Tax obligations for Q1 2024 are due March 31st. Current liability: {financialMetrics.totalTax}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <JournalEntriesTab />
        </TabsContent>

        <TabsContent value="gl-accounts">
          <GLAccountsTab />
        </TabsContent>

        <TabsContent value="petty-cash">
          <PettyCashTab />
        </TabsContent>

        <TabsContent value="credit-debit">
          <CreditDebitNotesTab />
        </TabsContent>

        <TabsContent value="reconciliation">
          <BankReconciliation />
        </TabsContent>

        <TabsContent value="fiscal-years">
          <FiscalYearManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useClientData } from '@/hooks/use-tenant-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Calendar, 
  Users,
  Settings,
  Eye,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface ClientPageProps {
  params: {
    clientId: string
  }
}

export default function ClientPage({ params }: ClientPageProps) {
  const { clientId } = params
  const { user, tenant, isLoading: authLoading } = useAuth()
  const { clientData, isLoading: dataLoading } = useClientData(clientId)
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not firm user
  useEffect(() => {
    if (!authLoading && (!user || tenant?.type !== 'firm')) {
      window.location.href = '/accounting'
    }
  }, [user, tenant, authLoading])

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading client data...
        </div>
      </div>
    )
  }

  if (!user || tenant?.type !== 'firm') {
    return null
  }

  if (!clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Client Not Found</CardTitle>
            <CardDescription>
              The requested client could not be found or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/firm">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Firm Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/firm">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Firm
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              {clientData.client.name}
            </h1>
            <p className="text-muted-foreground mt-1">{clientData.client.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Active Client
          </Badge>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Client Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 gap-1 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="accounting" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Accounting
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Reports
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Documents
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            Team Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Client Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">{clientData.financials.revenue}</p>
                    <p className="text-xs text-blue-600 mt-1">Year to date</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Profit</p>
                    <p className="text-2xl font-bold text-green-900">{clientData.financials.profit}</p>
                    <p className="text-xs text-green-600 mt-1">Net profit</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Expenses</p>
                    <p className="text-2xl font-bold text-orange-900">{clientData.financials.expenses}</p>
                    <p className="text-xs text-orange-600 mt-1">Total expenses</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-blue-600">
                Latest financial activity for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientData.recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-900">{transaction.description}</p>
                      <p className="text-sm text-blue-600">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <Badge 
                        className={
                          transaction.type === 'income' 
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Client Accounting Modules</CardTitle>
              <CardDescription className="text-blue-600">
                Access accounting features for {clientData.client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-white border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Journal Entries</h3>
                    <p className="text-sm text-blue-600 mt-1">Manage client transactions</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Invoicing</h3>
                    <p className="text-sm text-blue-600 mt-1">Client billing management</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Bank Reconciliation</h3>
                    <p className="text-sm text-blue-600 mt-1">Match transactions</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Client Reports</CardTitle>
              <CardDescription className="text-blue-600">
                Generate reports for {clientData.client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Financial Statements</h3>
                    <p className="text-sm text-blue-600 mb-4">P&L, Balance Sheet, Cash Flow</p>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                      <Eye className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Tax Reports</h3>
                    <p className="text-sm text-blue-600 mb-4">Tax preparation documents</p>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
                      <Eye className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Client Documents</CardTitle>
              <CardDescription className="text-blue-600">
                Shared documents and files for {clientData.client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">Document management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Access
              </CardTitle>
              <CardDescription className="text-blue-600">
                Manage who has access to {clientData.client.name}'s data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">Team access management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
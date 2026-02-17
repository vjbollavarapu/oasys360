"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  Settings,
  Eye,
  FileText
} from "lucide-react"

export function ComplianceReportsOverview() {
  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
          <p className="text-muted-foreground">
            Generate and view compliance reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground mt-2">Overall compliance</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reports Generated</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Violations</CardTitle>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Audit</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 days</div>
                <p className="text-xs text-muted-foreground">Ago</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Reports</CardTitle>
              <CardDescription>
                Latest generated compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Q4 2024 Compliance Report</p>
                      <p className="text-sm text-muted-foreground">Generated 2 days ago - 98.5% compliance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Passed</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Monthly Audit Report</p>
                      <p className="text-sm text-muted-foreground">Generated 1 week ago - 95.2% compliance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Annual Compliance Review</p>
                      <p className="text-sm text-muted-foreground">Generated 2 weeks ago - 99.1% compliance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>
                View and manage compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Compliance reports interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Manage compliance report templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Report templates interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

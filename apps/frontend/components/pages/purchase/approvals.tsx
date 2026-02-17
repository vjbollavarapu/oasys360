"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Eye,
  ShoppingCart,
  User
} from "lucide-react"

export function ApprovalsOverview() {
  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Approvals</h1>
          <p className="text-muted-foreground">
            Manage purchase approval workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Today's approvals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3h</div>
                <p className="text-xs text-muted-foreground">Average</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Approvals</CardTitle>
              <CardDescription>
                Latest purchase approval activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Office Supplies Order</p>
                      <p className="text-sm text-muted-foreground">$1,234.56 - Approved by John Doe</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">IT Equipment Purchase</p>
                      <p className="text-sm text-muted-foreground">$5,678.90 - Pending approval</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Marketing Materials</p>
                      <p className="text-sm text-muted-foreground">$2,345.67 - Rejected by Jane Smith</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Purchase requests awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Pending approvals interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                View past approval decisions and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Approval history interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

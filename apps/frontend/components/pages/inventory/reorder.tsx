"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle,
  Plus,
  Settings,
  Eye,
  Clock
} from "lucide-react"

export function ReorderPointsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reorder Points</h1>
          <p className="text-muted-foreground">
            Manage inventory reorder points and alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-2">Reorder rules</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <p className="text-xs text-muted-foreground mt-2">Items below threshold</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Auto Orders</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-2">Pending orders</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground mt-2">Stockout prevention</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that need reordering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">Logitech MX Master Mouse</p>
                      <p className="text-sm text-muted-foreground">Current: 3 | Reorder: 10</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                    <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Critical</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium">Office Chair - Ergonomic</p>
                      <p className="text-sm text-muted-foreground">Current: 0 | Reorder: 5</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                    <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Low</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">Wireless Keyboard</p>
                      <p className="text-sm text-muted-foreground">Current: 8 | Reorder: 15</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                    <Badge className="rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Warning</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Reorder Rules</CardTitle>
              <CardDescription>
                Configure reorder point rules and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Reorder rules interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>
                View and manage stock alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Stock alerts interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

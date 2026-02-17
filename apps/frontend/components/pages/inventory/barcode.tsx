"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Barcode,
  Camera,
  Scan,
  Settings,
  Eye,
  Clock
} from "lucide-react"

export function BarcodeScanningOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barcode Scanning</h1>
          <p className="text-muted-foreground">
            Scan and manage inventory barcodes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="rounded-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scans Today</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Barcode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground mt-2">Barcodes scanned</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <Scan className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground mt-2">Successful scans</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Items Found</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground mt-2">In inventory</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Scan Time</CardTitle>
                <div className="p-3 bg-gray-100 dark:bg-gray-900/20 rounded-2xl">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground mt-2">Per barcode</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                Latest barcode scanning activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <Barcode className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">SKU-2024-001</p>
                      <p className="text-sm text-muted-foreground">Laptop - Dell XPS 13</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">2 min ago</p>
                    <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Found</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Barcode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">SKU-2024-002</p>
                      <p className="text-sm text-muted-foreground">Mouse - Logitech MX Master</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">5 min ago</p>
                    <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Found</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Barcode className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">Unknown Barcode</p>
                      <p className="text-sm text-muted-foreground">Not found in inventory</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">8 min ago</p>
                    <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Not Found</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Barcode Scanner</CardTitle>
              <CardDescription>
                Scan barcodes to find inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Barcode scanner interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>
                View past barcode scanning activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Barcode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Scan history interface will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
